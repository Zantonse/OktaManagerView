# Dashboard Improvements Design

Three features: dark mode with easter egg color themes, suspend/unsuspend users, and user access comparison.

## 1. Dark Mode Toggle + Easter Egg Themes

### Dark Mode

`next-themes` is installed but not configured. Wire it up:

**`src/app/layout.tsx`** — Wrap children in `<ThemeProvider attribute="class" defaultTheme="system">`. Add `suppressHydrationWarning` to `<html>`.

**`src/components/dashboard/top-nav.tsx`** — Add Sun/Moon toggle item in the profile dropdown menu, between user info and Sign Out. Uses `useTheme()` from `next-themes` to cycle light/dark/system.

**`src/components/dashboard/mobile-nav.tsx`** — Add matching toggle in the mobile nav sheet.

### Easter Egg Color Themes

Clicking the Shield icon in the sidebar cycles through 5 color palettes. Each palette is a CSS class on `<html>` that overrides CSS variables. Works in both light and dark mode.

| Name | Primary | Feel |
|------|---------|------|
| Okta (default) | `#1662dd` blue | Professional |
| Midnight | `#7c3aed` violet | Sleek |
| Ember | `#dc2626` red | Bold |
| Forest | `#059669` emerald | Calm |
| Sunset | `#ea580c` orange | Warm |

**Implementation:**
- `src/app/globals.css` — Add `.theme-midnight`, `.theme-ember`, `.theme-forest`, `.theme-sunset` classes. Each overrides `--primary`, `--sidebar-primary`, `--ring`, and accent colors for both `:root` and `.dark` contexts.
- `src/lib/hooks/use-color-theme.ts` — Custom hook managing theme state in `localStorage`. Exposes `colorTheme`, `cycleTheme()`, and `themeLabel`.
- `src/components/dashboard/sidebar.tsx` — Shield icon gets `onClick={cycleTheme}` with a rotation animation on click. Icon color reflects current theme's primary. A Sonner toast shows the theme name briefly.
- `src/components/dashboard/mobile-nav.tsx` — Same click behavior on mobile Shield icon.

**Files modified:** `globals.css`, `layout.tsx`, `top-nav.tsx`, `mobile-nav.tsx`, `sidebar.tsx`
**Files created:** `use-color-theme.ts`

## 2. Suspend / Unsuspend Users

API methods `suspendUser()` and `unsuspendUser()` exist in `src/lib/okta/client.ts`. Need UI and a new API route.

### API Route

**`src/app/api/okta/users/[userId]/lifecycle/route.ts`** — New PUT handler.
- Accepts `{ action: "suspend" | "unsuspend" }`
- Verifies target is a direct report (managerId check)
- Calls `suspendUser()` or `unsuspendUser()` from client
- Returns updated user object

### UI Touchpoints

**Team table dropdown** (`team-table.tsx`) — Add "Suspend User" or "Reactivate User" item in the `...` menu. Shown based on current status. Disabled for DEPROVISIONED users.

**Member detail page** (`member-detail.tsx`) — Button in the header card next to the status badge.

### Confirmation Dialog

**`src/components/team/lifecycle-dialog.tsx`** — New component.
- For both suspend and reactivate: simple confirm/cancel dialog
- Suspend dialog includes warning text: "This will immediately block access to all applications"
- Reactivate dialog: lighter "Are you sure?" message
- On confirm: calls PUT `/api/okta/users/{userId}/lifecycle`
- On success: SWR mutate to refresh user data, toast notification

**Files modified:** `team-table.tsx`, `member-detail.tsx`
**Files created:** `lifecycle/route.ts`, `lifecycle-dialog.tsx`

## 3. User Access Comparison

### Entry Point

Team table's existing floating action bar. When exactly 2 users are selected via checkboxes, a "Compare Access" button appears alongside the existing "Create Review" button.

**`src/components/team/team-content.tsx`** — Add "Compare Access" button that navigates to `/compare?users={userId1},{userId2}`.

### Comparison Page

**`src/app/(dashboard)/compare/page.tsx`** — Reads `users` from searchParams, splits into two user IDs, renders `AccessComparison`.

**`src/components/team/access-comparison.tsx`** — Main comparison component.

**Data fetching:** Four parallel SWR calls:
- `/api/okta/users/{id1}` and `/api/okta/users/{id2}` (profiles)
- `/api/okta/users/{id1}/apps` and `/api/okta/users/{id2}/apps` (apps + roles)
- `/api/okta/users/{id1}/groups` and `/api/okta/users/{id2}/groups` (groups)

**Layout:**

1. **Header** — Side-by-side user cards: avatar, name, title, status badge.

2. **Apps comparison table:**
   - Columns: App name, User A role, User B role
   - Same role = neutral gray row
   - Different roles = yellow highlight
   - One user missing access = amber/red highlight
   - Toggle filter: "Show all" / "Show differences only"

3. **Groups comparison:**
   - List of all groups across both users
   - Checkmark indicators showing membership
   - Differences highlighted same as apps

**Files created:** `compare/page.tsx`, `compare/loading.tsx`, `access-comparison.tsx`
**Files modified:** `team-content.tsx`

## Verification

- `npm run build` — no compile errors
- Navigate to dashboard, click Sun/Moon in profile dropdown — dark mode toggles
- Click Shield icon in sidebar — cycles through 5 color themes
- Refresh page — theme persists
- On member detail for ACTIVE user — "Suspend" button visible
- Confirm suspend dialog — user status changes to SUSPENDED
- Select 2 users in team table — "Compare Access" button appears
- Click compare — see side-by-side app and group diff
