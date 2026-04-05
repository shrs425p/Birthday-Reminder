const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'database.db'));

try {
    const rows = db.prepare("SELECT name, email, dob FROM birthdays LIMIT 5").all();
    console.log("Birthdays Table (Top 5):");
    rows.forEach(r => {
        // Mask parts to avoid leaking in the logs if they are real
        const maskedEmail = r.email ? r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'N/A';
        const maskedName = r.name ? r.name.split(' ').map(n => n[0] + '***').join(' ') : 'N/A';
        console.log(`Name: ${maskedName}, Email: ${maskedEmail}, DOB: ${r.dob}`);
    });

    const requests = db.prepare("SELECT student_name, email FROM requests LIMIT 5").all();
    console.log("\nRequests Table (Top 5):");
    requests.forEach(r => {
        const maskedEmail = r.email ? r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'N/A';
        const maskedName = r.student_name ? r.student_name.split(' ').map(n => n[0] + '***').join(' ') : 'N/A';
        console.log(`Name: ${maskedName}, Email: ${maskedEmail}`);
    });
} catch (e) {
    console.error("Error reading DB:", e.message);
}
db.close();
