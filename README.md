# Okta Manager Self-Service Access Portal

A web application that empowers people managers to handle identity governance tasks for their direct reports through Okta. Built with Next.js 16, TypeScript, and the Okta Management & Governance APIs.

---

## The Problem

People managers in enterprise organizations frequently need to perform identity governance tasks for their teams — reviewing access, approving requests, managing delegations during PTO, and responding to certification campaigns. Today, these tasks require either administrator involvement or navigating multiple disconnected Okta admin interfaces, leading to delays, bottlenecks, and security gaps when approvals are slow.

## What This Portal Does

This portal gives managers a single, focused dashboard to handle day-to-day governance tasks for their direct reports without needing Okta admin access. Managers authenticate with their own Okta credentials, and the application uses a server-side API token to securely perform operations on their behalf.

### Key Capabilities

- **Team Overview** — View all direct reports with status, last login, and active delegate assignments at a glance
- **Access Reviews** — Create and manage ad-hoc access review campaigns for team members
- **Certification Response** — Review and attest pending certification tasks (approve/revoke with justification)
- **Access Request Queue** — Process pending access requests from team members (approve/deny with comments)
- **PTO & Delegate Management** — Mark team members as on PTO and assign governance delegates using the Okta Delegates API
- **Delegate Visibility** — See existing delegate appointments per user, with contextual "Update Delegate" actions when delegations already exist
- **Member Detail** — Drill into any team member to see their full profile, app assignments, group memberships, and delegate appointments

### Benefits

- **No admin access required** — Managers self-serve through a purpose-built interface
- **Secure by design** — Okta API tokens stay server-side and never reach the browser
- **Reduced governance lag** — Approvals, reviews, and delegations happen faster without IT bottlenecks
- **Full audit trail** — All actions flow through Okta's standard APIs, preserving governance audit logs
- **Responsive** — Works on desktop and mobile with adaptive table/card layouts

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
       │ NextAuth session              │ OKTA_API_TOKEN
       └───────── Okta OIDC ──────────┘
```

- **Auth**: Manager signs in via Okta OIDC (NextAuth v5). The session carries the manager's Okta user ID and email.
- **API Proxy**: UI components never call Okta APIs directly. All requests go through Next.js API route handlers that attach the server-side API token.
- **Direct Reports**: Identified by querying Okta users where `profile.managerId` equals the logged-in manager's email.
- **Delegates API**: Uses `GET /governance/api/v1/delegates` (Beta) with `delegatorId` filter. Wrapped in try/catch with fallback UI for orgs where the API isn't available.

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later
- An **Okta org** with:
  - An [OIDC Web Application](https://developer.okta.com/docs/guides/implement-grant-type/authcode/main/) configured for the portal
  - An [API token](https://developer.okta.com/docs/guides/create-an-api-token/main/) with permissions to read users, groups, apps, and governance resources
  - The `profile.managerId` attribute populated on user profiles (set to the manager's email)
  - *(Optional)* Custom profile attributes `onPTO`, `ptoStartDate`, `ptoEndDate` for PTO features
  - *(Optional)* [Okta Identity Governance](https://www.okta.com/products/identity-governance/) enabled for delegates, certifications, and access requests

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Zantonse/OktaManagerView.git
cd OktaManagerView
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Okta OIDC (for manager authentication)
NEXT_PUBLIC_OKTA_DOMAIN=https://your-org.okta.com
OKTA_CLIENT_ID=0oa...your-client-id
OKTA_CLIENT_SECRET=your-client-secret

# Okta API Token (server-side only — never exposed to browser)
OKTA_API_TOKEN=00...your-api-token

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_OKTA_DOMAIN` | Your Okta org URL (e.g., `https://dev-123456.okta.com`). Also used as the OIDC issuer. |
| `OKTA_CLIENT_ID` | Client ID from your Okta OIDC application |
| `OKTA_CLIENT_SECRET` | Client secret from your Okta OIDC application |
| `OKTA_API_TOKEN` | Server-side API token for Okta Management API calls |
| `NEXTAUTH_URL` | The canonical URL of your deployment |
| `NEXTAUTH_SECRET` | A random string used to encrypt session tokens. Generate with `openssl rand -base64 32` |

