# Birthday Reminder

Birthday Reminder is a lightweight web app for tracking student birthdays and managing birthday wishes.

It provides:
- Public Home page with today's and upcoming birthdays
- Public Student panel for browsing and submitting correction tickets
- Admin panel for CRUD, request approvals, SMTP settings, and auto-send scheduling

## Tech Stack

- Backend: Node.js, Express, SQLite (better-sqlite3)
- Frontend: HTML, CSS, Vanilla JavaScript
- Auth/Security: JWT, bcryptjs, AES-256-CBC encryption for SMTP password storage
- Email/Scheduler: Nodemailer, node-cron

## Current Architecture

Note: backend/node_modules is intentionally omitted for readability.

```text
reminder/
|-- backend/
|   |-- config/
|   |   |-- db.js
|   |   \-- defaultTemplate.js
|   |-- features/
|   |   |-- auth/
|   |   |   |-- controller.js
|   |   |   \-- routes.js
|   |   |-- birthdays/
|   |   |   |-- controller.js
|   |   |   |-- crudHandlers.js
|   |   |   |-- emailService.js
|   |   |   |-- importHandlers.js
|   |   |   |-- routes.js
|   |   |   \-- wishHandlers.js
|   |   |-- requests/
|   |   |   |-- controller.js
|   |   |   \-- routes.js
|   |   \-- settings/
|   |       |-- controller.js
|   |       \-- routes.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   \-- errorHandler.js
|   |-- uploads/
|   |-- utils/
|   |   \-- crypto.js
|   |-- audit_db.js
|   |-- database.db
|   |-- kill.bat
|   |-- package-lock.json
|   |-- package.json
|   |-- print-settings.js
|   |-- scheduler.js
|   |-- server.js
|   \-- start.bat
|-- frontend/
|   |-- js/
|   |   |-- core/
|   |   |   |-- api/
|   |   |   |   |-- auth.js
|   |   |   |   |-- birthdays.js
|   |   |   |   |-- requests.js
|   |   |   |   |-- settings.js
|   |   |   |   \-- shared.js
|   |   |   |-- ui/
|   |   |   |   |-- init.js
|   |   |   |   |-- motion.js
|   |   |   |   |-- notifications.js
|   |   |   |   |-- runtime.js
|   |   |   |   \-- theme.js
|   |   |   |-- auth.js
|   |   |   \-- ui-utils.js
|   |   \-- pages/
|   |       |-- admin/
|   |       |   |-- requests.js
|   |       |   \-- settings.js
|   |       |-- admin.js
|   |       |-- home.js
|   |       \-- student.js
|   |-- pages/
|   |   |-- 404.html
|   |   |-- admin.html
|   |   |-- index.html
|   |   \-- student.html
|   |-- styles/
|   |   |-- features/
|   |   |   |-- components/
|   |   |   |   |-- advanced-ui.css
|   |   |   |   |-- cards-and-buttons.css
|   |   |   |   |-- feedback-and-lists.css
|   |   |   |   \-- forms-and-animations.css
|   |   |   |-- components.__source.css
|   |   |   \-- components.css
|   |   |-- pages/
|   |   |   |-- home/
|   |   |   |   |-- actions-and-background.css
|   |   |   |   |-- layout.css
|   |   |   |   \-- widgets-and-cards.css
|   |   |   \-- home-v2.css
|   |   \-- shared/
|   |       |-- tokens/
|   |       |   |-- base-layout.css
|   |       |   |-- headers-and-stats.css
|   |       |   \-- theme-tokens.css
|   |       \-- tokens-layout.css
|   \-- style.css
|-- .env
|-- .env.example
|-- .gitignore
|-- GEMINI.md
|-- PROJECT_FULL_REPORT.txt
|-- README.md
|-- render.yaml
|-- report.txt
|-- structure.txt
|-- workflow.md
\-- WORKING.md
```

## Main Features

### Home (`/`)
- Today's birthdays feed
- Upcoming birthdays (next 7 days)
- Quick actions with mailto links

### Student (`/student`)
- Searchable birthday list
- Submit correction requests

### Admin (`/admin`)
- Admin login
- Birthday CRUD + bulk upload
- Request approval/rejection workflow
- SMTP credentials + template + scheduler time management

## API Routes

All routes are under `/api`.

### Auth
- `POST /api/login`
- `PUT /api/password`

### Birthdays
- `GET /api/birthdays` (public)
- `GET /api/birthdays/today` (public)
- `GET /api/birthdays/upcoming` (public)
- `GET /api/birthdays/stats` (admin)
- `POST /api/birthdays` (admin)
- `PUT /api/birthdays/:id` (admin)
- `DELETE /api/birthdays/:id` (admin)
- `POST /api/birthdays/upload` (admin)
- `POST /api/birthdays/wish` (admin)

### Requests
- `POST /api/requests` (public)
- `GET /api/requests` (admin)
- `PUT /api/requests/:id/status` (admin)

### Settings
- `GET /api/settings` (admin)
- `PUT /api/settings/:key` (admin)

### Extra
- `POST /api/send-wishes` (public shortcut endpoint)

## Environment Variables

Use `.env.example`.

Required:
- `JWT_SECRET`
- `PORT`
- `DB_ENCRYPTION_KEY`
- `DB_ENCRYPTION_SALT`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `FRONTEND_URL`
- `CRON_SCHEDULE`

Optional bootstrap:
- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`

## Local Run

From repository root:

```bash
npm install --prefix backend
node backend/server.js
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/admin`
- `http://localhost:3000/student`

## Notes

- Frontend page HTML files use relative asset references (`../style.css`, `../js/...`) under `frontend/pages`.
- `frontend/js/core/ui-utils.js` is now a compatibility shim; active UI logic is split under `frontend/js/core/ui/`.
