# WORKING.md

Last Updated: 2026-04-22

## 1. Project Purpose

Birthday Reminder centralizes student birthday records and provides a safe correction workflow.

User roles:
- Visitor: views Home page
- Student/public user: views birthdays and submits correction request
- Admin: manages all records, requests, SMTP settings, and scheduler

## 2. Runtime Boot Sequence

1. `backend/server.js` loads `dotenv` first, validates `PORT`, and starts Express middleware.
2. `backend/config/db.js` opens SQLite and ensures schema + defaults (`email_template`, `auto_send_time`).
3. Static assets are served from `frontend/`, with explicit aliases for `/`, `/admin`, `/student`.
4. API mount order is: auth (`/api`), quick wish (`/api/send-wishes`), birthdays, requests, settings.
5. `backend/scheduler.js` starts/restarts cron using DB `auto_send_time` first, then `CRON_SCHEDULE`, then `08:00` fallback.
6. Unknown non-API routes return `frontend/pages/404.html`; unknown API routes flow to JSON error handler.

## 3. Mounted API Map

Public endpoints:
- `POST /api/login`
- `PUT /api/password`
- `GET /api/birthdays`
- `GET /api/birthdays/today`
- `GET /api/birthdays/upcoming`
- `POST /api/requests`
- `POST /api/send-wishes`

Admin endpoints:
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

## 4. Frontend Flows

### Home page (`frontend/pages/index.html`)
- Loads split UI and API modules
- Fetches:
  - `GET /api/birthdays/today`
  - `GET /api/birthdays/upcoming`
  - `GET /api/birthdays`
- Renders birthday wall, milestones, and quick actions

### Admin page (`frontend/pages/admin.html`)
- Login via `POST /api/login`
- Uses JWT in `Authorization: Bearer <token>` for admin APIs
- Tabs:
  - Birthdays: CRUD, upload, send wishes
  - Requests: approve/reject correction tickets
  - Settings: SMTP, auto-send time, email template

### Student page (`frontend/pages/student.html`)
- Lists birthdays (`GET /api/birthdays`)
- Submits correction request (`POST /api/requests`)

## 5. Backend Feature Modules

### Auth (`backend/features/auth`)
- `controller.js`: login, password change
- `routes.js`: `/api/login`, `/api/password`

### Birthdays (`backend/features/birthdays`)
- `crudHandlers.js`: list, add, update, delete, stats, upcoming/today
- `importHandlers.js`: XLSX/CSV import
- `wishHandlers.js`: admin wish send + public send helper logic
- `emailService.js`: SMTP transporter + template payloads
- `controller.js`: export aggregator
- `routes.js`: public + admin-protected birthday endpoints

### Requests (`backend/features/requests`)
- `controller.js`: create, list pending, update status
- `routes.js`: public create; admin list/update

### Settings (`backend/features/settings`)
- `controller.js`: get/update settings, restart scheduler on time change
- `routes.js`: admin-only settings access

## 6. API Security Model

Public endpoints:
- `POST /api/login`
- `PUT /api/password`
- `GET /api/birthdays`
- `GET /api/birthdays/today`
- `GET /api/birthdays/upcoming`
- `POST /api/requests`
- `POST /api/send-wishes`

Admin-protected endpoints:
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

Auth/role behavior:
- `requireAuth` checks Bearer token and returns 401 when token is missing.
- `requireAuth` returns 403 when token is invalid/expired.
- `requireAdmin` enforces `role === 'admin'` for protected operations.

## 7. Database Tables

Defined in `backend/config/db.js`:
- `users`
- `birthdays`
- `requests`
- `settings`

Defaults seeded:
- `settings.email_template`
- `settings.auto_send_time` (default `08:00`)

## 8. Frontend Split Notes

CSS entrypoint:
- `frontend/style.css`

Imported CSS manifests:
- `frontend/styles/shared/tokens-layout.css`
- `frontend/styles/features/components.css`
- `frontend/styles/pages/home-v2.css`

JS split:
- API modules: `frontend/js/core/api/*.js`
- UI modules: `frontend/js/core/ui/*.js`
- Page modules: `frontend/js/pages/*.js`, `frontend/js/pages/admin/*.js`

## 9. Current Structure Snapshot (excluding backend/node_modules)

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

## 10. Local Development

From repository root:

```bash
npm install --prefix backend
node backend/server.js
```

Primary debug files:
- `backend/server.js`
- `backend/config/db.js`
- `backend/scheduler.js`
- `frontend/pages/admin.html`
- `frontend/js/pages/admin.js`
