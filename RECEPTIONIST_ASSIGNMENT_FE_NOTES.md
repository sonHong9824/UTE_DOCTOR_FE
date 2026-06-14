# Broad Booking + Receptionist Assignment — FE Integration Notes

Analysis note for integrating the **updated** api-contract (`api-contract@1e73888`,
docs `README_BROAD_BOOKING_REDIS_FE_INTEGRATION.md` + `api.md` Assignment Tasks +
`README_NOTIFICATION_UNIFIED_SOCKET.md`).

**Key principle:** the DB assignment-task queue is the source of truth. Realtime is a
best-effort nudge — the receptionist UI must stay correct from polling alone. Redis/RabbitMQ
recovery is out of scope. All changes are additive / backward-compatible.

## What already existed (prior commits 30612d0, 4d77f7c)
- `src/apis/appointment/assignment-task.api.ts` — list/get/accept/release/assign + blockedReason map.
- `src/features/receptionist-assignments/screens/AssignmentTasksScreen.tsx` — queue UI (accept/assign/release).
- `src/features/receptionist-assignments/components/AssignDoctorSlotDialog.tsx` — doctor/slot picker.
- `src/features/appointment/hooks/useAppointmentBooking.ts` — broad booking path (`broadBooking:true`)
  fully wired, incl. DICH_VU deposit popup/polling resolving to `AWAITING_ASSIGNMENT`.
- Types: `BroadBookingPayload`, `AppointmentBookingResult` (`assignmentTaskId`, `assignmentStatus`).

## Gaps vs the updated contract
1. `TASK_LOCK_HELD` (new transient error on accept/assign) not mapped — must show "being handled by
   another receptionist", keep the card, refresh. Distinct from durable `TASK_ALREADY_ACCEPTED`.
2. Receptionist queue has **no polling** — required so the UI works with zero realtime.
3. Receptionist queue has **no realtime refresh** — recommended (refresh sooner on `ASSIGNMENT_TASK_*`).
4. `NotificationMap` missing `ASSIGNMENT_TASK_CREATED/REMINDER/EXPIRED`, `APPOINTMENT_DOCTOR_ASSIGNED`,
   `APPOINTMENT_RESCHEDULED`.
5. `NOTIFICATION_RECEIVED` handler map (`notification-bell.tsx`) missing those handlers + crashes on an
   unknown `type` (no defensive guard).
6. Patient appointment list does not refresh on `APPOINTMENT_DOCTOR_ASSIGNED`.

## Files to add / modify
- **add** `src/lib/realtimeEvents.ts` — window CustomEvent bus (follows authTokenStore pattern):
  `ASSIGNMENT_TASKS_CHANGED_EVENT`, `APPOINTMENT_DOCTOR_ASSIGNED_EVENT`, `emitAppRealtimeEvent`.
- **add** `src/features/receptionist-assignments/hooks/useAssignmentTaskRealtime.ts` — subscribes the
  queue screen directly to `/notification` (the receptionist layout has no NotificationBell) + window bus.
- **edit** `src/types/notification.dto.ts` — new DTOs + `NotificationMap` entries.
- **edit** `src/components/notification/notification-bell.tsx` — handlers for the 5 new types,
  defensive dispatch, patient toast + bus emit on `APPOINTMENT_DOCTOR_ASSIGNED`.
- **edit** `src/apis/appointment/assignment-task.api.ts` — `TASK_LOCK_HELD` message + `isTransientBlockedReason`.
- **edit** `src/features/receptionist-assignments/screens/AssignmentTasksScreen.tsx` — polling (~20s) +
  realtime hook + correct `TASK_LOCK_HELD` (keep card) vs `TASK_ALREADY_ACCEPTED` (drop after refresh) UX.
- **edit** `src/features/medical-record/components/MedicalRecordDetailContainer.tsx` — refresh patient
  appointment list on the `APPOINTMENT_DOCTOR_ASSIGNED_EVENT`.

## Socket / heartbeat
- Heartbeat stays at 25s (`socket.service.ts`) — contract still requires ~25–30s.
- `JOIN_ROOM` is now optional (backend auto-joins email room) but kept (idempotent, backward-compatible);
  dropping it risks regressions against any not-yet-updated backend env. Documented, not removed.

## Implementation order
1. Receptionist queue polling + `TASK_LOCK_HELD` mapping (works with zero realtime).
2. Notification types + handler map + realtime refresh of the queue.
3. Patient `APPOINTMENT_DOCTOR_ASSIGNED` refresh (broad booking submit already done).
4. Verify (typecheck/lint/build).
