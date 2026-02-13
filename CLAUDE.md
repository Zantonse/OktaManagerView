# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run Vitest unit/component tests
npm run test:e2e     # Run Playwright E2E tests (requires dev server)
npm run test:coverage # Vitest with coverage report
npx vitest run src/__tests__/components/team/team-table.test.tsx  # Run single test file
```

## Architecture

Next.js 16 App Router + TypeScript. Manager self-service portal for Okta identity governance. UI built with shadcn/ui + Tailwind CSS v4, forms via React Hook Form + Zod, data fetching via SWR.

**Direct reports**: Identified by querying Okta users where `profile.managerId` equals the logged-in manager's **email** (not Okta UID). The `profile.manager` field holds the display name.

### Route Structure

- `src/app/(auth)/` — Login page (unauthenticated)
- `src/app/(dashboard)/` — All authenticated pages share a layout with sidebar + top nav
- `src/app/api/okta/` — Server-side proxy routes to Okta APIs
- `src/middleware.ts` — Redirects unauthenticated users to `/login`

### Key Files

- `src/lib/okta/client.ts` — ALL Okta API calls (Management + Governance) go through this client
- `src/lib/auth.ts` — NextAuth v5 config with Okta provider, OAuth token storage, and silent refresh
- `src/types/okta.ts` — TypeScript types for Okta API responses
- `src/types/next-auth.d.ts` — Session/JWT type augmentation (`accessToken`, `refreshToken`, `expiresAt`)
- `src/lib/validations/okta.ts` — Zod schemas for all mutation request bodies

### Dual-Auth Pattern (SSWS vs Bearer)

The client uses two authorization strategies:

1. **SSWS admin token** (`oktaFetch`) — For Management API calls (`/api/v1/*`): user CRUD, apps, groups, lifecycle. Org-wide visibility. Also used for Governance API calls when org-wide data is needed (e.g., fetching all campaigns, resolving campaign details).
2. **User Bearer token** (`oktaGovernanceFetch`) — For Governance API calls (`/governance/api/*`) where user-scoped access is intended: delegates, principal settings. Bearer tokens carry OAuth scopes that may grant admin-level access (see Gotchas).

Functions using Bearer tokens are named `*AsUser()` (e.g., `getDelegatesAsUser(token)`). SSWS functions have no suffix (e.g., `getCampaigns()`, `getReviews()`). Route handlers extract `session.accessToken` and guard with a 401 if missing.

**Auth flow**: Manager signs in via Okta OIDC → NextAuth stores OAuth access/refresh tokens in JWT → `offline_access` scope enables silent refresh (60s before expiry) → `session.accessToken` is exposed to route handlers.

### Certifications & Reviews Pattern

The certifications route (`/api/okta/governance/certifications`) uses a specific pattern because Governance API SCIM filters are unreliable (see Gotchas):

1. **Fetch all campaigns via SSWS**, filter to `status === "ACTIVE"` in JS
2. **For each active campaign**, fetch reviews via SSWS with SCIM filter `campaignId eq "{id}" AND reviewerId eq "{userId}"`
3. **Always apply server-side safety filter** on `reviewerProfile.id === userId` and `decision === "UNREVIEWED"` — never trust SCIM filters alone
4. Return campaign summaries with pending counts, sorted by due date

### Access Requests Enrichment Pattern

The requests route (`/api/okta/governance/requests`) follows a 3-step pattern:

1. **Fetch user-scoped requests** via Bearer token (`getAccessRequestsWithPaginationAsUser`)
2. **Batch-resolve display names** via SSWS: `getUser(id)` for requester/requestee names, `getApp(id)` for resource labels — uses `Promise.allSettled` to handle partial failures
3. **Return enriched response** with `requesterName`, `requestedForName`, `resourceName` attached

### API Proxy Pattern

Components never call Okta APIs directly. All calls go:
`UI Component → /api/okta/* route handler → src/lib/okta/client.ts → Okta API`

### Testing

Vitest (jsdom) + React Testing Library for unit/component tests. Playwright for E2E. MSW v2 mocks Okta API responses at the network level. Test files live in `src/__tests__/`. Mock data in `tests/mocks/okta-data.ts`, handlers in `tests/mocks/handlers.ts`, server setup in `tests/mocks/server.ts`.

## Environment Variables

```
NEXT_PUBLIC_OKTA_DOMAIN   # Okta org URL (https://your-org.okta.com)
OKTA_CLIENT_ID            # OIDC app client ID
OKTA_CLIENT_SECRET        # OIDC app client secret
OKTA_API_TOKEN            # SSWS admin token (server-side only)
NEXTAUTH_SECRET           # NextAuth encryption secret
NEXTAUTH_URL              # App URL (http://localhost:3000)
```

### OIDC App Configuration

The OIDC app requires `refresh_token` grant type and the following OAuth scopes (must be granted in Okta admin console under Applications > API Scopes):

```
openid profile email offline_access
okta.governance.accessCertifications.manage
okta.governance.reviewer.read
okta.accessRequests.request.read
okta.accessRequests.request.manage
okta.governance.delegates.read
okta.governance.principalSettings.manage
okta.governance.principalSettings.read
```

**Scope behavior with the Org Authorization Server**: Okta's Org AS includes all scopes *granted to the app* in the token, regardless of what the client requests in the authorization URL. This means removing a scope from `auth.ts` doesn't remove it from the token — you must revoke it in the Okta admin console.

## Okta API Reference

- Users: `GET /api/v1/users?search=profile.managerId eq "{email}"` (direct reports)
- App Links: `GET /api/v1/users/{id}/appLinks`
- App Roles: `GET /api/v1/apps/{appId}/users/{userId}` (entitlements per app)
- Groups: `GET /api/v1/users/{id}/groups`
- User Profile: `PUT /api/v1/users/{id}` (PTO flag via custom attributes)
- Campaigns: `GET|POST /governance/api/v1/campaigns`
- Reviews: `GET /governance/api/v1/reviews` (supports SCIM filters: `campaignId`, `reviewerId`, `decision`)
- Access Requests: `GET|PUT /governance/api/v2/requests`
- Delegates (Beta): `GET|POST|DELETE /governance/api/v2/delegates`
- Delegate Appointments: `GET /governance/api/v1/delegates` (SCIM filter: `delegatorId eq "{id}"`)

## Gotchas

- **Governance API SCIM filters are unreliable with admin-level scopes** — When a Bearer token carries `accessCertifications.manage` or similar admin scopes, the Governance API operates in "admin mode" and may ignore SCIM filters (`reviewerId`, `decision`), returning all org data instead of user-scoped data. Always apply server-side filtering by `reviewerProfile.id` as a safety net.
- **Governance API uses body-based pagination, not Link headers** — Unlike the Management API (`/api/v1/*`) which paginates via HTTP `Link` headers, the Governance API (`/governance/api/v1/*`) returns pagination cursors in the response body under `_links.next.href`. Extract the `after` parameter from that URL. If `_links.next` is absent, there are no more pages.
- **Governance API response envelopes are inconsistent** — Some endpoints return `{ data: [...] }`, others return plain arrays. Client functions normalize this; route handlers always receive arrays.
- **Governance Delegates API is Beta (2025.08.0)** — all `*AsUser` delegate functions wrap in try/catch with fallback to empty arrays
- **Okta rate limit ~600 req/min** — client has built-in 429 retry with exponential backoff; use SWR caching with `revalidateOnFocus: false`
- **Access Requests V2 `GET .../entries` requires a `filter` query parameter**
- **Bearer token campaign list returns different IDs than review objects** — The campaigns list endpoint (`/governance/api/v1/campaigns`) via Bearer token may return campaigns with IDs that don't match `campaignId` on review objects. Use SSWS `getCampaignById()` for resolving individual campaigns from reviews, or use SSWS `getCampaigns()` for listing.
- **When customizing shadcn/ui components**, target semantic selectors (`[data-baseweb="select"]`) not DOM structure selectors
- **`profile.sub` from OIDC can be `null`** — use `?? undefined` not `!` when storing in JWT
