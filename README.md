# 🎂 Birthday Reminder

[![Node.js Version](https://img.shields.io/badge/node-%3E=%2016-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

A lightweight web app to track and celebrate birthdays for an institution — built as a college mini-project with a simple, secure admin workflow and a public student view.

---

## Project Overview

Birthday Reminder helps staff and students keep track of birthdays and send wishes. It is aimed at small teams, student clubs, and educational institutions that want a lightweight solution to:

- Display today's birthdays on the public Home page
- Allow students to view all records and submit correction tickets without requiring login
- Provide an Admin panel to manage records, bulk-import student lists, and send scheduled or manual wishes via SMTP

Tech stack: Node.js, Express, SQLite (better-sqlite3), vanilla JavaScript (ES6), HTML/CSS.

---

## Key Features

### Home Page
- Dynamic greeting (Good Morning / Good Afternoon / Good Evening) based on local time.
- "Today's Birthday Wall": shows students whose birthday is today with department badges and a per-card "🎁 Send Wish" button which opens the user's email client (mailto) pre-filled with a personalized subject/body.
- Upcoming Milestones carousel: shows birthdays arriving in the next 7 days.
- Mini month calendar highlighting today's date.
- Quick Actions / QUICK ACTIONS panel:
  - Shows next upcoming birthday and the count of today's birthdays.
  - "🎁 Wish All Today's Birthdays" button opens the user's email client once with all recipients in BCC (so recipients are not visible to each other).
  - Simple action tiles such as "Update My DOB" which link to the Student Panel.

### Admin Panel
Accessible at `/admin` — requires admin login.

- Birthdays tab
  - Add new birthday form (name, DOB, email, dept, note).
  - Table of all birthdays with search, edit, and delete actions.
  - Bulk import (XLSX / CSV) with smart duplicate handling (updates existing entries where names match).
  - Export CSV and download a sample CSV template.
  - Manual "Send Wishes Today" button that uses configured SMTP credentials to send individual emails.

- Requests tab
  - Lists pending correction tickets submitted by students (or anonymous users from the Student Panel).
  - Approve / Reject workflow: approving updates the birthdays table (or inserts a new record if the student wasn't already present).

- Settings tab
  - SMTP configuration (Gmail + app password recommended) — credentials are encrypted in the DB.
  - Daily auto-send scheduler (cron-like) to auto-send birthday emails at a configured time.
  - HTML email template editor with live preview used for admin-triggered emails.

### Student Panel
Accessible at `/student` — public (no login required).

- View all birthdays in a searchable table (filter by name or department).
- Submit a correction ticket (student name, corrected DOB, email, dept, note) — sent to Admin for review.

---

## Authentication & Authorization

- Admin: authenticated via JWT tokens. Passwords are hashed with bcrypt.
- Student Panel: intentionally public for this mini-project — no student login is required.
- Admin-only routes are guarded by `requireAuth` + `requireAdmin` middleware.

Notes:
- JWT tokens are issued on successful admin login and used to authenticate protected admin API endpoints.
- Token lifetime and secret are configurable via environment variables.

---

## Security

- Passwords: `bcryptjs` for hashing and salting admin passwords.
- JWT: role-based middleware validates tokens (admin role required for protected routes).
- SMTP credentials: encrypted in the database using AES-256-CBC (server-side utilities handle encrypt/decrypt with `DB_ENCRYPTION_KEY` and `DB_ENCRYPTION_SALT`).
- Student privacy: the Home page's "Wish All" uses a BCC mailto (one mail client window) so recipients are not exposed to each other. Individual "Send Wish" buttons open a personalized mailto per student so the sender uses their email client.

---

## Setup & Installation

Prerequisites
- Node.js (v16 or newer recommended)
- npm

Quick start

1. Clone the repository

```bash
git clone https://github.com/shrs425p/Birthday-Reminder.git
cd Birthday-Reminder
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the project root using `.env.example` as the template

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-long-random-jwt-secret
DB_ENCRYPTION_KEY=your-long-random-encryption-key
DB_ENCRYPTION_SALT=your-random-encryption-salt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
CRON_SCHEDULE="0 8 * * *"
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_PASSWORD=your-strong-admin-password
```

4. Start the server

```bash
# from project root
node backend/server.js
# or if you have a dev script
npm run dev
```

5. Open the app in your browser

```
http://localhost:3000
```

Bootstrap admin credentials are read from `.env` and only used when the `users` table is empty.
If `BOOTSTRAP_ADMIN_PASSWORD` is not provided, the app generates a random password and logs it at first startup.

---

## Project Structure

```
reminder/
├── backend/
│   ├── config/
│   │   ├── db.js                # SQLite connection & schema, initial seeding
│   │   └── defaultTemplate.js   # Default birthday HTML template
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── birthdayController.js
│   │   ├── requestController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # requireAuth, requireAdmin
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── birthdayRoutes.js
│   │   ├── requestRoutes.js
│   │   └── settingsRoutes.js
│   ├── scheduler.js            # node-cron auto-send job
│   └── server.js               # Express server entrypoint
│
├── frontend/
│   ├── index.html              # Home page
│   ├── admin.html              # Admin panel (requires login)
│   ├── student.html            # Student panel (public)
│   ├── style.css
│   └── js/
│       ├── api.js              # centralized fetch helpers
│       ├── auth.js             # admin auth + session helpers
│       ├── home.js             # home-page logic
│       ├── admin.js            # admin panel logic
│       ├── student.js          # student panel logic
│       └── ui-utils.js         # toasts, theme toggles, helpers
│
├── uploads/                    # temporary uploaded files
├── database.db                 # SQLite file (created on first run)
├── .env                        # environment overrides (not committed)
├── package.json
└── README.md
```

---

## API Reference (selected)

- POST `/api/login` — login (admin) — returns JWT
- PUT `/api/password` — change password (admin)
- GET `/api/birthdays` — (admin) list all birthdays
- GET `/api/birthdays/today` — public endpoint used by the Homepage
- POST `/api/birthdays` — admin: add birthday
- POST `/api/birthdays/upload` — admin: bulk import (XLSX/CSV)
- POST `/api/birthdays/wish` — admin-only: send today's wishes via SMTP
- POST `/api/requests` — public: submit a correction ticket (student)
- GET `/api/requests` — admin-only: list pending correction tickets
- PUT `/api/requests/:id/status` — admin-only: approve/reject requests
- GET/PUT `/api/settings` — admin-only: manage SMTP and other app settings

---

## Development Notes

- The app uses `better-sqlite3` for a small synchronous DB that is easy to seed and inspect.
- SMTP credentials are stored in the `settings` table and encrypted with `DB_ENCRYPTION_KEY` + `DB_ENCRYPTION_SALT` — configure via the Admin Settings UI.
- Auto-send scheduler uses `node-cron`; the schedule can be changed in the Settings UI (or via env override for testing).

---

## Testing & Local QA

- To test the Student Panel submission flow, open `/student` and submit a correction ticket — it will be stored in the `requests` table for admin review.
- To test admin email sending, configure SMTP in Admin → Settings with valid Gmail app credentials and use "Send Wishes Today".
- The Home page uses mailto links for manual user-sent emails (no SMTP involved), and BCC for the "Wish All" action.

---

## Notes for Submission

- This repo has been intentionally simplified for a student project: the Student Panel is public and does not require individual student accounts. Admin credentials remain protected and use JWT/bcrypt.
- Set all required environment variables before production (`JWT_SECRET`, `DB_ENCRYPTION_KEY`, `DB_ENCRYPTION_SALT`, SMTP settings, `CRON_SCHEDULE`, and bootstrap admin values).

---

## License

This project is provided under the MIT license — see the `LICENSE` file for details.

---

## Acknowledgements

Built as a college mini-project. Uses small, focused open-source libraries: `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `nodemailer`, `xlsx`, `multer`, and `node-cron`.

Deployed link
https://birthday-reminder-ortt.onrender.com

If you'd like, I can also produce a short submission checklist and a short demo script of steps to show during a presentation.
