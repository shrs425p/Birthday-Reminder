// print-settings.js
const Database = require('better-sqlite3');
const path = require('path');

// Use the same logic as your backend to get the DB path
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.db');
const db = new Database(dbPath);
console.log('Using database at:', dbPath);

const rows = db.prepare('SELECT * FROM settings').all();
console.log('Settings table:');
console.table(rows);
