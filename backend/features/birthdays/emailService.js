const db = require('../../config/db');
const nodemailer = require('nodemailer');
const { decrypt } = require('../../utils/crypto');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

function createTransporter() {
    try {
        if (!SMTP_HOST || !Number.isInteger(SMTP_PORT)) {
            console.warn('[Email] Missing SMTP_HOST/SMTP_PORT in environment.');
            return null;
        }

        const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('email_user', 'email_pass')").all();
        const settings = {};
        rows.forEach((r) => {
            settings[r.key] = r.value;
        });

        if (!settings.email_user || !settings.email_pass) {
            return null;
        }

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
    } catch (err) {
        console.error('[Email] Error loading or decrypting email settings:', err);
        return null;
    }
}

function getEmailTemplate() {
    try {
        const templateRow = db.prepare("SELECT value FROM settings WHERE key = 'email_template'").get();
        return templateRow ? templateRow.value : require('../../config/defaultTemplate');
    } catch (err) {
        return require('../../config/defaultTemplate');
    }
}

function buildWishPayload(emailUser, to, name, html) {
    return {
        from: `"Birthday Reminder Bot" <${emailUser}>`,
        to,
        subject: `Happy Birthday, ${name}! 🎉`,
        text: `Wishing you a fantastic birthday, ${name}!\n\nBest wishes,\nBirthday Reminder - Gharda Institute of Technology`,
        html
    };
}

module.exports = {
    createTransporter,
    getEmailTemplate,
    buildWishPayload
};
