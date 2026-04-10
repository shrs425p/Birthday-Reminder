const db = require('../../config/db');
const { createTransporter, getEmailTemplate, buildWishPayload } = require('./emailService');

const sendBirthdayWishes = async (req, res) => {
    let mailConfig;
    try {
        mailConfig = createTransporter();
    } catch (err) {
        console.error('[Email] createTransporter threw', err);
        return res.status(500).json({ success: false, message: 'Error loading email credentials.' });
    }

    if (!mailConfig || !mailConfig.transporter) {
        return res
            .status(500)
            .json({ success: false, message: 'Email credentials not configured in Admin Settings.' });
    }

    const { transporter, emailUser } = mailConfig;
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let rows;
    try {
        rows = db.prepare("SELECT name, email FROM birthdays WHERE strftime('%m-%d', dob) = ?").all(todayStr);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }

    if (rows.length === 0) {
        return res.json({ success: true, message: 'No birthdays today to send emails to.' });
    }

    const templateStr = getEmailTemplate();

    const emailPromises = rows
        .filter((bday) => bday.email)
        .map((bday) => {
            const personalizedHtml = templateStr.replace(/\$\{bday\.name\}/g, bday.name);
            return transporter
                .sendMail(buildWishPayload(emailUser, bday.email, bday.name, personalizedHtml))
                .catch((e) => {
                    console.error(`[Manual Wishes] Failed to send to ${bday.email}:`, e.message);
                    return null;
                });
        });

    const results = await Promise.all(emailPromises);
    const sent = results.filter((r) => r !== null).length;

    return res.json({
        success: true,
        message: `Sent ${sent}/${rows.filter((b) => b.email).length} birthday emails.`
    });
};

const sendTodayBirthdayWishes = async (req, res) => {
    let mailConfig;
    try {
        mailConfig = createTransporter();
    } catch (err) {
        console.error('[Email] createTransporter threw', err);
        return res.status(500).json({ success: false, message: 'Error loading email credentials.' });
    }

    if (!mailConfig || !mailConfig.transporter) {
        return res
            .status(500)
            .json({ success: false, message: 'Email credentials not configured in Admin Settings.' });
    }

    const { transporter, emailUser } = mailConfig;
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let rows;
    try {
        rows = db.prepare("SELECT name, email FROM birthdays WHERE strftime('%m-%d', dob) = ?").all(todayStr);
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }

    if (rows.length === 0) {
        return res.json({ success: true, sent: 0, message: 'No birthdays today' });
    }

    const templateStr = getEmailTemplate();

    const emailPromises = rows
        .filter((bday) => bday.email)
        .map((bday) => {
            const personalizedHtml = templateStr.replace(/\$\{bday\.name\}/g, bday.name);
            return transporter
                .sendMail(buildWishPayload(emailUser, bday.email, bday.name, personalizedHtml))
                .then(() => true)
                .catch((e) => {
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
    if (!id) {
        return res.status(400).json({ success: false, message: 'Birthday ID required' });
    }

    const person = db.prepare('SELECT id, name, email, dob FROM birthdays WHERE id = ?').get(id);
    if (!person) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }
    if (!person.email) {
        return res.status(400).json({ success: false, message: 'No email available for this student' });
    }

    const today = new Date();
    const target = new Date(person.dob);
    const isBirthdayToday = target.getMonth() === today.getMonth() && target.getDate() === today.getDate();
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
        return res
            .status(500)
            .json({ success: false, message: 'Email credentials not configured in Admin Settings.' });
    }

    const templateStr = getEmailTemplate();
    const { transporter, emailUser } = mailConfig;
    const personalizedHtml = templateStr.replace(/\$\{bday\.name\}/g, person.name);

    try {
        await transporter.sendMail(buildWishPayload(emailUser, person.email, person.name, personalizedHtml));
        return res.json({ success: true, name: person.name });
    } catch (error) {
        console.error(`[sendTodayBirthdayWishById] Failed to send to ${person.email}:`, error.message);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
};

module.exports = {
    sendBirthdayWishes,
    sendTodayBirthdayWishes,
    sendTodayBirthdayWishById,
    sendIndividualWish: sendTodayBirthdayWishById
};
