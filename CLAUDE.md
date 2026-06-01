# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Companion docs (read these too)

- [AGENTS.md](AGENTS.md) — authoritative project conventions, layer rules, auth/time/wallet rules, and the Feature Module Architecture Standard. **Read before touching API, datetime, auth, or wallet code.**
- [README_SOCKET_INTEGRATION_FE.md](README_SOCKET_INTEGRATION_FE.md) — socket lifecycle, namespace join semantics, token-refresh re-auth.
- [api-contract/api.md](api-contract/api.md) — git submodule, **single source of truth** for backend contracts. Run `git submodule update --remote` before working on API or Socket.IO flows.

## Commands

- `npm run dev` — start dev server (Next.js + Turbopack) on `http://localhost:3000`
- `npm run build` — production build (Turbopack)
- `npm run start` — run production build
- `npm run lint` — ESLint (`next/core-web-vitals`, `next/typescript`)

No test runner is configured. Do not invent a `test` script.

## Environment

- `NEXT_PUBLIC_BASE_API` — API base URL. Default fallback in [src/lib/axiosClient.ts](src/lib/axiosClient.ts#L10) is `http://localhost:3001/api`.

## Tech stack snapshot

Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui (Radix), axios, socket.io-client, react-hook-form + zod, dayjs/date-fns, sonner (toasts), framer-motion, recharts/chart.js.

Path alias: `@/*` → `src/*`.

## Architecture: the two coexisting patterns

The codebase is mid-migration between two organizations. **New work goes in `src/features/`** following the Feature Module Architecture Standard (see [AGENTS.md](AGENTS.md) §Feature Module Architecture Standard). Older code still lives in the flat layout.

### New (target) — [src/features/](src/features/)
Each feature is self-contained with `components/` (presentational), `hooks/` (orchestration / view-model), `services/` (API only), `screens/` (containers wiring hook + UI), `types/`, `utils/`. Data flow is strictly `screen → hook → service → API`. **No API calls in components.**

Existing feature modules: `appointment`, `auth`, `medical-record`, `notification`, `payment-result`, `receptionist-billing`, `receptionist-visits`, `user-profile`, `wallet`.

### Legacy (still valid for non-feature work)
- [src/apis/](src/apis/) — domain-grouped API modules (`*.api.ts`). Still the home for cross-feature API code not yet migrated.
- [src/app/](src/app/) — App Router routes. Role-segmented: `(auth)/`, `admin/`, `doctor/`, `receptionist/`, plus public-facing Vietnamese-named routes (`chuyen-gia/`, `chuyen-khoa/`, `tin-tuc/`, `gioi-thieu/`).
- [src/components/](src/components/) — shared UI; shadcn primitives under `src/components/ui/`.
- [src/contexts/](src/contexts/) — only socket/chat context lives here today.
- [src/services/socket/](src/services/socket/), [src/lib/](src/lib/), [src/types/](src/types/), [src/enum/](src/enum/), [src/utils/](src/utils/) — shared infra.

## Cross-cutting infrastructure (high-leverage files)

These are not feature-local — changes here ripple everywhere:

- [src/lib/axiosClient.ts](src/lib/axiosClient.ts) — single axios instance with request interceptor (attaches `Authorization` from token store) and response interceptor (handles 401 via shared refresh, queues concurrent failed requests, redirects to `/login` on refresh failure). **Never attach tokens manually elsewhere.**
- [src/lib/authTokenStore.ts](src/lib/authTokenStore.ts) — sole reader/writer for access + refresh tokens. Emits `token-refreshed` and `auth-logout` events.
- [src/lib/authRefresh.ts](src/lib/authRefresh.ts) — single guarded refresh promise (prevents refresh storms) shared by axios and socket service.
- [src/services/socket/socket.service.ts](src/services/socket/socket.service.ts) — one socket per namespace, handshake auth, 25s heartbeat, unauthorized → guarded refresh → reconnect. Use the service factory; do **not** instantiate raw `io()` in components.
- [src/utils/time.util.ts](src/utils/time.util.ts) — single source of truth for request datetime handling. Client uses local time; convert to UTC on send. Never send timezone-less datetime strings.
- [src/utils/money.util.ts](src/utils/money.util.ts) — VND formatting, coin formatting, coin-discount math. **Credit = real money (VND); coin = reward, discount-only.** Booking payloads send `useCoin`/`coinsToUse` as a discount request; `paymentMethod=COIN` is deprecated.

## Socket namespace rules (non-obvious)

JOIN_ROOM is **not** a global handshake. Per [README_SOCKET_INTEGRATION_FE.md](README_SOCKET_INTEGRATION_FE.md):

- Email-room namespaces (`/appointment`, `/appointment/fields-data`, `/payment/vnpay`, `/patient-profile`, `/notification`): `connect → emit JOIN_ROOM → wait ROOM_JOINED` before dependent HTTP trigger in pending→push flows.
- `/chat` namespace: use `CHAT_JOIN_USER` and `CHAT_JOIN_CONVERSATION` — **not** JOIN_ROOM.

If a pending→push flow stalls on loading, suspect missing ROOM_JOINED.

## Conventions (delta from AGENTS.md worth surfacing)

- File naming: components `PascalCase.tsx` or `kebab-case.tsx`; APIs `*.api.ts`; DTOs `*.dto.ts`; enums `*.enum.ts`.
- Client components require `'use client'` at top.
- Imports: double quotes; prefer `@/` alias.
- Strict TypeScript — no implicit any.
- User identity comes from JWT — **do not** send `patientId`/`accountId` in payloads unless the contract explicitly demands it.
