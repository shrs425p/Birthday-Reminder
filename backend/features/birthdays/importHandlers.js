const fs = require('fs');
const xlsx = require('xlsx');
const db = require('../../config/db');

const uploadExcelBirthdays = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const parseDob = (raw) => {
            if (!raw && raw !== 0) return '';
            const s = String(raw).trim().replace(/^="?|"?$/g, '');
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

            const num = Number(s);
            if (!Number.isNaN(num) && num > 1000) {
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
        const errorRows = [];

        for (let index = 0; index < data.length; index += 1) {
            const row = data[index];
            const rowNumber = index + 2;

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
                db.prepare('UPDATE birthdays SET dob = ?, email = ?, note = ?, dept = ? WHERE id = ?').run(
                    dob,
                    email,
                    note,
                    dept,
                    existing.id
                );
                updateCount += 1;
            } else {
                db.prepare('INSERT INTO birthdays (name, dob, email, note, dept) VALUES (?, ?, ?, ?, ?)').run(
                    name,
                    dob,
                    email,
                    note,
                    dept
                );
                insertCount += 1;
            }
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

        if (errorRows.length) {
            response.details.errors = errorRows;
        }

        return res.json(response);
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    uploadExcelBirthdays
};
