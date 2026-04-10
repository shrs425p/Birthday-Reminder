# WORKING.md

## 1. Project Overview
Birthday Reminder is a lightweight web app for colleges/institutions to track student birthdays and automate wishes. It has:
- A public Home page that shows today’s birthdays and upcoming milestones.
- A public Student Panel to search all birthdays and submit correction tickets.
- An Admin Panel to manage records, review requests, configure SMTP, and schedule auto-sends.

Primary users:
- Admin staff: maintain records, approve corrections, configure email system.
- Students: browse birthdays and request corrections without login.
- Visitors: view today’s birthdays on the Home page.

Problem solved:
- Centralizes birthday records.
- Reduces manual reminder effort via scheduling and SMTP automation.
- Provides a safe, auditable correction workflow.

---

## 2. Project Structure
Full tree with one-line descriptions:

```
.env.example                    # Example environment variables for encryption and schedule
GEMINI.md                        # External agent instructions (not used by app runtime)
README.md                        # Project overview and feature summary
render.yaml                      # Render deployment configuration
WORKING.md                       # This detailed working document

backend/
  audit_db.js                    # Utility script to sample DB rows with masked data
  kill.bat                       # Windows helper to stop node.exe process
  package.json                   # Backend dependencies and scripts
  package-lock.json              # Locked dependency versions
  print-settings.js              # Utility script to print settings table
  scheduler.js                   # Daily cron scheduler for auto-sending birthday emails
  server.js                      # Express server entrypoint and route wiring
  start.bat                      # Windows helper to start the server

  config/
    db.js                        # SQLite initialization, schema creation, seed admin, migrations
    defaultTemplate.js           # Default HTML email template

  features/
    auth/
      controller.js              # Login and change password handlers (JWT + bcrypt)
      routes.js                  # /api login and password routes
    birthdays/
      controller.js              # Birthday CRUD, stats, upload, and SMTP send logic
      routes.js                  # /api/birthdays routes (public + admin)
    requests/
      controller.js              # Correction ticket create, list, approve/reject
      routes.js                  # /api/requests routes (public create, admin manage)
    settings/
      controller.js              # Settings get/update and scheduler trigger
      routes.js                  # /api/settings routes (admin-only)

  middleware/
    authMiddleware.js            # JWT verification and admin guard
    errorHandler.js              # Global Express error handler

  uploads/                        # Temporary upload destination for XLSX/CSV imports

  utils/
    crypto.js                    # AES-256-CBC encrypt/decrypt for SMTP credentials

frontend/
  pages/
    404.html                     # Custom not-found page and mascot animation
    admin.html                   # Admin login and panel UI
    index.html                   # Public Home page UI
    student.html                 # Public Student panel UI

  style.css                      # CSS entrypoint (imports split style parts)
  styles/
    shared/
      tokens-layout.css          # Design tokens and shared layout styles
    features/
      components.css             # Shared component styles
    pages/
      home-v2.css                # Home-page-specific style blocks

  js/
    core/
      api.js                     # Centralized fetch helpers for all API calls
      auth.js                    # Admin login, logout, session restore, password change
      ui-utils.js                # UI utilities (toast, themes, animations)
    pages/
      admin.js                   # Admin panel logic: tabs, CRUD, requests, settings
      home.js                    # Home page data fetch and UI rendering
      student.js                 # Student panel list and correction form logic
```

---

## 3. Complete Workflow (End-to-End)
### Server boot and background jobs
1. `backend/server.js` starts the Express server.
2. `backend/config/db.js` initializes SQLite, creates tables, and seeds admin user.
3. `backend/scheduler.js` starts the daily cron scheduler (default 08:00 IST).

### Public Home page flow
1. User opens `/` (served from `frontend/pages/index.html`).
2. `frontend/js/home.js` calls:
   - `GET /api/birthdays/today` for today’s list and stats.
   - `GET /api/birthdays/upcoming` for next 7 days.
   - `GET /api/birthdays` for overall counts and actions.
3. UI renders:
   - Today’s birthday wall cards.
   - Upcoming milestones carousel.
   - Quick stats and actions.
4. “Send Wish” uses a `mailto:` link (client email app). “Wish All” uses `mailto:?bcc=...`.

### Admin authentication flow
1. Admin logs in at `/admin`.
2. `POST /api/login` checks username + password + role.
3. JWT is returned and stored in `localStorage` as `adminUser`.
4. All admin requests include `Authorization: Bearer <token>` via `frontend/js/api.js`.

### Admin adds a birthday
1. Admin fills the Birthdays form in Admin Panel.
2. `POST /api/birthdays` validates required fields.
3. Record saved in `birthdays` table.
4. UI refreshes list with new entry.

