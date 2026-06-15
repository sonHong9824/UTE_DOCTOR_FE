# Notification bell isolation investigation

## Summary

The frontend could render stale or mixed notification data when switching between Patient and Doctor accounts in the same browser without a hard refresh. The scoped notification REST endpoints are documented to derive ownership from the JWT, but the bell and notification center kept local state that was not keyed by the authenticated identity. Late responses from the previous account could still update React state after logout/login.

## Files involved

- `src/components/notification/notification-bell.tsx`
- `src/features/notification/hooks/useNotificationCenter.ts`
- `src/features/notification/screens/NotificationCenterScreen.tsx`
- `src/apis/notification/notification.api.ts`
- `src/features/notification/services/notification.service.ts`
- `src/services/socket/socket.service.ts`
- `src/features/auth/utils/auth-storage.ts`
- `src/features/auth/utils/auth-identity.ts`
- `api-contract/api.md`
- `api-contract/README_NOTIFICATION_OWNERSHIP_SCOPE_FE_INTEGRATION.md`

## Contract findings

The refreshed API contract says:

- `GET /notifications/by-email?page&limit` requires JWT and returns notifications for the authenticated user.
- `GET /notifications/count` requires JWT and is scoped to the authenticated user.
- `PATCH /notifications/:id/read` requires JWT and should be ownership checked by the backend.
- `/notification` socket connections authenticate with `handshake.auth.token`; the backend auto-joins the authenticated email room.
- The frontend must not use the legacy broad `GET /notifications` endpoint. Current FE notification code does not call it.

## Root causes

1. `NotificationBell` kept `notifications`, `unreadCount`, `page`, `hasMore`, and `selectedNotif` as long-lived local state without binding those values to a stable auth identity.
2. `user-logged-in` triggered a refetch but did not clear old notifications first, so Patient data could remain visible while Doctor data was loading.
3. In-flight `getUnreadNotificationCount()` / `getNotificationsByEmail()` calls had no abort or identity guard. A previous account response could resolve after logout or after a new login and update the mounted bell.
4. The notification socket is a namespace singleton. Auth events reconnect it with the latest token, but the bell cleanup only removed listeners. The mounted component was not keyed by identity, so realtime refreshes could race with account switches.
5. The notification center page reused the same APIs and had the same stale async response risk.

## Fix implemented

- Added `getCurrentAuthIdentity()` as the notification UI identity source using current `accessToken`, `email`, `id`, and `role` from storage.
- `NotificationBell` now:
  - clears state immediately on logout and login;
  - refetches only after a fresh auth identity exists;
  - aborts initial refresh on unmount/identity change;
  - ignores stale list/count responses if the auth identity changed;
  - ignores stale mark-read responses after account switch;
  - filters realtime payloads by `recipientEmail` when present;
  - disconnects the notification socket during cleanup/identity change.
- `NotificationCenterScreen` / `useNotificationCenter` now:
  - clear state on auth boundary events;
  - pass abort signals on initial refresh;
  - ignore stale list/count/mark-read responses after identity changes.
- Notification API helpers accept `AbortSignal` without changing endpoint shapes.

## Backend status

This repository only includes the frontend and API contract references. Backend ownership enforcement cannot be changed here. The frontend now calls only the scoped endpoints documented in `api-contract/api.md`. The backend still must enforce:

- JWT-required list/count endpoints scoped to the current user;
- ownership checks for `PATCH /notifications/:id/read`;
- no unguarded broad notification list endpoint for normal clients.

## Verification scenarios

- Patient A -> logout -> Doctor B: old Patient list/count are cleared synchronously and stale Patient responses are ignored.
- Doctor B -> logout -> Patient A: old Doctor list/count are cleared synchronously and stale Doctor responses are ignored.
- Previous in-flight request after account switch: ignored by identity/version guard, and initial effect requests are aborted when possible.
- Old socket event after account switch/logout: listener is removed, socket is disconnected on cleanup, and payloads with a different `recipientEmail` are ignored.
- Mark-as-read after account switch: response is ignored if identity changed; backend must reject cross-owner IDs.
