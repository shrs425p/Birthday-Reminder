# Birthday Reminder - Detailed Block Diagram

```mermaid
flowchart TB
    %% Actors
    Visitor[Visitor]
    Student[Student]
    Admin[Admin]

    %% Frontend
    subgraph FE[Frontend Layer - HTML CSS Vanilla JS]
        Home[Home Page /]
        StudentPage[Student Page /student]
        AdminPage[Admin Page /admin]
        ApiClient[JS API Client + Auth Helpers]
    end

    %% Server entry
    subgraph APP[Application Layer - Express]
        Server[server.js\nStatic hosting + route wiring]
        ErrorHandler[Global error handler + API 404]
    end

    %% Middleware
    subgraph MW[Security and Access Control]
        RequireAuth[requireAuth\nJWT validation]
        RequireAdmin[requireAdmin\nrole check admin]
    end

    %% Feature modules
    subgraph MOD[Feature Modules]
        AuthMod[Auth Module\nPOST /api/login\nPUT /api/password]
        BirthdaysMod[Birthdays Module\nGET /today /upcoming /\nGET /stats\nPOST /\nPUT /:id\nDELETE /:id\nPOST /upload\nPOST /wish]
        RequestsMod[Requests Module\nPOST /api/requests\nGET /api/requests\nPUT /api/requests/:id/status]
        SettingsMod[Settings Module\nGET /api/settings\nPUT /api/settings/:key]
    end

    %% Services
    subgraph SVC[Background and Messaging Services]
        Scheduler[scheduler.js\nnode-cron daily trigger]
        Mailer[emailService + nodemailer]
        Crypto[crypto util\nSMTP password encrypt/decrypt]
    end

    %% Data
    subgraph DBL[Data Layer - SQLite]
        Users[(users)]
        Birthdays[(birthdays)]
        Requests[(requests)]
        Settings[(settings)]
    end

    SMTP[(External SMTP Provider)]
    Uploads[(uploads folder)]

    %% Actor to frontend
    Visitor --> Home
    Student --> StudentPage
    Admin --> AdminPage

    %% Frontend to backend
    Home --> ApiClient
    StudentPage --> ApiClient
    AdminPage --> ApiClient
    ApiClient --> Server
    Server --> ErrorHandler

    %% Route access flow
    Server --> AuthMod
    Server --> BirthdaysMod
    Server --> RequestsMod
    Server --> SettingsMod
    Server --> Scheduler

    BirthdaysMod --> RequireAuth
    RequestsMod --> RequireAuth
    SettingsMod --> RequireAuth
    BirthdaysMod --> RequireAdmin
    RequestsMod --> RequireAdmin
    SettingsMod --> RequireAdmin

    %% Module to data
    AuthMod --> Users
    BirthdaysMod --> Birthdays
    RequestsMod --> Requests
    SettingsMod --> Settings

    %% Upload and mail flow
    BirthdaysMod --> Uploads
    BirthdaysMod --> Mailer
    Scheduler --> Mailer
    Scheduler --> Birthdays
    Scheduler --> Settings
    SettingsMod --> Scheduler

    Mailer --> Crypto
    SettingsMod --> Crypto
    Crypto --> Settings
    Mailer --> SMTP
```
