# Detailed Workflow Diagram

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

# Step-by-Step Workflow (Report Friendly)

1. Server boots, loads environment variables, and connects to SQLite.
2. Database tables are created or migrated: users, birthdays, requests, settings.
3. Default settings such as email template and auto_send_time are ensured.
4. Frontend pages are served at /, /student, and /admin.
5. Public users can view today, upcoming, and full birthday lists.
6. Students can submit correction requests to be reviewed by admins.
7. Admin logs in, receives JWT, and performs protected operations.
8. Admin manages birthdays, uploads Excel sheets, and sends manual wishes.
9. Admin settings update SMTP credentials, template, and dispatch time.
10. When auto_send_time changes, scheduler restarts with the new cron rule.
11. Daily scheduler checks todays birthdays and sends emails automatically.
12. Errors are returned as JSON for API routes and custom 404 is served for unknown pages.
