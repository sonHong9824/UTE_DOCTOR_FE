# Notification Bell — Frontend Analysis & Fix

Companion to the backend doc (`ute-doctor-be/docs/notification-backend-analysis.md`) and the
api-contract note `README_NOTIFICATION_OWNERSHIP_SCOPE_FE_INTEGRATION.md` (pulled into
`api-contract/` at submodule `4310286`).

Reported bug: with two distinct accounts in the same browser (e.g. Patient A then Doctor B), the
shared notification bell can show the previous user's notifications / realtime events and an
inflated unread count.

---

## 1. Current notification bell flow

The bell is a single shared component, [notification-bell.tsx](../src/components/notification/notification-bell.tsx),
mounted in:

- [navbar.tsx](../src/components/navbar.tsx#L101) — patient / public layout (rendered only when `email` is set).
- [doctor/Topbar.tsx](../src/components/doctor/Topbar.tsx#L91) — doctor layout.

On mount it:

1. `refreshBell()` → `GET /notifications/count` + `GET /notifications/by-email?page=1` (REST).
2. Creates the `/notification` socket via `createNotificationSocket()`, `connect()` + `JOIN_ROOM`,
   and on every `NOTIFICATION_RECEIVED` runs a type handler (some show a `toast`) then `refreshBell()`.

There is a second consumer, the notification center
[NotificationCenterScreen](../src/features/notification/screens/NotificationCenterScreen.tsx) via
[useNotificationCenter](../src/features/notification/hooks/useNotificationCenter.ts), REST-only, no socket.

## 2. Endpoints the bell calls

| Purpose | Endpoint | Where |
|---|---|---|
| List | `GET /notifications/by-email?page&limit` | [notification.api.ts:118](../src/apis/notification/notification.api.ts#L118) |
| Unread count | `GET /notifications/count` | [notification.api.ts:141](../src/apis/notification/notification.api.ts#L141) |
| Mark read | `PATCH /notifications/:id/read` | [notification.api.ts:153](../src/apis/notification/notification.api.ts#L153) |

**The bell never calls bare `GET /notifications`.** Grep of `src/**` for `/notifications` returns only
the three scoped calls above (plus an `/admin/notifications` route link). ✔ Matches the contract.

## 3. Token source — REST

`axiosClient` request interceptor reads the token **fresh per request** from `localStorage` via
`getAccessToken()` ([axiosClient.ts:35-41](../src/lib/axiosClient.ts#L35-L41),
[authTokenStore.ts:4-10](../src/lib/authTokenStore.ts#L4-L10)). After login overwrites
`localStorage.accessToken`, every subsequent notification request carries the **current** user's JWT.

➜ **REST cannot leak another user's notifications.** `/by-email` and `/count` are always scoped to the
logged-in user. This is consistent with the backend conclusion.

## 4. Token source — socket (root cause)

The `/notification` socket is a **module-level singleton** kept in `socketRegistry`
([socket.service.ts:326-342](../src/services/socket/socket.service.ts#L326-L342)). Its handshake
`auth.token` is captured at **connect time** and only changes when the socket reconnects. The socket
reacts to exactly two window events:

- `token-refreshed` → `updateAuthToken()` (disconnect + reconnect with the new token).
- `auth-logout` → `disconnect()`.

Neither event is fired on the normal login/logout path:

- **Logout** ([navbar.tsx:35-55](../src/components/navbar.tsx#L35-L55) and the doctor / receptionist /
  admin sidebars) only does `localStorage.removeItem(...)` + `router.push('/')`. It **never emits
  `auth-logout`**, so the singleton notification socket stays **connected and joined to the previous
  user's email room**.
- **Login** ([useLogin.ts:36-49](../src/features/auth/hooks/useLogin.ts#L36-L49)) writes the session via
  `setAuthSession` and dispatches a `user-logged-in` event — which **no socket listens to**. It does
  **not** emit `token-refreshed`, so the socket never re-authenticates as the new user.

### Resulting leak

1. Patient A logs in → bell mounts → notification socket connects + joins **A's** email room.
2. A logs out → tokens cleared from `localStorage`, but the socket is **still connected as A**.
3. Doctor B logs in → bell re-mounts → `createNotificationSocket()` returns the **same singleton,
   still connected as A**. `connect()` early-returns (already connected); `JOIN_ROOM` re-derives the
   room from the **stale handshake JWT (A's)**, so the socket **remains in A's room**.
4. ➜ B's bell receives **A's** realtime `NOTIFICATION_RECEIVED` events (including `toast` side effects),
   and B does **not** receive their own realtime notifications. Each stale event also calls
   `refreshBell()`, which can flash an inflated count before the REST list (correctly B-scoped)
   re-renders.

So the wrong-user notifications/count come from the **socket lifecycle not following the auth
lifecycle**, not from REST and not from the backend (matches the api-contract note §1/§3 step 1–3).

## 5. Cache / query keys

No React Query / SWR / Zustand. The bell holds notifications + `unreadCount` in **local
`useState`**; `useNotificationCenter` likewise. There is no user-identity key. State is reset only by
**unmount**. The bell does unmount on logout in the patient navbar (`email` → `null`) and when a role
layout unmounts, but the **singleton socket survives unmount** (it lives in the module registry), which
is the durable cross-user channel.

## 6. Cleared on logout/login?

- Logout: ❌ does not emit `auth-logout`, does not disconnect the notification socket, does not reset
  bell state explicitly (relies on unmount).
- Login: ❌ does not emit `token-refreshed`, does not reconnect the socket as the new user.

## 7. Socket reconnect on account switch?

❌ Not today — see §4. The singleton stays authenticated as the previous user.

## 8. Bare `GET /notifications` in the bell path?

❌ Never. ✔ (§2.)

## 9. Mark-as-read 403/404 handling

`markNotificationAsRead` catches errors and returns `undefined`
([notification.api.ts:151-162](../src/apis/notification/notification.api.ts#L151-L162)); the bell and
hook only decrement / flip `isRead` when `res?.code === SUCCESS`
([notification-bell.tsx:108-115](../src/components/notification/notification-bell.tsx#L108-L115)). So
the upcoming ownership-checked `PATCH` (api-contract §4) returning 403/404 already **leaves the item
unread and does not decrement the badge, and does not crash**. ✔ No change required.

## 10. Root cause hypothesis

**Frontend socket lifecycle bug (stale socket authenticated as the previous user).** Logout does not
disconnect the shared `/notification` socket and login does not re-authenticate it, so a later account
in the same browser inherits the previous account's realtime room. REST is correctly scoped; the
backend scoped endpoints are not the cause.

## 11. Fix plan (focused — no contract change)

1. **Disconnect every socket on logout.** Centralize logout in a new
   `clearAuthSession()` (auth-storage) that clears the auth keys **and** dispatches `auth-logout`
   (+ `user-logged-out`). Route navbar + doctor/receptionist/admin sidebars through it. This makes the
   notification socket's existing `auth-logout` → `disconnect()` actually fire.
2. **Re-authenticate the socket on login.** After `setAuthSession`, dispatch `token-refreshed` so the
   socket's `updateAuthToken()` reconnects with the new user's JWT (joins the new email room). Keep the
   existing `user-logged-in` event.
3. **Reset the bell on the auth boundary.** The bell subscribes to `auth-logout` (clear list, count,
   selection) and to `user-logged-in` (re-`refreshBell()`), so even if it stays mounted it never shows
   the previous user's data.
4. Mark-as-read 403/404: already safe (§9) — no change.

## 12. Manual verification checklist

- [ ] Patient A login → generate notification → bell shows it, count = 1.
- [ ] Logout → Network: `/notification` socket disconnects; bell list + count cleared.
- [ ] Doctor B login → bell shows **only** B's notifications; A's absent; count excludes A's.
- [ ] Decode `Authorization` JWT on `/by-email` + `/count` as B → email/role = B.
- [ ] Inspect `/notification` socket handshake `auth.token` as B → B's token (B in B's room).
- [ ] Reverse (Doctor B first, then Patient A) → A never sees B's notifications.
- [ ] Both A and B online in separate sessions → a private notification for A arrives only on A's bell.
- [ ] As B, marking a non-owned id read returns 403/404 → item stays unread, no decrement, no crash.
- [ ] Refresh page after login and switch account without hard refresh → list + count stay correct,
      no stale flash.
- [ ] `npm run lint` / `npm run build` pass.

## 13. Backend follow-up

None required from FE evidence: raw `/by-email` + `/count` are correctly scoped to the current JWT.
Only file a backend follow-up if a raw scoped REST response is ever observed returning another user's
notifications while the request carries the current user's token.
