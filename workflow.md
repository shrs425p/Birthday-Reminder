# Detailed Workflow Diagram

Last Updated: 2026-04-22

```mermaid
flowchart TD
    Start([Start Application]) --> Boot[Load env and initialize Express]
    Boot --> DBInit[Open SQLite and ensure tables + default settings]
    DBInit --> RouteWire[Register static pages and API routes]
    RouteWire --> StartCron[Start scheduler using DB auto_send_time]
    StartCron --> Wait[System ready for requests]

    %% Public flow
    Wait --> PublicAccess{Public user action}
    PublicAccess -->|Open home| HomePage[Home page loads]
    HomePage --> PubToday[GET /api/birthdays/today]
    HomePage --> PubUpcoming[GET /api/birthdays/upcoming]
    HomePage --> PubAll[GET /api/birthdays]
    PubToday --> BirthdaysRead[(Read birthdays)]
    PubUpcoming --> BirthdaysRead
    PubAll --> BirthdaysRead
    PublicAccess -->|Quick wish trigger| QuickSend[POST /api/send-wishes]
    QuickSend --> QuickMailReady{SMTP configured}
    QuickMailReady -->|No| ConfigErr[Return configuration error]
    QuickMailReady -->|Yes| TodayRows[(Query todays birthdays)]

    %% Student flow
    Wait --> StudentAccess{Student action}
    StudentAccess -->|View records| StuView[GET /api/birthdays]
    StuView --> BirthdaysRead
    StudentAccess -->|Raise correction| StuReq[POST /api/requests]
    StuReq --> SaveReq[(Insert request with pending status)]

    %% Admin auth flow
    Wait --> AdminAccess{Admin action}
    AdminAccess --> AdminLogin[POST /api/login]
    AdminLogin --> CredCheck{Credentials valid}
    CredCheck -->|No| LoginFail[Return 401]
    CredCheck -->|Yes| IssueJWT[Issue JWT token]

    %% Admin authorized operations
    IssueJWT --> AuthGate[requireAuth + requireAdmin]
    AuthGate --> Ops{Choose operation}

    Ops --> Stats[GET /api/birthdays/stats]
    Stats --> BirthdaysRead

    Ops --> AddBday[POST /api/birthdays]
    AddBday --> WriteBday[(Insert birthday)]

    Ops --> EditBday[PUT /api/birthdays/:id]
    EditBday --> UpdateBday[(Update birthday)]

    Ops --> DeleteBday[DELETE /api/birthdays/:id]
    DeleteBday --> RemoveBday[(Delete birthday)]

    Ops --> UploadXlsx[POST /api/birthdays/upload]
    UploadXlsx --> ParseFile[Parse XLSX and validate rows]
    ParseFile --> BulkWrite[(Bulk insert or skip invalid)]

    Ops --> ManualWish[POST /api/birthdays/wish]
    ManualWish --> MailReady{SMTP configured}
    MailReady -->|No| ConfigErr[Return configuration error]
    MailReady -->|Yes| TodayRows[(Query todays birthdays)]
    TodayRows --> SendMail[Send emails using template]

    Ops --> ViewReq[GET /api/requests]
    ViewReq --> ReadReq[(Read requests)]

    Ops --> UpdateReq[PUT /api/requests/:id/status]
    UpdateReq --> WriteReq[(Update request status)]

    Ops --> GetSettings[GET /api/settings]
    GetSettings --> ReadSettings[(Read settings)]

    Ops --> PutSetting[PUT /api/settings/:key]
    PutSetting --> EncryptPass{key is email_pass}
    EncryptPass -->|Yes| Encrypt[Encrypt before save]
    EncryptPass -->|No| SavePlain[Save value]
    Encrypt --> SaveSetting[(Upsert setting)]
    SavePlain --> SaveSetting
    SaveSetting --> Reschedule{key is auto_send_time}
    Reschedule -->|Yes| RestartCron[Restart scheduler]
    Reschedule -->|No| DoneReq[Return success]
    RestartCron --> DoneReq

    %% Scheduled flow
    Wait --> CronTick{Cron trigger reached}
    CronTick --> RunDaily[runDailyWishes]
    RunDaily --> CronMailReady{SMTP configured}
    CronMailReady -->|No| SkipRun[Skip with warning log]
    CronMailReady -->|Yes| CronToday[(Query todays birthdays)]
    CronToday --> CronSend[Send birthday emails]
    CronSend --> CronLog[Log sent count]
```

# Step-by-Step Workflow (Code-Aligned)

1. `backend/server.js` loads environment variables first and validates required `PORT`.
2. `backend/config/db.js` initializes SQLite schema (`users`, `birthdays`, `requests`, `settings`) and seeds defaults.
3. Express mounts static frontend files from `frontend/` and clean page aliases (`/`, `/admin`, `/student`).
4. API routes mount in this order: `/api` (auth), `/api/send-wishes`, `/api/birthdays`, `/api/requests`, `/api/settings`.
5. Public flows use `GET /api/birthdays`, `/today`, `/upcoming`, and `POST /api/requests`.
6. Admin login uses `POST /api/login`; successful login returns JWT stored by frontend in `localStorage`.
7. Admin-only operations are protected by `requireAuth` + `requireAdmin` middleware.
8. Birthday management includes CRUD, stats, XLSX upload, and `POST /api/birthdays/wish`.
9. Shortcut `POST /api/send-wishes` runs today-wish sending logic without requiring admin middleware.
10. Settings updates encrypt `email_pass` before save and restart scheduler when `auto_send_time` changes.
11. Scheduler time precedence is `auto_send_time` from DB, else `CRON_SCHEDULE`, else fallback `0 8 * * *` (IST).
12. Non-API unknown routes return `frontend/pages/404.html`; unknown API routes are forwarded to JSON error handler.

## Mounted API Entry Points

- POST /api/login
- PUT /api/password
- PUT /api/password
- POST /api/send-wishes (public shortcut)
- /api/birthdays/* (public read + admin write)
- /api/requests/* (public create + admin review)
- /api/settings/* (admin only)

## Route Protection Summary

Public:
- POST /api/login
- PUT /api/password
- GET /api/birthdays
- GET /api/birthdays/today
- GET /api/birthdays/upcoming
- POST /api/requests
- POST /api/send-wishes

Admin only:
- GET /api/birthdays/stats
- POST /api/birthdays
- PUT /api/birthdays/:id
- DELETE /api/birthdays/:id
- POST /api/birthdays/upload
- POST /api/birthdays/wish
- GET /api/requests
- PUT /api/requests/:id/status
- GET /api/settings
- PUT /api/settings/:key

## Current Structure Snapshot (excluding backend/node_modules)

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
