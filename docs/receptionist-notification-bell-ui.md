# Receptionist notification bell UI

## What changed

- Added the shared `NotificationBell` to `src/components/receptionist/ReceptionistLayout.tsx`.
- Added a polished receptionist top bar with page title, subtitle, compact notification action area, and current user summary.
- Added `/receptionist/notifications` via `src/app/receptionist/notifications/page.tsx`, reusing the existing `NotificationCenterScreen`.
- Added a Notifications item to `src/components/receptionist/ReceptionistSidebar.tsx`.
- Updated `NotificationBell` with an optional `viewAllHref` prop; existing Patient/Doctor behavior keeps the old default route.

## Notification ownership

The receptionist layout does not pass a manual email to the bell. `NotificationBell` continues to use the current authenticated identity and JWT-scoped notification APIs:

- `GET /notifications/by-email`
- `GET /notifications/count`
- `PATCH /notifications/:id/read`

The backend remains the source of truth for ownership. The bell also keeps its existing auth-boundary reset and stale-request guards, so switching Receptionist -> Patient/Doctor or Patient/Doctor -> Receptionist clears old state and ignores late responses.

## Realtime assignment refresh

`NotificationBell` already handles:

- `ASSIGNMENT_TASK_CREATED`
- `ASSIGNMENT_TASK_REMINDER`
- `ASSIGNMENT_TASK_EXPIRED`

Those handlers emit `ASSIGNMENT_TASKS_CHANGED_EVENT`. The assignment queue hook now listens to that in-app event and refreshes the queue. Polling remains the durable fallback, so the queue still works if a realtime event is missed.

## Manual test steps

1. Login as a receptionist and open `/receptionist/visits`.
2. Confirm the header shows the notification bell and user summary.
3. Open the bell dropdown and confirm unread count/list load for the receptionist.
4. Click `View all notifications` and confirm it navigates to `/receptionist/notifications`.
5. Trigger an assignment task notification and confirm the bell refreshes.
6. On `/receptionist/assignments`, confirm assignment-task notifications refresh the queue.
7. Logout and login as Patient/Doctor; confirm receptionist notifications are not visible.
8. Logout Patient/Doctor and login as Receptionist; confirm Patient/Doctor notifications are not visible.