### Cron job daily workflow
1. At scheduled time, cron calls `runDailyWishes()`.
2. DB query finds today’s birthdays.
3. SMTP credentials loaded from `settings` table (decrypted).
4. Each birthday email is sent using Nodemailer.

### Student correction ticket flow
1. Student opens `/student`.
2. Student submits correction ticket form.
3. `POST /api/requests` saves ticket as `pending`.
4. Admin opens Requests tab → `GET /api/requests` lists pending tickets.
5. Admin approves/rejects via `PUT /api/requests/:id/status`:
   - Approve: updates existing birthday by name or inserts new record.
   - Reject: sets status only.

---

## 4. Every Screen — Detailed

### Home Page (`/`)
Sections and actions:
- **Top Navigation**: links to Home, Admin Panel, Student Panel; theme toggle.
- **Hero Greeting**: dynamic time-based greeting.
- **Quick Stats**:
  - Today’s birthdays (`GET /api/birthdays/today`).
  - This month’s birthdays (computed from `GET /api/birthdays`).
  - Total students (`GET /api/birthdays`).
- **Today’s Birthday Wall**:
  - List cards for each birthday (`GET /api/birthdays/today`).
  - “🎁 Send Wish” uses `mailto:` with subject/body prefill.
- **Upcoming Milestones**:
  - Carousel from `GET /api/birthdays/upcoming`.
- **Mini Calendar**: local-only rendering.
- **Quick Actions**:
  - “Wish All Today’s Birthdays” uses `mailto:?bcc=...` for all emails.
  - “Update My DOB” links to Student Panel.

### Admin Panel — Birthdays Tab
- **Login**: Username, Password → `POST /api/login`.
- **Stats row**: `GET /api/birthdays/stats` (admin-protected).
- **Add/Edit form** fields:
  - Name, DOB, Email, Note, Department.
  - Save → `POST /api/birthdays` or `PUT /api/birthdays/:id`.
- **Quick Actions**:
  - Upload XLSX/CSV → `POST /api/birthdays/upload`.
  - Send Wishes Today → `POST /api/birthdays/wish`.
  - Export CSV / Sample CSV (client-side generation).
- **Birthdays table**:
  - Search filter (client-side).
  - Edit button → loads form.
  - Delete button → `DELETE /api/birthdays/:id`.

### Admin Panel — Requests Tab
- **Requests list**: `GET /api/requests` (pending only).
- **Approve**: `PUT /api/requests/:id/status` with `approved`.
  - Updates birthday or inserts new record.
- **Reject**: `PUT /api/requests/:id/status` with `rejected`.

### Admin Panel — Settings Tab
- **SMTP Config**:
  - Gmail address + app password.
  - `PUT /api/settings/email_user` and `PUT /api/settings/email_pass`.
- **Scheduler time**:
  - `PUT /api/settings/auto_send_time` (HH:MM).
  - Server re-starts cron schedule immediately.
- **Email Template Editor**:
  - Edit HTML with `${bday.name}` placeholder.
  - `PUT /api/settings/email_template`.
  - Live preview shown in iframe.

### Student Panel (`/student`)
- **Birthday table**: `GET /api/birthdays`.
- **Search filter**: client-side.
- **Correction form**:
  - Name, Correct DOB, Email, Department, Note.
  - `POST /api/requests`.

---

## 5. API Routes — Complete List
All API routes are prefixed with `/api`.

### Auth
- **POST /api/login** (public)
  - Body: `{ username, password, role }`
  - Response: `{ success, token, user }`
- **PUT /api/password** (admin auth)
  - Body: `{ username, currentPassword, newPassword }`
  - Response: `{ success, message, token }`

### Birthdays
- **GET /api/birthdays** (public)
  - Response: `{ success, birthdays: [] }`
- **GET /api/birthdays/today** (public)
  - Response: `{ success, birthdays: [], stats: { today, week, month } }`
- **GET /api/birthdays/upcoming** (public)
  - Response: `{ success, birthdays: [] }`
- **GET /api/birthdays/stats** (admin auth)
  - Response: `{ success, stats: { today, week, month, total } }`
- **POST /api/birthdays** (admin auth)
  - Body: `{ name, dob, note, email, dept }`
  - Response: `{ success, message, id }`
- **PUT /api/birthdays/:id** (admin auth)
  - Body: `{ name, dob, note, email, dept }`
  - Response: `{ success, message }`
- **DELETE /api/birthdays/:id** (admin auth)
  - Response: `{ success, message }`
