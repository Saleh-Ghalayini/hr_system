# HR System — Frontend

> React 19 SPA for the HR Management System
> **Last Updated:** 2026-04-18

---

## Overview

React 19 SPA providing a full-featured HR management interface:
- Dashboard with charts (admin-only)
- Attendance with geolocation check-in/out
- Leave requests and balance (9 leave types, half-day)
- Payroll with live net calculation preview
- Performance (self-assessment, peer reviews, goals, ratings)
- Training with course catalog and My Learning progress
- Onboarding (document upload, checklist, admin overview)
- Messages (inbox/sent, compose, reply)
- Announcements (info/warning/urgent, pinned, scheduled)
- Holidays calendar
- Employee directory

---

## Quick Start

```sh
cd hr-system-frontend
npm install
npm run dev
```

- **Dev URL:** `http://localhost:5173`
- **API Base:** Set via `VITE_Base_API` in `.env` (e.g. `http://127.0.0.1:8000/api`)

---

## Build

```sh
npm run build
```

Output in `dist/` folder.

---

## Key Architecture

| Pattern | Implementation |
|---|---|
| API layer | `request.js` — centralized wrapper with token + 401 interceptor |
| Auth state | `AuthContext` — login/logout/token/user |
| Routing | `react-router-dom ^7` — lazy loaded pages with `Suspense` |
| Role-based access | `RoleRoute` — wraps admin/manager-only routes |
| Auth guard | `ProtectedRoute` — redirects to login if unauthenticated |
| Error handling | `ErrorBoundary` — wraps entire app, prevents white-screen crashes |
| Notifications | `react-toastify` — toast for all API feedback |
| Charts | Chart.js ^4 + react-chartjs-2 + Filler plugin |

---

## Routing

All routes are lazy-loaded. Routes with role restrictions use `<RoleRoute>`:

| Route | Allowed Roles | Notes |
|---|---|---|
| `/dashboard` | Admin | |
| `/attendance/*` | All (admin sees all, others see own) | Sick leave report, settings → admin only |
| `/payroll/*` | Admin, Manager | |
| `/performance/*` | All (admin/manager pages via RoleRoute) | |
| `/training/*` | All (catalog/enrollments → admin only) | |
| `/onboarding/management` | Admin | |
| `/onboarding/new-hires` | Admin | |
| `/onboarding/user/:userId` | Admin | |
| `/onboarding/documents` | All | |
| `/onboarding/checklist` | All | |
| `/messages` | All | Own messages only |
| `/announcements` | All (read) / Admin (write) | |
| `/holidays` | All (read) / Admin (write) | |
| `/directory` | All | |
| `/profile/*` | All | Own data only |

---

## API Integration

All API calls go through `src/common/request.js`:

```js
request({
  url: '/admin/users',
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` },
  params: { page: 1 }
})
```

The wrapper reads token from localStorage and sessionStorage, sends the request, and handles 401 responses (clears auth, redirects to `/login`).

Response format: `{ success: true, data: { ... } }` — frontend reads `response.data`.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Primary | `#142f5a` | Sidebar, buttons, headings |
| Hover | `#1e4a8a` | Button hover |
| Accent | `#28eea7` | Active nav, highlights |
| Success | `#069855` | Approved, completed |
| Warning | `#d39c1d` | Pending, in progress |
| Danger | `#d62525` | Rejected, errors |
| Background | `#f5f7fa` | Page background |
| Font | Poppins (headings) / Lato (body) | Via Google Fonts |

---

## Pages

```
src/pages/
├── Announcements/           ← Company announcements board
├── Attendance/
│   ├── AttendanceRecords/  ← Check-in/out + records table
│   ├── AttendanceReports/  ← Admin stats + filtered table
│   ├── AttendanceSettings/ ← Admin work hours + geofence
│   ├── LeaveRequests/      ← Manager leave approval
│   ├── MyLeave/            ← Employee leave balance + requests
│   └── SickLeaveReport/    ← Admin sick leave report
├── Auth/Login/             ← Split-panel login
├── Directory/              ← Employee grid with search
├── Holidays/               ← Year-based holiday calendar
├── Messages/               ← Inbox/sent, compose, reply
├── NotFound/               ← 404 page
├── Onboarding/
│   ├── AdminOnboarding/    ← Admin: all users' progress
│   ├── Checklist/          ← Employee: interactive checklist
│   ├── Documents/          ← Employee: document upload
│   ├── EmployeeOverview/   ← Employee: own progress dashboard
│   ├── NewHire/             ← Admin: user registration
│   └── UserOnboardingDetail/← Admin: per-user detail + approve
├── Payroll/
│   ├── InsurancesAndTax/   ← Insurance/tax management
│   ├── PayrollDetails/     ← Admin payroll management
│   └── Salaries/           ← Employee salary list
├── Performance/pages/
│   ├── AdminAverage/        ← Avg ratings per type
│   ├── AdminRate/          ← Rate individual employees
│   ├── EmpPerfo/           ← Employee performance summary
│   ├── EmpRate/            ← Employee view of ratings received
│   ├── Goals/              ← Goal management
│   └── PeerReview/         ← Peer review (360°)
├── Profile/pages/
│   ├── BasicInfo/          ← Photo upload + personal info
│   ├── JobInfo/            ← Job details
│   └── Salary/             ← Payroll history
└── Training/
    ├── CourseCatalog/      ← Admin course CRUD
    ├── Enrollments/        ← Admin enrollment management
    ├── Layout/             ← Training section layout
    └── MyLearning/         ← Employee course progress
```

---

## Project Structure

```
src/
├── common/
│   ├── request.js           ← API wrapper (401 interceptor)
│   └── subNavBarLinks.js    ← Nav link configs
├── components/
│   ├── Button/, Input/, Select/, StatusField/
│   ├── Chart/               ← Chart.js wrapper (Filler plugin registered)
│   ├── CustomIcon/          ← Icon rendering
│   ├── Dashboard/           ← Dashboard with widgets + charts
│   ├── ErrorBoundary/       ← React error boundary
│   ├── Header/, NavBar/, SideBar/, SubNavBar/
│   ├── Pagination/          ← Page navigation
│   ├── ProtectedRoute/      ← Auth guard
│   ├── RoleRoute/           ← Role-based route guard
│   └── Table/               ← Reusable data table
├── context/
│   └── AuthContext.jsx      ← Auth state management
├── hooks/
│   ├── useAuth.jsx
│   ├── useCourses.jsx
│   ├── useInitialPageLoader.jsx
│   └── useUsers.jsx
├── pages/                   ← All page components (lazy loaded)
├── services/
│   └── dashboardService.js  ← Dashboard API calls
└── App.jsx                  ← Routes with lazy loading + Suspense
```

---

## API Documentation

Full endpoint reference: `docs/api-endpoints.md`
Progress log: `docs/progress.md`