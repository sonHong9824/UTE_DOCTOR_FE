# AGENTS.md

## Project Structure
- `.next/` - Next.js build output (generated)
- `node_modules/` - dependencies (generated)
- `public/` - static assets
- `src/` - application source
- `components.json` - shadcn/ui config
- `eslint.config.mjs` - ESLint config
- `next.config.ts` - Next.js config
- `tailwind.config.ts` - Tailwind config
- `tsconfig.json` - TypeScript config

### `src/` layout
- `src/app/` - Next.js App Router routes, layouts, and pages
- `src/apis/` - API client modules (grouped by domain)
- `src/components/` - reusable UI and feature components
- `src/contexts/` - React contexts (e.g., socket/chat)
- `src/enum/` - shared enums
- `src/lib/` - shared utilities (axios client, token helpers, `cn`)
- `src/services/` - service clients (e.g., socket)
- `src/types/` - DTOs and shared types

### Notable route groups (App Router)
- `src/app/(auth)/` - login/register
- `src/app/admin/` - admin dashboard and subpages
- `src/app/doctor/` - doctor dashboard and subpages
- `src/app/chuyen-gia/`, `src/app/chuyen-khoa/`, `src/app/tin-tuc/`, `src/app/gioi-thieu/` - public-facing pages

## How To Run
1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Build and start production:
   - `npm run build`
   - `npm run start`

Environment:
- `NEXT_PUBLIC_BASE_API` controls the API base URL (default in `src/lib/axiosClient.ts` is `http://localhost:3001/api`).

## How To Test
- No unit/e2e test runner is configured.
- Linting is available via:
  - `npm run lint`

## Architecture Overview
- **Framework:** Next.js 15 App Router (`src/app`) with React 19.
- **Styling:** Tailwind CSS with custom theme tokens and utility classes (`tailwind.config.ts`, `src/app/globals.css`).
- **UI Components:** shadcn/ui-style components live under `src/components/ui` with shared `cn` helper (`src/lib/utils.ts`).
- **API Layer:** Domain-specific API modules in `src/apis/**` use a centralized Axios client (`src/lib/axiosClient.ts`) with auth token handling and refresh flow.
- **State/Context:** Socket-based chat is wired through `src/services/socket` and `src/contexts/ChatSocketContext.tsx`.
- **Types:** DTOs and enums are centralized under `src/types` and `src/enum`.

## Coding Conventions (Inferred)
- **TypeScript strict mode** enabled (`tsconfig.json`).
- **Path aliases:** `@/*` maps to `src/*`.
- **File naming:**
  - React components typically `PascalCase.tsx` or `kebab-case.tsx`.
  - API modules use `*.api.ts`.
  - DTOs use `*.dto.ts` and enums use `*.enum.ts`.
- **Client components:** use `'use client'` at the top for client-only modules.
- **Imports:** double quotes are standard; alias imports (`@/`) are common.
- **Styling:** Tailwind utility classes; custom semantic classes (e.g., `.doctor-*`) defined in Tailwind config.
- **Linting:** ESLint extends `next/core-web-vitals` and `next/typescript`.

---

## Agent Operating Guidelines

You are an AI coding agent working in a structured frontend codebase.

Your primary goal is to:
- Implement features correctly based on API contracts
- Maintain consistency with project architecture
- Avoid breaking existing functionality

---

## API Contract Integration (CRITICAL)

- API contracts are located in: `api-contract/api.md` (git submodule)
- This is the **single source of truth** for backend communication

### Rules:
- ALWAYS read `api-contract/api.md` before implementing API-related features
- DO NOT invent endpoints, request fields, or response shapes
- If something is missing:
  - Infer carefully
  - Add `TODO` comments
- Prioritize correctness over assumptions

---

## Authentication System Rules

The backend uses JWT-based authentication.

### Key principles:
- User identity is derived from JWT
- DO NOT send user identifiers manually (e.g., `patientId`, `accountId`) unless explicitly required

### Implementation requirements:

#### 1. Token Storage
- Store JWT token in:
  - `localStorage` OR
  - cookies (depending on existing implementation)

#### 2. Attach Token
- ALL protected API requests MUST include:


Authorization: Bearer <token>


#### 3. Centralized Handling
- Use `src/lib/axiosClient.ts`
- DO NOT attach tokens manually in each API file
- Use interceptors

---

## API Layer Conventions

- All API calls must be placed in: `src/apis/**`
- Group APIs by domain

### Example:

src/apis/auth/auth.api.ts
src/apis/user/user.api.ts


### Rules:
- DO NOT call APIs directly inside components
- ALWAYS go through API modules
- Use typed DTOs from `src/types`

---

## State Management Rules

- Use React Context (`src/contexts`) for global concerns:
  - Auth state
  - Socket connections

- Avoid prop drilling for auth/user data

---

## Error Handling

- Handle API errors gracefully:
  - Show user-friendly messages
  - Avoid console-only error handling

- Always handle:
  - 401 Unauthorized (token missing/expired)
  - 403 Forbidden
  - Network errors

---

## Auth Flow Implementation Checklist

When implementing authentication:

### Register:
- Validate input
- Call register API
- Handle success/error

### Login:
- Call login API
- Extract token
- Store token
- Redirect user

### After Login:
- Attach token automatically
- Verify protected API works

---

## Submodule Workflow (IMPORTANT)

The API contract is a git submodule.

### When working with latest API:
- Run:


git submodule update --remote


### Notes:
- The main repo does NOT auto-update submodule
- Always ensure contract is up-to-date before coding

---

## When Backend Changes

If API behavior changes:

1. Re-read `api-contract/api.md`
2. Update affected API modules
3. Update DTOs if needed
4. Verify UI still works

---

## Code Quality Rules

- Follow existing folder structure strictly
- Reuse existing utilities before creating new ones
- Avoid duplication
- Keep functions small and focused

---

## When Unsure

- Prefer reading existing code over guessing
- Prefer API contract over assumptions
- Prefer consistency over creativity

---

## Output Requirements (when implementing features)

Always provide:

- Files created/modified
- API endpoints used
- Assumptions made
- Any missing or unclear API contract parts