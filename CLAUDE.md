# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run test         # Run Vitest unit/component tests
npm run test:e2e     # Run Playwright E2E tests (requires dev server)
npm run test:coverage # Vitest with coverage report
npx vitest run src/__tests__/components/team/team-table.test.tsx  # Run single test file
```

## Architecture

Next.js 15 App Router + TypeScript. Manager self-service portal for Okta identity governance.

**Auth flow**: Manager signs in via Okta OIDC (NextAuth v5) → session contains manager's Okta user ID → server-side API routes use `OKTA_API_TOKEN` to call Okta Management APIs. The API token never reaches the browser.

**Direct reports**: Identified by querying Okta users where `profile.managerId` equals the logged-in manager's **email** (not Okta UID). The `profile.manager` field holds the display name.

### Route Structure

- `src/app/(auth)/` — Login page (unauthenticated)
- `src/app/(dashboard)/` — All authenticated pages share a layout with sidebar + top nav
- `src/app/api/okta/` — Server-side proxy routes to Okta Management APIs
- `src/middleware.ts` — Redirects unauthenticated users to `/login`

### Key Files

- `src/lib/okta/client.ts` — ALL Okta Management API calls go through this client
- `src/lib/auth.ts` — NextAuth v5 config with Okta provider
- `src/types/okta.ts` — TypeScript types for Okta API responses

### API Proxy Pattern

Components never call Okta APIs directly. All calls go:
`UI Component → /api/okta/* route handler → src/lib/okta/client.ts → Okta Management API`

### Testing

Vitest + React Testing Library for unit/component tests. Playwright for E2E. MSW (Mock Service Worker) mocks Okta API responses at the network level. Mock data lives in `tests/mocks/okta-data.ts`, handlers in `tests/mocks/handlers.ts`.

## Okta API Reference

- Users: `GET /api/v1/users?search=profile.managerId eq "{email}"` (direct reports)
- App Links: `GET /api/v1/users/{id}/appLinks`
- App Roles: `GET /api/v1/apps/{appId}/users/{userId}` (entitlements per app)
- Groups: `GET /api/v1/users/{id}/groups`
- User Profile: `PUT /api/v1/users/{id}` (PTO flag via custom attributes)
- Campaigns: `GET|POST /api/v1/campaigns`
- Certifications: `GET /governance/api/v2/campaigns/{id}/reviewers/tasks`
- Access Requests: `GET|PUT /governance/api/v2/requests`
- Delegates (Beta): `GET|POST|DELETE /governance/api/v2/delegates`

## Gotchas

- Governance Delegates API is Beta (2025.08.0) — wrap in try/catch with fallback UI
- Okta rate limit ~600 req/min — use SWR caching with `revalidateOnFocus: false`
- Access Requests V2 `GET .../entries` requires a `filter` query parameter
- When customizing shadcn/ui components, target semantic selectors (`[data-baseweb="select"]`) not DOM structure selectors
