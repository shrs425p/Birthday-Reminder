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

```text
reminder/
  backend/
    config/
      db.js
      defaultTemplate.js
    features/
      auth/
        controller.js
        routes.js
      birthdays/
        controller.js
        crudHandlers.js
        importHandlers.js
        wishHandlers.js
        emailService.js
        routes.js
      requests/
        controller.js
        routes.js
      settings/
        controller.js
        routes.js
    middleware/
      authMiddleware.js
      errorHandler.js
    uploads/
    utils/
      crypto.js
    scheduler.js
    server.js
    package.json

  frontend/
    pages/
      index.html
      admin.html
      student.html
      404.html
    style.css
    styles/
      shared/
        tokens-layout.css
        tokens/
          theme-tokens.css
          base-layout.css
          headers-and-stats.css
      features/
        components.css
        components/
          cards-and-buttons.css
          forms-and-animations.css
          feedback-and-lists.css
          advanced-ui.css
      pages/
        home-v2.css
        home/
          layout.css
          widgets-and-cards.css
          actions-and-background.css
    js/
      core/
        auth.js
        ui-utils.js
        ui/
          notifications.js
          theme.js
          motion.js
          runtime.js
          init.js
        api/
          shared.js
          auth.js
          birthdays.js
          requests.js
          settings.js
      pages/
        home.js
        admin.js
        student.js
        admin/
          requests.js
          settings.js
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