- **POST /api/birthdays/upload** (admin auth, multipart)
  - FormData: `file`
  - Response: `{ success, message, details? }`
- **POST /api/birthdays/wish** (admin auth)
  - Response: `{ success, message }`

### Requests
- **POST /api/requests** (public)
  - Body: `{ student_name, correct_dob, email, note, dept }`
  - Response: `{ success, message }`
- **GET /api/requests** (admin auth)
  - Response: `{ success, requests: [] }`
- **PUT /api/requests/:id/status** (admin auth)
  - Body: `{ status: 'approved'|'rejected' }`
  - Response: `{ success, message }`

### Settings (admin auth)
- **GET /api/settings**
  - Response: settings object (email_pass masked, includes `email_configured`).
- **PUT /api/settings/:key**
  - Body: `{ value }`
  - Response: `{ success, message }`

### Public send-wishes shortcut
- **POST /api/send-wishes** (public)
  - Sends today’s wishes via SMTP (if configured)
  - Response: `{ success, sent }` or `{ success, message }`

---

## 6. Database Schema (SQLite)
Defined in `backend/config/db.js`.

### `users`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `username` TEXT UNIQUE NOT NULL
- `password` TEXT NOT NULL (bcrypt hash)
- `role` TEXT NOT NULL (e.g., `admin`)

### `birthdays`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `name` TEXT NOT NULL
- `dob` TEXT NOT NULL (YYYY-MM-DD)
- `note` TEXT
- `email` TEXT
- `dept` TEXT

### `requests`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `student_name` TEXT NOT NULL
- `correct_dob` TEXT NOT NULL
- `email` TEXT
- `note` TEXT
- `dept` TEXT
- `status` TEXT DEFAULT 'pending'
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

### `settings`
- `key` TEXT PRIMARY KEY
- `value` TEXT NOT NULL

---

## 7. Authentication Flow
1. Admin logs in with username/password.
2. `POST /api/login` verifies bcrypt hash and issues JWT (24h expiry).
3. Token stored in `localStorage` as `adminUser`.
4. Requests include `Authorization: Bearer <token>`.
5. `authMiddleware.requireAuth` validates token; `requireAdmin` enforces role.

---

## 8. Email System
### SMTP configuration
- Saved via Admin Settings tab.
- `email_user` and `email_pass` stored in `settings` table.
- Password is AES-256-CBC encrypted (`backend/utils/crypto.js`).

### Transporter creation
- `createTransporter()` loads settings from DB and decrypts password.
- Uses Gmail SMTP (`smtp.gmail.com`, port 465, secure).

### Scheduler auto-send
- `backend/scheduler.js` reads `auto_send_time` and schedules cron.
- `runDailyWishes()` finds today’s birthdays and sends HTML emails.

### Manual send (admin)
- “Send Wishes Today” → `POST /api/birthdays/wish`.
- Sends individual emails using the same template and SMTP config.

### Client-side mailto (Home page)
- **Individual wish**: `mailto:student@email?subject=...&body=...`.
- **Wish all**: `mailto:?bcc=...&subject=...&body=...`.

---

## 9. Security
- **Password hashing**: bcrypt (users table).
- **JWT sessions**: signed token, 24h expiry.
- **AES-256 encryption**: SMTP password stored encrypted in DB.
- **Admin-only guards**: `requireAuth` + `requireAdmin` on protected routes.

### Public vs protected routes
Public:
- `POST /api/login`
- `GET /api/birthdays`
- `GET /api/birthdays/today`
- `GET /api/birthdays/upcoming`
- `POST /api/requests`
- `POST /api/send-wishes`

Protected (admin):
- `GET /api/birthdays/stats`
- `POST /api/birthdays`
- `PUT /api/birthdays/:id`
- `DELETE /api/birthdays/:id`
- `POST /api/birthdays/upload`
- `POST /api/birthdays/wish`
- `GET /api/requests`
- `PUT /api/requests/:id/status`
- `GET /api/settings`
- `PUT /api/settings/:key`
- `PUT /api/password`

---

## 10. Setup & Installation
### Prerequisites
- Node.js 20.x
- npm

### Setup steps
1. Clone the repository.
2. Install dependencies:
   - From project root: `npm install`
3. Configure environment variables (optional but recommended):
   - Create `.env` in project root.
  - Copy from `.env.example` and add `JWT_SECRET` if desired.
4. Start the server:
   - `npm start` (runs `node backend/server.js`)

### Default admin credentials
- Username: `admin`
- Password: `admin`

### Change admin password
- In Admin Panel → “Change Pass” button.
- Or call `PUT /api/password` with current password.
