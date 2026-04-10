const db = require('../../config/db');

const createRequest = (req, res) => {
    const { student_name, correct_dob, email, note, dept } = req.body;

    const trimmedName = student_name ? student_name.trim() : null;
    if (!trimmedName || !correct_dob) {
        return res.status(400).json({ success: false, message: "Student Name and Correct DOB are required." });
    }

    try {
        db.prepare("INSERT INTO requests (student_name, correct_dob, email, note, dept, status) VALUES (?, ?, ?, ?, ?, 'pending')")
            .run(trimmedName, correct_dob, email || null, note || null, dept || null);
        res.json({ success: true, message: "Request submitted successfully!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getRequests = (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM requests WHERE status = 'pending' ORDER BY id DESC").all();
        res.json({ success: true, requests: rows });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

const updateRequestStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (status === 'approved') {
            const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(id);
            if (!request) return res.status(500).json({ success: false, error: "Not found" });
            // Ensure email and note map cleanly if undefined
            const finalEmail = request.email || null;
            const finalNote = request.note ? `[Ticket Note]: ${request.note}` : 'Requested by student';
            
            // Robust update: Case-insensitive and trimmed name matching
            const update = db.prepare("UPDATE birthdays SET dob = ?, email = ?, note = ?, dept = ? WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))")
                .run(request.correct_dob, finalEmail, finalNote, request.dept, request.student_name);

            console.log(`[DEBUG] approving request for "${request.student_name}". Update changes: ${update.changes}`);

            if (update.changes === 0) {
                // If not found, insert as a new record
                db.prepare("INSERT INTO birthdays (name, dob, email, note, dept) VALUES (?, ?, ?, ?, ?)")
                    .run(request.student_name, request.correct_dob, finalEmail, finalNote, request.dept);
            }
            db.prepare("UPDATE requests SET status = 'approved' WHERE id = ?").run(id);
            res.json({ success: true, message: "Request approved and birthday updated!" });
        } else {
            db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, id);
            res.json({ success: true, message: "Request marked as " + status });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    createRequest,
    getRequests,
    updateRequestStatus
};
