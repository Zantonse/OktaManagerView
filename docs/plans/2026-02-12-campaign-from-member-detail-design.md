# Start Campaign from Member Detail Page

## Goal

Allow managers to start an access certification campaign for a specific direct report directly from their detail page, with an informational banner explaining the access removal workflow.

## Changes

**Single file**: `src/components/team/member-detail.tsx`

### 1. Info Banner (Apps & Entitlements Tab)

- shadcn `Alert` component at the top of the Apps & Entitlements tab content
- Icon: `ShieldAlert` from lucide-react
- Title: "Access Removal"
- Description: "Access cannot be removed directly. To review and revoke this user's access, start an access certification campaign."
- `Button` (variant=outline, size=sm) labeled "Start Campaign" — opens the dialog

### 2. Inline Campaign Dialog

- `Dialog` component within member-detail.tsx (follows existing LifecycleDialog/EndPTODialog pattern)
- Title: "Start Access Certification"
- Description: "Create a manager-based certification campaign to review access for {display name}."
- Fields:
  - Campaign Name: text input, pre-filled with `"Access review - {firstName} {lastName}"`, editable
  - Description: optional textarea
- Footer: Cancel + Start Campaign buttons
- Submit: POST to `/api/okta/governance/campaigns` with `{ name, description, userIds: [userId] }`
- Success: close dialog, toast notification
- Error: inline error message in dialog
- Loading state on submit button

### 3. No New API Routes

Reuses existing `POST /api/okta/governance/campaigns` endpoint which already supports `userIds` array for scoping campaigns to specific users.

## Not Building

- No new API routes or client functions
- No separate component files
- No navigation away from the page
- No campaign status tracking from this page
