# FE Socket Integration Guide

Last updated: 2026-04-18
Scope: Frontend Socket.IO integration refactor in UTE_DOCTOR_FE.
Audience: FE developers and BE-FE integrators.

## 1. Why This Refactor Exists

The previous FE socket usage mixed lifecycle management directly inside components and contexts. This made reconnect behavior inconsistent, room join timing fragile, and token refresh handling partially duplicated.

The current refactor centralizes socket lifecycle and aligns it with HTTP authentication refresh behavior.

Goals:
- Use one token source of truth.
- Keep one socket instance per namespace.
- Re-authenticate sockets after token refresh.
- Follow namespace-specific join rules from BE contract.
- Preserve realtime reliability for pending->push flows.

## 2. Old FE Integration (Before Refactor)

### 2.1 Old FE Connection Flow

1. Components created or reused socket instances with mixed connect strategies.
2. Some screens emitted business events before stable room join lifecycle.
3. Token refresh handling depended on ad-hoc listeners and scattered localStorage usage.
4. JOIN_ROOM was treated too broadly in some places.

### 2.2 Old FE Pros

- Quick to wire for small features.
- Easy to patch one component at a time.
- Lower initial abstraction cost.

### 2.3 Old FE Cons

- Lifecycle logic duplicated across components.
- Easy to race: connect/join/listen order not guaranteed.
- Inconsistent behavior after token refresh.
- Harder to reason about reconnect and cleanup.
- Higher risk of stale token socket auth.

## 3. New FE Integration (Current)

### 3.1 New FE Connection Flow

1. Feature gets socket from centralized socket service by namespace.
2. Service reads access token from shared auth token store.
3. Service connects with handshake auth token.
4. For email-room namespaces, FE emits JOIN_ROOM and waits ROOM_JOINED when required by flow.
5. Feature attaches namespace event listeners.
6. For long-lived sockets, service emits periodic heartbeat every 25 seconds.
7. On token refresh, socket auth is updated and sockets reconnect with fresh token.

JOIN_ROOM is not treated as global handshake for all namespaces.

### 3.2 New FE Pros

- Centralized lifecycle and token handling.
- Consistent namespace socket factory behavior.
- Better parity with BE handshake-auth model.
- Reduced stale token risk for sockets.
- Clear room join semantics per namespace.
- Easier debugging with explicit phase logs in critical flows.

### 3.3 New FE Trade-offs

- More explicit lifecycle code in initial integration.
- Developers must follow per-namespace join rules carefully.
- If ROOM_JOINED is not received, dependent pending->push flows can stall.

## 4. Where FE Logic Is Handled

### 4.1 Socket Service Core

- File: src/services/socket/socket.service.ts
- Responsibility:
- Create one socket client instance per namespace.
- Connect/reconnect/update auth token.
- Emit heartbeat every 25 seconds while connected.
- Handle unauthorized connect_error by triggering guarded refresh flow.
- Expose helper methods: joinRoom, joinUser, joinConversation, leave helpers.

### 4.2 Compatibility Export

- File: src/services/socket/socket-client.ts
- Responsibility:
- Keep old import paths stable.
- Re-export socket service API.

### 4.3 Shared Auth Token Source

- File: src/lib/authTokenStore.ts
- Responsibility:
- Read/write/clear access and refresh token.
- Emit token-refreshed and auth-logout events.

### 4.4 Shared Refresh Orchestration

- File: src/lib/authRefresh.ts
- Responsibility:
- Single guarded refresh promise to prevent refresh storms.
- Persist new tokens and notify app lifecycle events.

### 4.5 HTTP Interceptor Alignment

- File: src/lib/axiosClient.ts
- Responsibility:
- Retry HTTP requests after refresh via shared refreshAccessToken.
- Reuse same token lifecycle events used by socket service.

## 5. Current Namespace Rules in FE

### 5.1 Email-room Namespaces (JOIN_ROOM)

- /appointment
- /appointment/fields-data
- /payment/vnpay
- /patient-profile
- /notification

Rule:
- connect -> emit JOIN_ROOM -> wait ROOM_JOINED when request flow depends on room push.

### 5.2 Chat Namespace

- Namespace: /chat
- Rule:
- Use CHAT_JOIN_USER and CHAT_JOIN_CONVERSATION.
- Do not use JOIN_ROOM as generic chat gate.

