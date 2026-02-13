# Okta Manager Self-Service Dashboard

A production-grade web application that empowers people managers to handle identity governance tasks for their direct reports through Okta — without needing admin access. Built with Next.js 16, TypeScript, and 6 Okta API families spanning 20+ endpoints. 100% AI-assisted development using Claude Code.

---

## The Problem

Customers want to delegate more management of direct reports to managers. Today, managers have zero visibility into their team's identity posture and must rely on IT admins for every governance action:

- **"Who's on my team?"** — Managers should be able to see all their direct reports and what they have access to, without filing a ticket to IT.
- **"Remove access fast"** — When someone leaves a project or changes roles, their manager should be able to remove access immediately, not wait for an admin.
- **"Delegate for PTO"** — When a manager goes on PTO, someone else needs to handle reviews and approvals. Managers should set that up themselves.

This portal solves all three by giving managers a single, focused dashboard for day-to-day governance — authenticated with their own Okta credentials, powered entirely by Okta's APIs.

---

## Hackathon Judging Criteria

### GenARR Potential (50%)

| Question | Answer |
|----------|--------|
| **Does this hack increase demo impact?** | Turns abstract OIG APIs into a tangible product story. SEs can show a real manager portal instead of describing what's possible with APIs. |
| **Does this hack help answer "Why Okta"?** | Built entirely on Okta's APIs — 6 API families, dual-auth (SSWS + Bearer), OIDC login. No competitor has APIs comprehensive enough to build this. Proves Okta is a platform, not just a product. |
| **How widely applicable is this hack?** | Every OIG customer has managers with direct reports. Manager self-service applies universally across industries, company sizes, and compliance frameworks (SOX, HIPAA, SOC2). |

### Challenging (35%)

| Question | Answer |
|----------|--------|
| **Does this hack provide value in a new way?** | No manager-facing governance portal exists today. This creates an entirely new persona experience — managers go from zero visibility to full self-service. |
| **How innovative was the use of AI?** | Claude Code served as architect + engineer — designing the dual-auth pattern, debugging Governance API quirks (unreliable SCIM filters, inconsistent response envelopes), and iterating on UI design. |
| **How technically impressive is this hack?** | 20+ API endpoints across 6 families. Dual-auth (SSWS + Bearer) with silent token refresh. Server-side SCIM safety filters. Pagination handling across two different pagination models (Link headers vs body cursors). |

### Demo Quality (15%)

| Question | Answer |
|----------|--------|
| **Is this a good value-based demonstration?** | Solves a real, repeatedly-requested customer problem. Every feature maps directly to a pain point managers articulate in discovery calls. |
| **Does the demonstration make you go "Wow"?** | Live Okta org with real data. Production-grade UI with dark mode, 5 color themes, mobile responsive, skeleton loading. Not a mockup — every click hits the Okta API. |

---

## Features

### Dashboard Home
- Overview cards showing Direct Reports count and Pending Reviews (clickable)
- Quick Actions: Start Review, Set Governance Delegates
- Activity Feed with recent governance events (approvals, denials, campaign creation)
- Link to Okta End User Dashboard

### Team Management
- Full team member table with search (debounced), status filtering, and column sorting
- Status sort by lifecycle order: Active > Provisioned > Suspended > Deprovisioned
- Multi-select checkboxes with floating action bar for bulk operations
- Mobile card layout with responsive breakpoint switching
- Per-member actions: Set PTO, End PTO, Suspend, Unsuspend (with confirmation dialogs)

### Member Detail
- Tabbed profile view: Overview, Apps & Entitlements, Groups, Delegates
- Searchable app grid with role badges and pagination
- Group membership listing
- Current delegate appointments with dates and scopes
- Inline lifecycle actions and campaign creation from Apps tab

### Access Comparison
- Side-by-side comparison of two team members (via bulk select)
- App and role diff highlighting
- Group membership comparison

