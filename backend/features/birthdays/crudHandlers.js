const db = require('../../config/db');

const addBirthday = (req, res) => {
    const { name, dob, note, email, dept } = req.body;
    if (!name || !dob) {
        return res.status(400).json({ success: false, message: 'Name and DOB required.' });
    }

    try {
        const result = db
            .prepare('INSERT INTO birthdays (name, dob, note, email, dept) VALUES (?, ?, ?, ?, ?)')
            .run(name, dob, note || '', email || '', dept || '');
        return res.json({ success: true, message: 'Birthday added successfully!', id: result.lastInsertRowid });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getBirthdays = (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM birthdays ORDER BY dob ASC').all();
        return res.json({ success: true, birthdays: rows });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getTodaysBirthdays = (req, res) => {
    try {
        const today = new Date();
        const curMonth = today.getMonth();
        const curDay = today.getDate();

        const rows = db.prepare('SELECT dob, name, id, note, email, dept FROM birthdays').all();

        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;
        const todayBirthdays = [];

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        rows.forEach((row) => {
            if (!row.dob) return;
            const parts = row.dob.split('-');
            if (parts.length !== 3) return;

            const bMonth = parseInt(parts[1], 10) - 1;
            const bDay = parseInt(parts[2], 10);

            if (bMonth === curMonth && bDay === curDay) {
                todayCount += 1;
                todayBirthdays.push(row);
            }
            if (bMonth === curMonth) {
                monthCount += 1;
            }

            const bThisYear = new Date(today.getFullYear(), bMonth, bDay);
            if (bThisYear >= startOfWeek && bThisYear <= endOfWeek) {
                weekCount += 1;
            }
        });

        return res.json({
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
    if (!name || !dob) {
        return res.status(400).json({ success: false, message: 'Name and DOB required.' });
    }

    try {
        const result = db
            .prepare('UPDATE birthdays SET name = ?, dob = ?, note = ?, email = ?, dept = ? WHERE id = ?')
            .run(name, dob, note || '', email || '', dept || '', id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Birthday not found.' });
        }
        return res.json({ success: true, message: 'Birthday updated.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const deleteBirthday = (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare('DELETE FROM birthdays WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Birthday not found.' });
        }
        return res.json({ success: true, message: 'Birthday deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getUpcomingBirthdays = (req, res) => {
    try {
        const today = new Date();
        const upcoming = [];

        for (let i = 1; i <= 7; i += 1) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${month}-${day}`;

            const rows = db.prepare("SELECT * FROM birthdays WHERE strftime('%m-%d', dob) = ?").all(dateStr);
            rows.forEach((row) => {
                row.days_until = i;
                upcoming.push(row);
            });
        }

        return res.json({ success: true, birthdays: upcoming });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getStats = (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDate = today.getDate();
        const rows = db.prepare('SELECT dob FROM birthdays').all();

        let todayCount = 0;
        let weekCount = 0;
        let monthCount = 0;

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        rows.forEach((row) => {
            if (!row.dob) return;
            const parts = row.dob.split('-');
            if (parts.length !== 3) return;

            const bMonth = parseInt(parts[1], 10) - 1;
            const bDate = parseInt(parts[2], 10);

            if (bMonth === currentMonth && bDate === currentDate) {
                todayCount += 1;
            }
            if (bMonth === currentMonth) {
                monthCount += 1;
            }

            const bThisYear = new Date(today.getFullYear(), bMonth, bDate);
            if (bThisYear >= startOfWeek && bThisYear <= endOfWeek) {
                weekCount += 1;
            }
        });

        return res.json({
            success: true,
            stats: { today: todayCount, week: weekCount, month: monthCount, total: rows.length }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    addBirthday,
    getBirthdays,
    getTodaysBirthdays,
    updateBirthday,
    deleteBirthday,
    getUpcomingBirthdays,
    getStats
};
