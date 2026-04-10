// ✅ FIX: dotenv must load first — before any controller reads process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./features/auth/routes');
const birthdayRoutes = require('./features/birthdays/routes');
const requestRoutes = require('./features/requests/routes');
const settingsRoutes = require('./features/settings/routes');
const { sendTodayBirthdayWishes } = require('./features/birthdays/controller');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT);

if (!Number.isInteger(PORT)) {
    throw new Error('Missing or invalid required environment variable: PORT');
}

// ── Core Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve Frontend (static) ──────────────────────────────────
// All HTML/CSS/JS files live in /frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Clean URL aliases (no .html extension needed) ────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/admin.html')));
app.get('/student', (req, res) => res.sendFile(path.join(__dirname, '../frontend/pages/student.html')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api', authRoutes);
app.post('/api/send-wishes', sendTodayBirthdayWishes);
app.use('/api/birthdays', birthdayRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/settings', settingsRoutes);

// ── 404 Catch-All (non-API routes) ──────────────────────────
app.use((req, res, next) => {
    // Let API 404s fall through to the error handler as JSON
    if (req.path.startsWith('/api')) {
        const err = new Error(`API route not found: ${req.path}`);
        err.status = 404;
        return next(err);
    }
    // For browser navigation, serve the custom 404 HTML page
    res.status(404).sendFile(path.join(__dirname, '../frontend/pages/404.html'));
});

// ── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

const { startScheduler } = require('./scheduler');

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🎂  Birthday Reminder running on port ${PORT}`);
    startScheduler();   // 🕐 Auto-send birthday emails every day at 8 AM IST
});

