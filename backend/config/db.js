const Database = require('better-sqlite3');
const path = require('path');

// Use DB_PATH env variable if set, else default to local database.db
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.db');
const db = new Database(dbPath);
console.log(`Connected to SQLite database at ${dbPath}`);
console.log("Connected to the SQLite database.");

// Create tables if they don't exist
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    note TEXT,
    email TEXT,
    dept TEXT
)`).run();

// Auto-migrate: Add columns if they don't exist (try/catch to ignore errors if already exist)
try { db.prepare(`ALTER TABLE birthdays ADD COLUMN email TEXT`).run(); } catch (e) {}
try { db.prepare(`ALTER TABLE birthdays ADD COLUMN dept TEXT`).run(); } catch (e) {}
try { db.prepare(`CREATE INDEX IF NOT EXISTS idx_dob ON birthdays(dob)`).run(); } catch (e) {}

db.prepare(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    correct_dob TEXT NOT NULL,
    email TEXT,
    note TEXT,
    dept TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();
try { db.prepare(`ALTER TABLE requests ADD COLUMN email TEXT`).run(); } catch (e) {}
try { db.prepare(`ALTER TABLE requests ADD COLUMN note TEXT`).run(); } catch (e) {}
try { db.prepare(`ALTER TABLE requests ADD COLUMN dept TEXT`).run(); } catch (e) {}
try { db.prepare(`ALTER TABLE requests ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`).run(); } catch (e) {}

db.prepare(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
)`).run();

const defaultTemplate = require('./defaultTemplate');
const emailTemplateRow = db.prepare("SELECT value FROM settings WHERE key = 'email_template'").get();
if (!emailTemplateRow) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("email_template", defaultTemplate);
}
const autoSendTimeRow = db.prepare("SELECT value FROM settings WHERE key = 'auto_send_time'").get();
if (!autoSendTimeRow) {
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("auto_send_time", "08:00");
}

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userCountRow = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCountRow && userCountRow.count === 0) {
    const bootstrapAdminUsername = process.env.BOOTSTRAP_ADMIN_USERNAME || 'admin';
    const bootstrapAdminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
    const adminHash = bcrypt.hashSync(bootstrapAdminPassword, 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(bootstrapAdminUsername, adminHash, "admin");
    if (!process.env.BOOTSTRAP_ADMIN_PASSWORD) {
        console.warn(`[Security] Seeded bootstrap admin '${bootstrapAdminUsername}' with generated password: ${bootstrapAdminPassword}`);
        console.warn('[Security] Set BOOTSTRAP_ADMIN_PASSWORD in environment to control first-login credentials.');
    } else {
        console.log(`Seeded bootstrap admin user '${bootstrapAdminUsername}' with hashed password.`);
    }
} else {
    // Migration check: Re-hash any existing passwords that are plainly stored
    const users = db.prepare("SELECT id, password FROM users").all();
    let migratedCount = 0;
    users.forEach(u => {
        // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 chars long.
        if (!u.password.startsWith('$2') || u.password.length !== 60) {
            const hashed = bcrypt.hashSync(u.password, 10);
            db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, u.id);
            migratedCount++;
        }
    });
    if (migratedCount > 0) {
        console.log(`[Migration] Re-hashed ${migratedCount} plain-text passwords in the database.`);
    }
}

// Migration check: Encrypt plain-text email_pass in settings if it exists
try {
    const { encrypt } = require('../utils/crypto');
    const emailPassRow = db.prepare("SELECT value FROM settings WHERE key = 'email_pass'").get();
    if (emailPassRow && emailPassRow.value && !emailPassRow.value.includes(':')) {
        const encryptedPass = encrypt(emailPassRow.value);
        db.prepare("UPDATE settings SET value = ? WHERE key = 'email_pass'").run(encryptedPass);
        console.log("[Migration] Encrypted plain-text SMTP password in the database.");
    }
} catch (e) {
    console.error("[Migration] Error checking email_pass encryption:", e.message);
}

module.exports = db;

module.exports = db;

module.exports = db;
