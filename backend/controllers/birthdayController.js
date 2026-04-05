// ✅ FIX: dotenv removed from here — loaded once at server.js startup
const db = require('../config/db');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const { decrypt } = require('../utils/crypto');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

// Helper function to create a transporter dynamically from DB settings (sync, better-sqlite3)
function createTransporter() {
    try {
        if (!SMTP_HOST || !Number.isInteger(SMTP_PORT)) {
            console.warn('[Email] Missing SMTP_HOST/SMTP_PORT in environment.');
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
        console.error('[Email] Error loading or decrypting email settings:', err);
        return null;
    }
}

// ── CRUD ─────────────────────────────────────────────────────

const addBirthday = (req, res) => {
    const { name, dob, note, email, dept } = req.body;
    if (!name || !dob) return res.status(400).json({ success: false, message: "Name and DOB required." });

    try {
        const result = db.prepare("INSERT INTO birthdays (name, dob, note, email, dept) VALUES (?, ?, ?, ?, ?)")
            .run(name, dob, note || "", email || "", dept || "");
        const newId = result.lastInsertRowid;
        res.json({ success: true, message: "Birthday added successfully!", id: newId });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getBirthdays = (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM birthdays ORDER BY dob ASC").all();
        res.json({ success: true, birthdays: rows });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ✅ Returns only today's birthdays (used by homepage) + counts for Overview
const getTodaysBirthdays = (req, res) => {
    try {
        const today = new Date();
        const curM = today.getMonth(); // 0-indexed
        const curD = today.getDate();
        const monthFilter = String(curM + 1).padStart(2, '0');
        const dayFilter = String(curD).padStart(2, '0');
        const todayStr = `${monthFilter}-${dayFilter}`;

        const rows = db.prepare("SELECT dob, name, id, note, email, dept FROM birthdays").all();
        
        let todayBirthdays = [];
        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;

        // Week bounds
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        rows.forEach(r => {
            if (!r.dob) return;
            const parts = r.dob.split('-');
            if (parts.length !== 3) return;
            const bMonth = parseInt(parts[1], 10) - 1; // 0-indexed
            const bDate = parseInt(parts[2], 10);

            if (bMonth === curM && bDate === curD) {
                todayCount++;
                todayBirthdays.push(r);
            }
            if (bMonth === curM) {
                monthCount++;
            }
            
            const bThisYear = new Date(today.getFullYear(), bMonth, bDate);
            if (bThisYear >= startOfWeek && bThisYear <= endOfWeek) {
                weekCount++;
            }
        });

        res.json({ 
            success: true, 
            birthdays: todayBirthdays,
            stats: { today: todayCount, week: weekCount, month: monthCount }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const updateBirthday = (req, res) => {
    const { id } = req.params;
    const { name, dob, note, email, dept } = req.body;
    if (!name || !dob) return res.status(400).json({ success: false, message: 'Name and DOB required.' });

    try {
        const result = db.prepare('UPDATE birthdays SET name = ?, dob = ?, note = ?, email = ?, dept = ? WHERE id = ?')
            .run(name, dob, note || '', email || '', dept || '', id);
        if (result.changes === 0) return res.status(404).json({ success: false, message: 'Birthday not found.' });
        res.json({ success: true, message: 'Birthday updated.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const deleteBirthday = (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare('DELETE FROM birthdays WHERE id = ?').run(id);
        if (result.changes === 0) return res.status(404).json({ success: false, message: 'Birthday not found.' });
        res.json({ success: true, message: 'Birthday deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ✅ Returns birthdays in the next 7 days
const getUpcomingBirthdays = (req, res) => {
    try {
        const today = new Date();
        const upcoming = [];
        
        // We'll check for the next 7 days
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${month}-${day}`;
            
            const rows = db.prepare(`SELECT * FROM birthdays WHERE strftime('%m-%d', dob) = ?`).all(dateStr);
            rows.forEach(r => {
                // Add "days_until" property for frontend sorting/display
                r.days_until = i;
                upcoming.push(r);
            });
        }
        
        res.json({ success: true, birthdays: upcoming });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getStats = (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDate = today.getDate();
        
        const rows = db.prepare("SELECT dob FROM birthdays").all();
        
        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;
        const totalCount = rows.length;

        // Calculate week bounds
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        rows.forEach(r => {
            if (!r.dob) return;
            // dob is YYYY-MM-DD
            const parts = r.dob.split('-');
            if (parts.length !== 3) return;
            const bMonth = parseInt(parts[1], 10) - 1; // 0-indexed
            const bDate = parseInt(parts[2], 10);
            
            if (bMonth === currentMonth && bDate === currentDate) {
                todayCount++;
            }
            if (bMonth === currentMonth) {
                monthCount++;
            }
            
            // This week check
            const bThisYear = new Date(today.getFullYear(), bMonth, bDate);
            if (bThisYear >= startOfWeek && bThisYear <= endOfWeek) {
                weekCount++;
            }
        });

        res.json({ success: true, stats: { today: todayCount, week: weekCount, month: monthCount, total: totalCount } });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ✅ FIX: New endpoint — sends email wishes for today's birthdays
const sendBirthdayWishes = async (req, res) => {
    let mailConfig;
    try {
        mailConfig = createTransporter();
    } catch (err) {
        console.error('[Email] createTransporter threw', err);
        return res.status(500).json({ success: false, message: "Error loading email credentials." });
    }

    if (!mailConfig || !mailConfig.transporter) {
        return res.status(500).json({ success: false, message: "Email credentials not configured in Admin Settings." });
    }

    const { transporter, emailUser } = mailConfig;

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${month}-${day}`;

    let rows;
    try {
        rows = db.prepare(`SELECT name, email FROM birthdays WHERE strftime('%m-%d', dob) = ?`).all(todayStr);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
    if (rows.length === 0) {
        return res.json({ success: true, message: "No birthdays today to send emails to." });
    }

    let templateStr;
    try {
        const templateRow = db.prepare("SELECT value FROM settings WHERE key = 'email_template'").get();
        templateStr = templateRow ? templateRow.value : require('../config/defaultTemplate');
    } catch (err) {
        templateStr = require('../config/defaultTemplate');
    }

    const emailPromises = rows
        .filter(bday => bday.email)
        .map(bday => {
            const personalizedHtml = templateStr.replace(/\$\{bday\.name\}/g, bday.name);
            return transporter.sendMail({
                from: `"Birthday Reminder Bot" <${emailUser}>`,
                to: bday.email,
                subject: `Happy Birthday, ${bday.name}! 🎉`,
                text: `Wishing you a fantastic birthday, ${bday.name}!\n\nBest wishes,\nBirthday Reminder — Gharda Institute of Technology`,
                html: personalizedHtml
            }).catch(e => {
                console.error(`[Manual Wishes] Failed to send to ${bday.email}:`, e.message);
                return null;
            });
        });
    const results = await Promise.all(emailPromises);
    const sent = results.filter(r => r !== null).length;
    res.json({ success: true, message: `Sent ${sent}/${rows.filter(b => b.email).length} birthday emails.` });
};

// New public API endpoint for home page action widget
const sendTodayBirthdayWishes = async (req, res) => {
    let mailConfig;
    try {
        mailConfig = createTransporter();
    } catch (err) {
        console.error('[Email] createTransporter threw', err);
        return res.status(500).json({ success: false, message: 'Error loading email credentials.' });
    }

    if (!mailConfig || !mailConfig.transporter) {
        return res.status(500).json({ success: false, message: 'Email credentials not configured in Admin Settings.' });
    }

    const { transporter, emailUser } = mailConfig;
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let rows;
    try {
        rows = db.prepare(`SELECT name, email FROM birthdays WHERE strftime('%m-%d', dob) = ?`).all(todayStr);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }

    if (rows.length === 0) {
        return res.json({ success: true, sent: 0, message: 'No birthdays today' });
    }

    let templateStr;
    try {
        const templateRow = db.prepare("SELECT value FROM settings WHERE key = 'email_template'").get();
        templateStr = templateRow ? templateRow.value : require('../config/defaultTemplate');
    } catch (err) {
        templateStr = require('../config/defaultTemplate');
    }

    const emailPromises = rows
        .filter(bday => bday.email)
        .map(bday => {
            const personalizedHtml = templateStr.replace(/\$\{bday\.name\}/g, bday.name);
            return transporter.sendMail({
                from: `"Birthday Reminder Bot" <${emailUser}>`,
                to: bday.email,
                subject: `Happy Birthday, ${bday.name}! 🎉`,
                text: `Wishing you a fantastic birthday, ${bday.name}!\n\nBest wishes,\nBirthday Reminder — Gharda Institute of Technology`,
                html: personalizedHtml
            }).then(() => true).catch(e => {
                console.error(`[Today's Wishes] Failed to send to ${bday.email}:`, e.message);
                return false;
            });
        });

    const results = await Promise.all(emailPromises);
    const sent = results.filter(Boolean).length;
    return res.json({ success: true, sent });
};

const sendTodayBirthdayWishById = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Birthday ID required' });

    const person = db.prepare('SELECT id, name, email, dob FROM birthdays WHERE id = ?').get(id);
    if (!person) return res.status(404).json({ success: false, message: 'Student not found' });

    if (!person.email) return res.status(400).json({ success: false, message: 'No email available for this student' });

    const today = new Date();
    const target = new Date(person.dob);
    const isBirthdayToday = (target.getMonth() === today.getMonth() && target.getDate() === today.getDate());
    if (!isBirthdayToday) {
        return res.status(400).json({ success: false, message: 'Birthday is not today' });
    }

    let mailConfig;
    try {
        mailConfig = createTransporter();
    } catch (err) {
        console.error('[Email] createTransporter threw', err);
        return res.status(500).json({ success: false, message: 'Error loading email credentials.' });
    }

    if (!mailConfig || !mailConfig.transporter) {
        return res.status(500).json({ success: false, message: 'Email credentials not configured in Admin Settings.' });
    }

    let templateStr;
    try {
        const templateRow = db.prepare("SELECT value FROM settings WHERE key = 'email_template'").get();
        templateStr = templateRow ? templateRow.value : require('../config/defaultTemplate');
    } catch (err) {
        templateStr = require('../config/defaultTemplate');
    }

    const { transporter, emailUser } = mailConfig;
    const personalizedHtml = templateStr.replace(/\$\{bday\.name\}/g, person.name);

    try {
        await transporter.sendMail({
            from: `"Birthday Reminder Bot" <${emailUser}>`,
            to: person.email,
            subject: `Happy Birthday, ${person.name}! 🎉`,
            text: `Wishing you a fantastic birthday, ${person.name}!\n\nBest wishes,\nBirthday Reminder — Gharda Institute of Technology`,
            html: personalizedHtml
        });

        return res.json({ success: true, name: person.name });
    } catch (error) {
        console.error(`[sendTodayBirthdayWishById] Failed to send to ${person.email}:`, error.message);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};

// ── Bulk Upload ──────────────────────────────────────────────

const uploadExcelBirthdays = (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        // Helper: normalise DOB to YYYY-MM-DD
        const parseDob = (raw) => {
            if (!raw && raw !== 0) return '';
            const s = String(raw).trim().replace(/^="?|"?$/g, '');
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
            const num = Number(s);
            if (!isNaN(num) && num > 1000) {
                const excelEpoch = new Date(1899, 11, 30);
                const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
                const yyyy = jsDate.getFullYear();
                const mm = String(jsDate.getMonth() + 1).padStart(2, '0');
                const dd = String(jsDate.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
            }
            return s;
        };
        let insertCount = 0;
        let updateCount = 0;
        let skipCount = 0;
        const errorRows = [];

        for (let index = 0; index < data.length; index++) {
            const row = data[index];
            const rowNumber = index + 2; // header row assumed at line 1
            const name = (row.Name || row.name || '').trim();
            const dob = parseDob(row.DOB || row.dob);
            const email = (row.Email || row.email || '').trim();
            const note = (row.Note || row.note || '').trim();
            const dept = (row.Dept || row.dept || row.Department || row.department || '').trim();

            if (!name || !dob) {
                errorRows.push({ row: rowNumber, reason: 'Missing required Name or DOB' });
                continue;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
                errorRows.push({ row: rowNumber, reason: `Invalid DOB format: ${dob}` });
                continue;
            }

            const existing = db.prepare('SELECT id FROM birthdays WHERE LOWER(name) = LOWER(?)').get(name);
            if (existing) {
                db.prepare('UPDATE birthdays SET dob = ?, email = ?, note = ?, dept = ? WHERE id = ?')
                    .run(dob, email, note, dept, existing.id);
                updateCount++;
            } else {
                db.prepare('INSERT INTO birthdays (name, dob, email, note, dept) VALUES (?, ?, ?, ?, ?)')
                    .run(name, dob, email, note, dept);
                insertCount++;
            }
            // Do not create student user accounts automatically when importing
        }
        fs.unlinkSync(req.file.path);
        const parts = [];
        if (insertCount) parts.push(`${insertCount} added`);
        if (updateCount) parts.push(`${updateCount} updated`);
        if (errorRows.length) parts.push(`${errorRows.length} skipped with errors`);

        const response = {
            success: true,
            message: `Import complete: ${parts.join(', ')}.`,
            details: {}
        };
        if (errorRows.length) response.details.errors = errorRows;

        res.json(response);
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = {
    addBirthday,
    getBirthdays,
    getTodaysBirthdays,
    getUpcomingBirthdays,
    getStats,
    updateBirthday,
    deleteBirthday,
    uploadExcelBirthdays,
    sendBirthdayWishes,
    sendTodayBirthdayWishes,
    sendTodayBirthdayWishById,
    sendIndividualWish: sendTodayBirthdayWishById
};
