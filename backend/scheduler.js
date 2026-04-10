// ── Birthday Auto-Send Scheduler ─────────────────────────────
// Runs every day at 8:00 AM (server time) and sends birthday
// wish emails to all students whose birthday matches today.
// This runs INSIDE the Node server — no separate process needed.

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const db = require('./config/db');
const { decrypt } = require('./utils/crypto');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

let currentCronTask = null;

// Helper function to create a transporter dynamically from DB settings
const createTransporter = () => {
    try {
        if (!SMTP_HOST || !Number.isInteger(SMTP_PORT)) {
            console.warn('[Scheduler] Missing SMTP_HOST/SMTP_PORT in environment — skipping auto-send.');
            return null;
        }
        const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('email_user', 'email_pass')").all();
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        if (settings.email_user && settings.email_pass) {
            return {
                transporter: nodemailer.createTransport({
                    host: SMTP_HOST,
                    port: SMTP_PORT,
                    secure: SMTP_SECURE,
                    auth: {
                        user: settings.email_user,
                        pass: decrypt(settings.email_pass)
                    }
                }),
                emailUser: settings.email_user
            };
        } else {
            return null;
        }
    } catch (err) {
        console.error('[Scheduler] Error loading email credentials from DB', err);
        return null;
    }
};

/**
 * Core logic: find today's birthdays and send emails.
 * Called by the cron job AND can be called manually for testing.
 * Returns a summary string for logging.
 */
async function runDailyWishes() {
    const mailConfig = createTransporter();
    if (!mailConfig || !mailConfig.transporter) {
        console.warn('[Scheduler] ⚠️  Email credentials not set in DB — skipping auto-send.');
        return;
    }
    const { transporter, emailUser } = mailConfig;
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    try {
        const rows = db.prepare(`SELECT name, email FROM birthdays WHERE strftime('%m-%d', dob) = ?`).all(todayStr);
        if (!rows || rows.length === 0) {
            console.log(`[Scheduler] ${new Date().toLocaleString()} — No birthdays today.`);
            return;
        }
        let templateStr;
        const templateRow = db.prepare("SELECT value FROM settings WHERE key = 'email_template'").get();
        if (templateRow && templateRow.value) {
            templateStr = templateRow.value;
        } else {
            templateStr = require('./config/defaultTemplate');
        }
        const emailPromises = rows
            .filter(bday => bday.email)
            .map(bday => {
                const html = templateStr.replace(/\$\{bday\.name\}/g, bday.name);
                return transporter.sendMail({
                    from: `"Birthday Reminder Bot" <${emailUser}>`,
                    to: bday.email,
                    subject: `Happy Birthday, ${bday.name}! 🎉`,
                    text: `Wishing you a fantastic birthday, ${bday.name}!\n\nBest wishes,\nBirthday Reminder — Gharda Institute of Technology`,
                    html
                }).catch(e => {
                    console.error(`[Scheduler] Failed to send to ${bday.email}:`, e.message);
                    return null;
                });
            });
        const results = await Promise.all(emailPromises);
        const sent = results.filter(r => r !== null).length;
        console.log(`[Scheduler] ✅ ${new Date().toLocaleString()} — Sent ${sent}/${rows.filter(b => b.email).length} birthday emails.`);
    } catch (err) {
        console.error('[Scheduler] DB error:', err.message);
    }
}

/**
 * Start or restart the cron schedule based on DB settings.
 */
function startScheduler() {
    let schedule = process.env.CRON_SCHEDULE || '';
    try {
        const row = db.prepare("SELECT value FROM settings WHERE key = 'auto_send_time'").get();
        if (row && row.value) {
            const timeParts = row.value.split(':'); // Expected "HH:MM"
            if (timeParts.length === 2) {
                const hour = parseInt(timeParts[0], 10);
                const minute = parseInt(timeParts[1], 10);
                if (!isNaN(hour) && !isNaN(minute)) {
                    schedule = `${minute} ${hour} * * *`;
                }
            }
        }
    } catch (err) {
        console.error('[Scheduler] Error reading auto_send_time from DB', err);
    }
    if (!schedule) {
        // Fallback keeps auto-send working even when CRON_SCHEDULE is not provided.
        schedule = '0 8 * * *';
        console.warn('[Scheduler] Missing CRON_SCHEDULE and invalid auto_send_time — using fallback 08:00 IST.');
    }
    if (currentCronTask) {
        currentCronTask.stop();
        console.log('[Scheduler] ⏹️  Stopped previous cron task.');
    }
    currentCronTask = cron.schedule(schedule, () => {
        console.log('[Scheduler] ⏰ Cron triggered — sending birthday wishes...');
        runDailyWishes();
    }, {
        timezone: 'Asia/Kolkata'   // IST
    });
    console.log(`[Scheduler] 🕐 Auto-send active — fires at: ${schedule} (IST)`);
}

module.exports = { startScheduler, runDailyWishes };
