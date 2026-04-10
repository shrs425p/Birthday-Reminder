const db = require('../../config/db');
const scheduler = require('../../scheduler');

const { encrypt, decrypt } = require('../../utils/crypto');

const getSettings = (req, res) => {
    try {
        const rows = db.prepare("SELECT key, value FROM settings").all();
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        // Also pass down boolean indicating if email is ready
        // and optionally provide the current email (masked password)
        settings.email_configured = !!(settings.email_user && settings.email_pass);
        // Mask password before sending to frontend
        if (settings.email_pass) {
            settings.email_pass = '********';
        }
        res.json(settings);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateSetting = (req, res) => {
    const { key } = req.params;
    let { value } = req.body;

    if (!key || !value) {
        return res.status(400).json({ error: "Missing key or value." });
    }

    if (key === 'email_pass') {
        value = encrypt(value);
    }

    try {
        const result = db.prepare("UPDATE settings SET value = ? WHERE key = ?").run(value, key);
        const triggerHook = () => {
            if (key === 'auto_send_time') {
                scheduler.startScheduler();
            }
        };
        // If no rows were changed, it means the key doesn't exist yet, so insert it.
        if (result.changes === 0) {
            db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(key, value);
            triggerHook();
            res.json({ success: true, message: "Setting created." });
        } else {
            triggerHook();
            res.json({ success: true, message: "Setting updated." });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getSettings,
    updateSetting
};
