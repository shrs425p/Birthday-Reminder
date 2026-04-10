# Project Navigation Map

Use this file when someone asks where a specific feature is implemented.

## Frontend

Pages:
- Home page: `frontend/pages/index.html`
- Admin page: `frontend/pages/admin.html`
- Student page: `frontend/pages/student.html`
- 404 page: `frontend/pages/404.html`

Page logic:
- Home behavior: `frontend/js/pages/home.js`
- Admin shell behavior: `frontend/js/pages/admin.js`
- Admin requests tab: `frontend/js/pages/admin/requests.js`
- Admin settings tab: `frontend/js/pages/admin/settings.js`
- Student behavior: `frontend/js/pages/student.js`

Shared JS:
- API modules: `frontend/js/core/api/`
- Auth/session helpers: `frontend/js/core/auth.js`
- UI modules: `frontend/js/core/ui/`
- Legacy UI shim: `frontend/js/core/ui-utils.js`

Styles:
- Entry file: `frontend/style.css`
- Shared manifests: `frontend/styles/shared/tokens-layout.css`
- Feature manifests: `frontend/styles/features/components.css`
- Home page manifests: `frontend/styles/pages/home-v2.css`

## Backend

Server bootstrap:
- App startup + route mounting: `backend/server.js`

Features:
- Auth
  - Controller: `backend/features/auth/controller.js`
  - Routes: `backend/features/auth/routes.js`
- Birthdays
  - Export controller: `backend/features/birthdays/controller.js`
  - CRUD handlers: `backend/features/birthdays/crudHandlers.js`
  - Import handlers: `backend/features/birthdays/importHandlers.js`
  - Wish handlers: `backend/features/birthdays/wishHandlers.js`
  - Email service: `backend/features/birthdays/emailService.js`
  - Routes: `backend/features/birthdays/routes.js`
- Requests
  - Controller: `backend/features/requests/controller.js`
  - Routes: `backend/features/requests/routes.js`
- Settings
  - Controller: `backend/features/settings/controller.js`
  - Routes: `backend/features/settings/routes.js`

Shared backend:
- DB schema/init: `backend/config/db.js`
- Default template: `backend/config/defaultTemplate.js`
- Auth middleware: `backend/middleware/authMiddleware.js`
- Global errors: `backend/middleware/errorHandler.js`
- Encryption helpers: `backend/utils/crypto.js`
- Scheduler: `backend/scheduler.js`

Utilities:
- DB audit helper: `backend/audit_db.js`
- Settings print helper: `backend/print-settings.js`

## Fast Lookup

- Admin login logic:
  - Frontend: `frontend/js/core/auth.js`
  - Backend: `backend/features/auth/controller.js`

- Birthday CRUD logic:
  - Backend handlers: `backend/features/birthdays/crudHandlers.js`
  - Birthday routes: `backend/features/birthdays/routes.js`

- Student correction flow:
  - Frontend submit form: `frontend/js/pages/student.js`
  - Backend request APIs: `backend/features/requests/controller.js`

- SMTP and auto-send config:
  - Settings APIs: `backend/features/settings/controller.js`
  - Scheduler runtime: `backend/scheduler.js`
