# WORKING.md

## 1. Project Purpose

Birthday Reminder centralizes student birthday records and provides a safe correction workflow.

User roles:
- Visitor: views Home page
- Student/public user: views birthdays and submits correction request
- Admin: manages all records, requests, SMTP settings, and scheduler

## 2. Runtime Flow

1. `backend/server.js` loads env, starts Express, serves static frontend, and mounts API routes.
2. `backend/config/db.js` initializes SQLite schema and default settings.
3. `backend/scheduler.js` starts auto-send scheduling using env cron + DB `auto_send_time` override.

## 3. Frontend Flows

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

## 4. Backend Feature Modules

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

## 5. API Security Model

Public endpoints:
- `POST /api/login`
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

## 6. Database Tables

Defined in `backend/config/db.js`:
- `users`
- `birthdays`
- `requests`
- `settings`

Defaults seeded:
- `settings.email_template`
- `settings.auto_send_time` (default `08:00`)

## 7. Frontend Split Notes

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

## 8. Local Development

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
