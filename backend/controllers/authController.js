const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const login = (req, res) => {
    const { username, password, role } = req.body;
    try {
        const row = db.prepare("SELECT * FROM users WHERE username = ? AND role = ?").get(username, role);
        if (row && bcrypt.compareSync(password, row.password)) {
            // Generate JWT Token (expires in 24 hours)
            const token = jwt.sign({ id: row.id, username: row.username, role: row.role }, SECRET, { expiresIn: '24h' });
            res.json({
                success: true,
                token: token,
                user: { username: row.username, role: row.role }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const changePassword = (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Verify current credentials first
    try {
        const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if (!row || !bcrypt.compareSync(currentPassword, row.password)) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }
        
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedNewPassword, row.id);
        
        // Issue a fresh token just in case
        const token = jwt.sign({ id: row.id, username: row.username, role: row.role }, SECRET, { expiresIn: '24h' });
        res.json({ success: true, message: "Password updated successfully", token });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    login,
    changePassword
};
