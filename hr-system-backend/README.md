# HR System — Backend

> Laravel 12 REST API for the HR Management System
> **Last Updated:** 2026-04-18

---

## Overview

Laravel 12 REST API providing JWT-authenticated endpoints for:
- Attendance tracking with geolocation (Haversine formula)
- Payroll with overtime/bonus/deductions (auto-recalculated on tax/insurance changes)
- Leave management (9 leave types, half-day support, balance-exempt)
- Performance evaluation (self-assessment, peer reviews, goals, review cycles, manager finalization)
- Training & enrollments with progress tracking
- Onboarding (document templates, checklist items, user progress, file uploads)
- Recruitment (job openings, candidates, applications)
- Projects & tasks with activity logs
- Regulations & compliance tracking
- Internal messaging (threaded inbox/sent)
- Announcements (typed, pinned, role-targeted, scheduled)
- Holidays (public/company, recurring)
- Admin dashboard summary

---

## Quick Start

```sh
cd hr-system-backend
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
```

- **API Base:** `http://127.0.0.1:8000/api`
- **Health Check:** `GET /api/health`
- **Version:** `v1` (prefix all routes with `/api/v1/`)

---

## Authentication

JWT via Laravel Sanctum. All routes except `/guest/*` require:

```
Authorization: Bearer {token}
```

Login returns: `{ success: true, data: { id, first_name, last_name, email, role, token } }`

---

## Seeded Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@hr.com | SecurePass123 |
| Manager | manager@hr.com | SecurePass123 |
| Employee | maya@hr.com | SecurePass123 |
| Employee | hassan@email.com | SecurePass123 |

All 10 seeded users share the password `SecurePass123`.

---

## Key Architecture

| Pattern | Implementation |
|---|---|
| Response format | `ApiResponse` trait (`success()`, `error()`, `notFound()`, etc.) |
| Validation | 25+ Form Request classes (zero inline validation) |
| Business logic | 7 Service classes (AttendanceService, LeaveService, etc.) |
| Auth hooks | `UserObserver` (Payroll + LeaveBalance auto-create), `TaxObserver`, `InsuranceObserver` |
| Task audit | `TaskObserver` logs all field changes to `task_activity_logs` |
| RBAC | AdminMiddleware (admin-only), ManagerMiddleware (manager + admin) |

---

## Key Endpoints

| Group | Route Prefix | Auth |
|---|---|---|
| Guest | `/guest/` | None |
| Auth | `/` | Bearer |
| Attendance | `/attendance/` | Bearer |
| Leave | `/leave/` | Bearer |
| Performance | `/performance/` | Bearer |
| Messages | `/messages/` | Bearer |
| Onboarding | `/onboarding/` | Bearer |
| Admin | `/admin/` | Bearer + Admin |
| Admin Payroll | `/admin/payroll/` | Bearer + Admin |
| Admin Performance | `/admin/performance/` | Bearer + Admin |
| Admin Onboarding | `/admin/onboarding/` | Bearer + Admin |

See `docs/api-endpoints.md` for the full API reference.

---

## Testing

```sh
php artisan test
# or
./vendor/bin/phpunit
```

82+ tests covering: Auth, Attendance, Leave, Payroll, Training, LeaveService, AttendanceService.

---

## Database

- **Driver:** MySQL (SQLite for development)
- **Migrations:** 28 migration files
- **Seeders:** 17 idempotent seeders (safe for `migrate:fresh --seed` and `db:seed`)
- **Schema:** See `docs/db-schema.md`

---

## Environment Variables

| Variable | Description |
|---|---|
| `APP_KEY` | Laravel app key |
| `JWT_SECRET` | JWT authentication secret |
| `DB_CONNECTION` | mysql or sqlite |
| `COMPANY_LAT` | Company latitude for geofence |
| `COMPANY_LON` | Company longitude for geofence |
| `MAIL_MAILER` | Mail driver (log, smtp, etc.) |

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/        (21 controllers)
│   ├── Middleware/         (AdminMiddleware, ManagerMiddleware)
│   └── Requests/           (25+ Form Request classes)
├── Models/                 (35+ Eloquent models)
├── Services/               (7 service classes)
├── Observers/              (UserObserver, TaskObserver, etc.)
├── Traits/                 (ApiResponse)
└── Providers/
database/
├── migrations/             (28 migrations)
└── seeders/                (17 seeders)
routes/
├── api.php                  (all API routes)
└── web.php
tests/
├── Feature/                (54 tests)
└── Unit/                   (28 tests)
```

---

## API Documentation

Full endpoint reference: `docs/api-endpoints.md`
Database schema: `docs/db-schema.md`
Progress log: `docs/progress.md`