### 4. Configure your Okta OIDC application

In your Okta admin console, ensure your OIDC app has:

- **Sign-in redirect URI**: `http://localhost:3000/api/auth/callback/okta`
- **Sign-out redirect URI**: `http://localhost:3000`
- **Grant types**: Authorization Code
- **Assignments**: Assign the managers who should have portal access

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to Okta for sign-in, then returned to the dashboard.

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
│   ├── (auth)/login/           # Login page (unauthenticated)
│   ├── (dashboard)/            # All authenticated pages
│   │   ├── page.tsx            # Dashboard home
│   │   ├── team/               # Team list & member detail
│   │   ├── reviews/            # Access reviews & create
│   │   ├── certifications/     # Certification tasks
│   │   ├── requests/           # Access request queue
│   │   └── settings/           # Delegate management
│   └── api/okta/               # Server-side API proxy routes
├── components/
│   ├── dashboard/              # Dashboard shell, sidebar, nav
│   ├── team/                   # Team table, member detail, PTO dialog
│   ├── certifications/         # Certification cards & detail
│   ├── requests/               # Request queue & approve/deny
│   ├── reviews/                # Review list & create form
│   ├── settings/               # Delegate manager & list
│   └── ui/                     # shadcn/ui base components
├── lib/
│   ├── auth.ts                 # NextAuth v5 configuration
│   ├── okta/client.ts          # Central Okta API client
│   ├── okta/errors.ts          # Okta error handling
│   └── utils/                  # Date formatting, helpers
├── types/okta.ts               # TypeScript types for Okta APIs
└── middleware.ts                # Route protection
tests/
├── mocks/handlers.ts           # MSW request handlers
├── mocks/okta-data.ts          # Mock fixture data
└── mocks/server.ts             # MSW server setup
```

---

## Okta APIs Used

| API | Endpoint | Purpose |
|-----|----------|---------|
| Users | `GET /api/v1/users` | List direct reports by `managerId` |
| User | `GET /api/v1/users/{id}` | Get user profile details |
| App Links | `GET /api/v1/users/{id}/appLinks` | List assigned applications |
| App Entitlements | `GET /api/v1/apps/{appId}/users/{userId}` | Get roles within an app |
| Groups | `GET /api/v1/users/{id}/groups` | List group memberships |
| User Profile | `POST /api/v1/users/{id}` | Update PTO flags |
| Campaigns | `GET/POST /api/v1/campaigns` | List and create access reviews |
| Certifications | `GET/PATCH /governance/api/v2/campaigns/{id}/reviewers/tasks` | Review certification tasks |
| Access Requests | `GET/PUT /governance/api/v2/requests` | Process access requests |
| Delegates (v2) | `GET/POST/DELETE /governance/api/v2/delegates` | Manage governance delegates |
| Delegates (v1) | `GET /governance/api/v1/delegates` | List delegate appointments with filter |
| Principal Settings | `PATCH /governance/api/v1/principal-settings/{id}` | Appoint delegates for users |

> **Note**: The Governance Delegates APIs are in **Beta** (2025.08.0) and may not be available in all Okta orgs. The portal gracefully handles this with fallback UI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Auth | [NextAuth v5](https://authjs.dev/) with Okta OIDC |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix Primitives](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Data Fetching | [SWR](https://swr.vercel.app/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Unit Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| E2E Testing | [Playwright](https://playwright.dev/) |
| API Mocking | [MSW](https://mswjs.io/) (Mock Service Worker) |

---

## Deployment

Build and start the production server:

```bash
npm run build
npm run start
```

The app can be deployed to any Node.js hosting platform. Update `NEXTAUTH_URL` in your environment to match your production domain, and add the production callback URL (`https://your-domain.com/api/auth/callback/okta`) to your Okta OIDC application.

---

## License

This project is private and not licensed for redistribution.
