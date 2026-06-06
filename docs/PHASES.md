# Delivery Notes

## Requirement Analysis

Useful additions for a remote software company:

- First-login password reset for all seeded users.
- Validations for overlapping leave, duplicate check-ins, open breaks, and checkout order.
- Same-day activity edits only before checkout.
- Role-based API and UI access.
- Browser/session metadata on check-in for lightweight auditability.
- Configurable lateness rules in `server/src/data/settings.json`.
- JSON write queues, atomic file replacement, and backups to reduce corruption risk.
- CSV and Excel-compatible exports without a database dependency.

Security measures:

- JWT authentication with short-lived tokens.
- bcrypt password hashing.
- No password hashes returned from API responses.
- Helmet, CORS configuration, status-code based errors, and admin-only management routes.
- Production note: set `JWT_SECRET` and `CLIENT_URL` in environment variables before deployment.

## Phases Implemented

1. Folder structure: `client`, `server`, `shared`, and `docs`.
2. Backend: Express app, middleware, JSON repositories, seed data, error handling.
3. Authentication: login, current user, JWT guard, first password change.
4. Attendance: check-in, break start/end, checkout, history, browser/session capture.
5. Work logs: unlimited daily activities with Jira, PR, story points, blockers, notes.
6. Admin dashboard: present, absent, late, active, leave, hours, story point metrics.
7. Reports and analytics: daily rows, chart-ready analytics, CSV and Excel-compatible exports.
8. UI polish: responsive SaaS shell, dark mode, empty/loading/error states.
9. Testing: focused backend utility tests and verified frontend production build.
