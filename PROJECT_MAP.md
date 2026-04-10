# Project Navigation Map

Use this file when someone asks, "Where is this code?".

## Frontend (what user sees)

- Pages HTML:
	- Home page: `frontend/pages/index.html`
	- Admin page: `frontend/pages/admin.html`
	- Student page: `frontend/pages/student.html`
	- Not found page: `frontend/pages/404.html`

- Page logic JS:
	- Home page behavior: `frontend/js/pages/home.js`
	- Admin page behavior: `frontend/js/pages/admin.js`
	- Student page behavior: `frontend/js/pages/student.js`

- Shared JS (used by many pages):
	- API calls to backend: `frontend/js/core/api/`
	- Login/session logic: `frontend/js/core/auth.js`
	- UI helpers (toast/theme/animations): `frontend/js/core/ui-utils.js`

- Styles:
	- Main CSS entry: `frontend/style.css`
	- Shared tokens/layout: `frontend/styles/shared/tokens-layout.css`
	- Reusable UI components: `frontend/styles/features/components.css`
	- Home-page specific style blocks: `frontend/styles/pages/home-v2.css`

## Backend (API and database logic)

- Server entry point:
	- App startup + route mounting: `backend/server.js`

- Feature modules:
	- Auth feature:
		- Controller: `backend/features/auth/controller.js`
		- Routes: `backend/features/auth/routes.js`
	- Birthdays feature:
		- Controller: `backend/features/birthdays/controller.js`
		- Routes: `backend/features/birthdays/routes.js`
	- Requests feature:
		- Controller: `backend/features/requests/controller.js`
		- Routes: `backend/features/requests/routes.js`
	- Settings feature:
		- Controller: `backend/features/settings/controller.js`
		- Routes: `backend/features/settings/routes.js`

- Shared backend folders:
	- DB setup + schema: `backend/config/db.js`
	- Default email HTML template: `backend/config/defaultTemplate.js`
	- Auth middleware: `backend/middleware/authMiddleware.js`
	- Global error handler: `backend/middleware/errorHandler.js`
	- Encryption helpers: `backend/utils/crypto.js`
	- Auto mail scheduler: `backend/scheduler.js`

- Utility scripts:
	- DB quick audit: `backend/audit_db.js`
	- Print settings table: `backend/print-settings.js`

## Quick "examiner question" lookup

- "Where is admin login code?"
	- Frontend login call: `frontend/js/core/auth.js`
	- Backend login API logic: `backend/features/auth/controller.js`

- "Where are birthday CRUD APIs?"
	- API logic: `backend/features/birthdays/controller.js`
	- API route definitions: `backend/features/birthdays/routes.js`

- "Where is student correction request code?"
	- Student form submit logic: `frontend/js/pages/student.js`
	- Request APIs: `backend/features/requests/controller.js`

- "Where is email config and auto-send time?"
	- Settings API logic: `backend/features/settings/controller.js`
	- Scheduler runtime: `backend/scheduler.js`