### Access Reviews
- Create ad-hoc access review campaigns for team members
- Campaign name, description, and multi-select user picker
- Pre-selects all direct reports by default
- Proper Okta Governance Campaign API integration with structured payload

### Certifications
- Campaign selector dropdown with tab-based filtering (All, Pending, In Progress, Completed, Expired)
- Desktop table view and mobile card layout
- Individual certification detail with Attest/Revoke actions
- Justification required for revocations
- Overdue highlighting

### Governance Delegates
- Add/assign delegates with user search, scope selection, and date range
- View and manage existing delegate assignments
- Bulk delegate status fetched per team member on team page

### UI/UX
- **Dark mode** with Light/Dark/System toggle (respects OS preference)
- **5 color themes**: Okta (indigo), Midnight (blue), Ember (red), Forest (green), Sunset (orange) — cycle by clicking the logo
- **Mobile responsive** with adaptive layouts (table to cards, sidebar to drawer)
- **Skeleton loading** throughout all data-fetching states
- **Toast notifications** via Sonner for success/error feedback
- **Avatars** with deterministic color assignment from name hash
- **Empty states** with clear messaging and retry actions

---

## Architecture

```
Browser                          Server                           Okta
┌──────────────┐   SWR fetch    ┌────────────────────┐   SSWS    ┌──────────────┐
│  React UI    │ ─────────────> │  Next.js API Routes │ ───────> │  Management  │
│  (Client)    │ <───────────── │  /api/okta/*        │ <─────── │  & Governance│
│              │   JSON         │                     │   JSON   │  APIs        │
└──────────────┘                └────────────────────┘          └──────────────┘
       │                               │
       │ NextAuth session              │ OKTA_API_TOKEN (SSWS)
       └───────── Okta OIDC ──────────┘   + Bearer (user OAuth)
```

### Dual-Auth Pattern

The app uses two authorization strategies to balance org-wide visibility with user-scoped access:

1. **SSWS admin token** (`oktaFetch`) — Management API calls (`/api/v1/*`): user CRUD, apps, groups, lifecycle. Also used for Governance API calls requiring org-wide data (campaigns, reviews).
2. **User Bearer token** (`oktaGovernanceFetch`) — Governance API calls (`/governance/api/*`) where user-scoped access is intended: delegates, principal settings. Bearer tokens carry OAuth scopes granted to the OIDC app.

**Auth flow**: Manager signs in via Okta OIDC → NextAuth stores OAuth access/refresh tokens in JWT → `offline_access` scope enables silent refresh (60s before expiry) → `session.accessToken` exposed to route handlers.

### API Proxy Pattern

Components never call Okta APIs directly. All calls route through:

```
UI Component → /api/okta/* route handler → src/lib/okta/client.ts → Okta API
```

This keeps API tokens server-side and provides a consistent error handling layer.

---

## Okta APIs Used