## 6. Online Status and Heartbeat

### 6.1 FE Behavior

- Heartbeat event name: heartbeat.
- Emission interval: every 25 seconds in socket service when connected.
- Stops on disconnect and restarts on reconnect.

### 6.2 BE Interaction

- BE presence layer refreshes Redis TTL on each heartbeat.
- Missing heartbeat can lead to online flapping and disconnect visibility issues.

Note:
- Presence source of truth is BE device set model; FE role is to keep heartbeat cadence stable while socket is alive.

## 7. Token Refresh and Re-authentication Lifecycle

### 7.1 Normal HTTP-driven Refresh

1. HTTP gets 401.
2. axiosClient calls refreshAccessToken.
3. New tokens are stored in authTokenStore.
4. token-refreshed event is emitted.
5. Socket service receives event and reconnects with updated auth token.

### 7.2 Socket-driven Unauthorized Connect Error

1. Socket connect_error indicates unauthorized/token issue.
2. Socket service triggers refreshAccessToken with guard.
3. If refresh succeeds: update auth token and reconnect.
4. If refresh fails: disconnect and emit auth-logout.

Loop protection:
- Service uses isHandlingConnectError guard per socket client.
- Refresh layer uses single shared refresh promise.

## 8. Patient Profile Pending -> Push Flow

Current FE flow in user profile hook:
1. Connect /patient-profile socket.
2. Emit JOIN_ROOM after connect.
3. Wait ROOM_JOINED.
4. Attach PATIENT_PROFILE listener.
5. Trigger GET /patients/me (pending trigger).
6. Receive assembled profile via PATIENT_PROFILE push.

If ROOM_JOINED is missing, UI may remain in loading state until fallback logic handles it.

## 9. Scope of Current FE Refactor (Uncommitted)

- src/services/socket/socket.service.ts (new)
- src/services/socket/socket-client.ts (compat re-export)
- src/lib/authTokenStore.ts (new)
- src/lib/authRefresh.ts (new)
- src/lib/axiosClient.ts (shared refresh integration)
- src/contexts/ChatSocketContext.tsx (context API + lifecycle updates)
- src/components/chat/ChatBubble.tsx (chat user join lifecycle)
- src/components/chat/ChatWindow.tsx (conversation join lifecycle)
- src/components/notification/notification-bell.tsx (notification room join lifecycle)
- src/features/user-profile/hooks/usePatientProfile.ts (room join + pending->push sequencing and diagnostics)
- src/enum/socket-events.enum.ts (contract-aligned socket event constants)

## 10. FE Integration Checklist

1. Always connect sockets only when access token exists.
2. Use socket service factory, do not instantiate raw io in components.
3. For email-room namespaces, emit JOIN_ROOM after connect.
4. For pending->push flows, wait ROOM_JOINED before dependent HTTP trigger.
5. Use chat-specific join events for /chat.
6. Keep listeners idempotent and clean up on unmount.
7. Keep heartbeat active for long-lived connections.
8. Ensure all token reads/writes use authTokenStore.
9. Ensure all refresh paths route through refreshAccessToken.

## 11. Troubleshooting Signals

### 11.1 Stuck Loading in Pending->Push Flows

Symptom:
- Hook waits for ROOM_JOINED forever.

Checks:
- Socket connected logs exist.
- JOIN_ROOM emitted after connect.
- ROOM_JOINED received with expected identity.
- No immediate io server disconnect after join.

### 11.2 Frequent Reconnect or Online Flapping

Checks:
- Heartbeat logs emitted every ~25 seconds.
- No duplicate connect listeners in components.
- Unauthorized connect_error not causing repeated refresh failures.

### 11.3 Stale Token Symptoms

Checks:
- token-refreshed event emitted after HTTP refresh.
- Socket reconnects after token update.
- Unauthorized connect_error path triggers guarded refresh and re-auth.

## 12. Summary

The FE socket integration is now aligned with BE socket refactor principles:
- Token lifecycle is centralized.
- Socket auth is refreshed on token change.
- Namespace-specific join semantics are explicit.
- Heartbeat is consistently handled for presence.

This improves reliability, debuggability, and consistency between HTTP and realtime flows.
