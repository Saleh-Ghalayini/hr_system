# HR System

> **Repository:** `hr-system/` monorepo — Laravel 12 backend + React 19 frontend
> **Last Updated:** 2026-04-18

---

## Overview

A full-stack **Human Resource Management System** built with a Laravel 12 REST API and React 19 SPA. Covers attendance tracking (with geolocation), payroll, training & certifications, performance evaluation (360-degree, goals, cycles), leave management (9 leave types), onboarding (document templates + checklist tracking), recruitment, project/task management, internal messaging, announcements, and holidays.

---

## Technology Stack

### Backend
| Concern | Technology |
|---|---|
| Framework | Laravel 12 |
| Language | PHP ^8.2 |
| Authentication | JWT (`php-open-source-saver/jwt-auth ^2.8`) |
| Database | MySQL (SQLite for dev) |
| Testing | PHPUnit ^11.5 |
| Code Style | Laravel Pint |

### Frontend
| Concern | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 6 |
| Routing | react-router-dom ^7 |
| HTTP Client | Axios ^1.8 |
| UI Components | Custom CSS + Material UI components |
| Charts | Chart.js ^4 + react-chartjs-2 |
| Icons | Iconify ^5 (`mdi:` prefix) |
| Notifications | react-toastify ^11 |

---

## Project Structure

```
hr-system/
├── hr-system-backend/          # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/   # 21 controllers
│   │   ├── Http/Middleware/     # AdminMiddleware, ManagerMiddleware
│   │   ├── Http/Requests/       # 25+ Form Request classes
│   │   ├── Models/             # 35+ Eloquent models
│   │   ├── Services/           # 7 service classes
│   │   ├── Observers/          # UserObserver, TaskObserver
│   │   ├── Traits/             # ApiResponse
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/          # 28 migrations
│   │   └── seeders/            # 17 idempotent seeders
│   ├── routes/api.php
│   └── tests/                   # 82+ tests (feature + unit)
│
├── hr-system-frontend/          # React 19 SPA
│   └── src/
│       ├── pages/               # 12 sections, lazy loaded
│       ├── components/          # 15+ reusable components
│       ├── context/             # AuthContext
│       ├── hooks/               # useAuth, useCourses, useUsers, useLeaves
│       ├── common/              # request.js (401 interceptor)
│       └── services/            # dashboardService.js
│
├── docs/                        # Project documentation
└── HR_System_Presentation.pptx
```

---

## Features

### Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Admin-only summary with charts (Bar, Doughnut, Line, Radar) |
| **Attendance** | Check-in/out with GPS, location review, reports, settings |
| **Leave** | 9 leave types, half-day support, manager approval, sick leave reports |
| **Payroll** | Salary list, payroll details (overtime/bonus/deductions), generate by month |
| **Performance** | Self-assessment, peer reviews (360°), goals, review cycles, manager ratings |
| **Training** | Course catalog, enrollments, self-service My Learning with progress tracking |
| **Profile** | Basic info (photo upload), job details, salary history |
| **Onboarding** | Document templates, checklist items, employee upload/approval flow, admin overview |
| **Recruitment** | Job openings, candidates (CV upload), applications |
| **Projects & Tasks** | Project management with task activity logs |
| **Regulations** | Compliance tracking with requirements |
| **Messages** | Inbox/sent, threaded reply, mark-read, delete |
| **Announcements** | Pinned/typed, role-targeted, scheduled with expiry |
| **Holidays** | Year-based calendar, public/company, recurring support |
| **Directory** | Employee grid with search, position filter, profile modal |

---

## Setup

### Prerequisites
- PHP ^8.2 + Composer
- Node.js ^18 + npm
- MySQL (or SQLite for dev)

### Backend

```sh
cd hr-system-backend
cp .env.example .env
php artisan key:generate
php artisan jwt:secret          # if not auto-generated
php artisan migrate:fresh --seed
php artisan serve
```

- **Health check:** `GET /api/health`
- **Base URL:** `http://127.0.0.1:8000/api/v1`

### Frontend

```sh
cd hr-system-frontend
npm install
npm run dev
```

- **Dev URL:** `http://localhost:5173`
- **API Base URL:** Set via `VITE_Base_API` in `.env` (e.g. `http://127.0.0.1:8000/api`)

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

## Key Architecture Patterns

- **ApiResponse trait** — standardized `success()`, `error()`, `notFound()`, etc.
- **Service layer** — business logic separated from controllers (AttendanceService, LeaveService, InsuranceService, PerformanceService, JobApplicationService, EnrollmentService, ProfileService)
- **Observers** — `UserObserver` auto-creates Payroll + LeaveBalance on signup; `TaskObserver` logs activity
- **JWT auth** with `throttle:5,1` rate limiting on login; 60 min TTL, 20160 min refresh
- **RBAC** — 4 levels: guest, authenticated, manager, admin
- **401 interceptor** in `request.js` auto-redirects to login
- **Geolocation attendance** — Haversine formula with configurable radius, optional enforcement, remote check-in support
- **Performance engine** — self-assessment, peer reviews (360°), goals, review cycles, manager/adverage ratings, department overview, manager finalization

---

## Database Schema

39 tables across 10 domains: Core, HR & Compensation, Leave, Attendance, Performance, Learning & Development, Recruitment, Projects & Tasks, Compliance, Internal Comms & Calendar, Onboarding, System & Audit.

See `docs/db-schema.md` for the full schema reference.

---

## API Documentation

See `docs/api-endpoints.md` for the complete API reference (base URL, auth headers, all endpoint groups, request/response examples).

---

## Documentation Quick Links

| Document | Description |
|---|---|
| `docs/api-endpoints.md` | Full API endpoint reference |
| `docs/db-schema.md` | Database schema with relationships |
| `docs/hr_system_erd.html` | Interactive ER diagram (Mermaid) |
| `docs/progress.md` | Phase-by-phase development log |
| `docs/project-review.md` | Project overview, security, code quality |
| `docs/project-audit.md` | Issue tracker across 6 audit sessions |
| `docs/page-by-page-validation.md` | Live API validation per frontend page |
| `docs/attendance-changelog.md` | Attendance implementation details |
| `docs/training-feature-audit.md` | Training module audit |

---

## Verification Checklist

- [ ] `php artisan migrate:fresh --seed` passes
- [ ] `npm run build` passes
- [ ] Backend tests pass (`php artisan test`)
- [ ] No rogue colors, console.logs, or hardcoded API URLs
- [ ] ErrorBoundary + 404 + lazy loading + 401 interceptor in place
- [ ] Responsive @media queries on all pages
- [ ] All icons standardized to `mdi:` prefix
- [ ] All seeders idempotent

---

## ER Diagram

Interactive ER diagram (Mermaid): [`docs/hr_system_erd.html`](docs/hr_system_erd.html)

---

## License

MIT