| API Family | Endpoints | Purpose |
|------------|-----------|---------|
| **Users** | `GET /api/v1/users` | List direct reports by `profile.managerId` with status filtering |
| **User Profile** | `GET/PUT /api/v1/users/{id}` | Get user details, update PTO flags, lifecycle actions |
| **App Links** | `GET /api/v1/users/{id}/appLinks` | List assigned applications per user |
| **App Entitlements** | `GET /api/v1/apps/{appId}/users/{userId}` | Get roles/entitlements within an app |
| **Groups** | `GET /api/v1/users/{id}/groups` | List group memberships |
| **Campaigns** | `GET/POST /governance/api/v1/campaigns` | List and create access review campaigns |
| **Reviews** | `GET /governance/api/v1/reviews` | Fetch certification reviews (SCIM filters) |
| **Certifications** | `GET/PATCH /governance/api/v2/campaigns/{id}/reviewers/tasks` | Review and act on certification tasks |
| **Access Requests** | `GET/PUT /governance/api/v2/requests` | Process access requests |
| **Delegates (v2)** | `GET/POST/DELETE /governance/api/v2/delegates` | Manage governance delegates |
| **Delegates (v1)** | `GET /governance/api/v1/delegates` | List delegate appointments with SCIM filter |
| **Principal Settings** | `PATCH /governance/api/v1/principal-settings/{id}` | Appoint delegates for users |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Auth | [NextAuth v5](https://authjs.dev/) with Okta OIDC + silent token refresh |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix Primitives](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Data Fetching | [SWR](https://swr.vercel.app/) with cache invalidation |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Notifications | [Sonner](https://sonner.emilkowal.dev/) |
| Unit Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| E2E Testing | [Playwright](https://playwright.dev/) |
| API Mocking | [MSW](https://mswjs.io/) (Mock Service Worker) |
| AI Development | [Claude Code](https://claude.ai/code) |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later
- An **Okta org** with:
  - An [OIDC Web Application](https://developer.okta.com/docs/guides/implement-grant-type/authcode/main/) configured for the portal
  - An [API token](https://developer.okta.com/docs/guides/create-an-api-token/main/) with permissions to read users, groups, apps, and governance resources
  - The `profile.managerId` attribute populated on user profiles (set to the manager's email)
  - [Okta Identity Governance](https://www.okta.com/products/identity-governance/) enabled for delegates, certifications, and access requests

### 1. Clone and install

```bash
git clone https://github.com/Zantonse/OktaManagerView.git
cd OktaManagerView
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_OKTA_DOMAIN=https://your-org.okta.com
OKTA_CLIENT_ID=0oa...your-client-id
OKTA_CLIENT_SECRET=your-client-secret
OKTA_API_TOKEN=00...your-api-token
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string
```

### 3. Configure your Okta OIDC application

In your Okta admin console, ensure your OIDC app has:

- **Sign-in redirect URI**: `http://localhost:3000/api/auth/callback/okta`
- **Sign-out redirect URI**: `http://localhost:3000`
- **Grant types**: Authorization Code, Refresh Token
- **Required scopes** (grant under Applications > API Scopes):
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

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to Okta for sign-in, then returned to the dashboard.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server on `localhost:3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit/component tests with Vitest |
| `npm run test:e2e` | Run Playwright end-to-end tests (requires dev server running) |
| `npm run test:coverage` | Run Vitest with coverage report |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/           # Login page (Okta-styled)
│   ├── (dashboard)/            # All authenticated pages
│   │   ├── page.tsx            # Dashboard home
│   │   ├── team/               # Team list & member detail
│   │   ├── compare/            # Side-by-side access comparison
│   │   ├── reviews/            # Access reviews & create campaign
│   │   ├── certifications/     # Certification tasks & detail
│   │   ├── requests/           # Access request queue & detail
│   │   └── settings/           # Governance delegate management
│   └── api/okta/               # Server-side API proxy routes
├── components/
│   ├── dashboard/              # Dashboard shell, sidebar, nav, activity feed
│   ├── team/                   # Team table, member detail, PTO/lifecycle dialogs
│   ├── certifications/         # Certification list, cards, detail, entitlement actions
│   ├── requests/               # Request queue, detail, approve/deny dialog
│   ├── reviews/                # Review list, create form
│   ├── settings/               # Delegate manager & list
│   └── ui/                     # shadcn/ui base components
├── lib/
│   ├── auth.ts                 # NextAuth v5 config with Okta OIDC + silent refresh
│   ├── okta/client.ts          # Central Okta API client (SSWS + Bearer)
│   ├── validations/okta.ts     # Zod schemas for mutations
│   └── hooks/                  # Custom hooks (color theme, etc.)
├── types/okta.ts               # TypeScript types for Okta APIs
└── middleware.ts                # Route protection (redirect unauthenticated → /login)
```

---

## License

This project is private and not licensed for redistribution.
