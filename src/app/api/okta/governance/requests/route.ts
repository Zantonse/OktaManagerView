import { auth } from "@/lib/auth";
import { getAccessRequestsWithPagination, getAccessRequestDetail, getUser, getApp } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

// Resolve Okta user IDs to display names
async function resolveUserNames(userIds: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const names: Record<string, string> = {};

  await Promise.allSettled(
    unique.map(async (id) => {
      try {
        const user = await getUser(id);
        const first = user.profile.firstName || "";
        const last = user.profile.lastName || "";
        names[id] = `${first} ${last}`.trim() || user.profile.email || id;
      } catch {
        names[id] = id;
      }
    })
  );

  return names;
}

// Resolve Okta resource IDs (app IDs) to display labels
async function resolveResourceNames(resourceIds: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(resourceIds.filter(Boolean))];
  const names: Record<string, string> = {};

  await Promise.allSettled(
    unique.map(async (id) => {
      try {
        const app = await getApp(id);
        names[id] = app.label || app.name || id;
      } catch {
        names[id] = id;
      }
    })
  );

  return names;
}

// Debug: probe Governance admin API for approver-related endpoints
async function probeApproverInfo(
  requests: import("@/types/okta").OktaAccessRequest[],
  userId: string,
  bearerToken: string
): Promise<{ filtered: import("@/types/okta").OktaAccessRequest[]; debug: Record<string, unknown>[] }> {
  const ssws = process.env.OKTA_API_TOKEN!;
  const domain = process.env.NEXT_PUBLIC_OKTA_DOMAIN!;
  const adminHost = domain.replace('.oktapreview.com', '-admin.oktapreview.com');
  const debug: Record<string, unknown>[] = [];

  // Probe governance admin API endpoints with SSWS
  const endpoints: Record<string, string> = {
    // entries endpoint (mentioned in CLAUDE.md as requiring filter)
    'v2_entries_approverId': `${adminHost}/governance/api/v2/requests/entries?filter=approverId eq "${userId}"`,
    'v2_entries_assignee': `${adminHost}/governance/api/v2/requests/entries?filter=assigneeId eq "${userId}"`,
    'v2_entries_status': `${adminHost}/governance/api/v2/requests/entries?filter=status eq "PENDING"`,
    // approval-related endpoints
    'v2_approvals': `${adminHost}/governance/api/v2/approvals`,
    'v2_approval_tasks': `${adminHost}/governance/api/v2/approval-tasks`,
    'v1_approvals': `${adminHost}/governance/api/v1/approvals`,
    'v1_tasks': `${adminHost}/governance/api/v1/tasks`,
    'v2_tasks': `${adminHost}/governance/api/v2/tasks`,
    // try filtering v2 requests by approver
    'v2_requests_approver_filter': `${domain}/governance/api/v2/requests?filter=approverId eq "${userId}"`,
  };

  const probes: Record<string, unknown> = {};
  for (const [name, url] of Object.entries(endpoints)) {
    try {
      const resp = await fetch(url, {
        headers: { 'Authorization': `SSWS ${ssws}`, 'Accept': 'application/json' },
      });
      const ct = resp.headers.get('content-type') || '';
      const isJson = ct.includes('json');
      const text = await resp.text();
      probes[name] = { status: resp.status, isJson, body: text.slice(0, 500) };
    } catch (e) {
      probes[name] = { error: (e as Error).message.slice(0, 200) };
    }
  }
  debug.push({ probes, userId });

  return { filtered: [], debug };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const bearerToken = session.accessToken;
  if (!bearerToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const after = searchParams.get("after") || undefined;
  const limit = searchParams.get("limit") || "50";

  try {
    // Fetch v2 access requests via SSWS (org-wide visibility)
    const { data: allRequests, nextCursor } = await getAccessRequestsWithPagination({ status, after, limit });

    // Debug mode: probe approver info and return diagnostics
    const isDebug = searchParams.get("debug") === "true";
    const { filtered: requests, debug } = await probeApproverInfo(allRequests, userId, bearerToken);

    // Collect all unique user IDs and resource IDs
    const userIds: string[] = [];
    const resourceIds: string[] = [];
    for (const req of requests) {
      if (req.requestedBy?.externalId) userIds.push(req.requestedBy.externalId);
      if (req.requestedFor?.externalId) userIds.push(req.requestedFor.externalId);
      if (req.requested?.resourceId) resourceIds.push(req.requested.resourceId);
    }

    // Resolve names in parallel
    const [nameMap, resourceMap] = await Promise.all([
      userIds.length > 0 ? resolveUserNames(userIds) : ({} as Record<string, string>),
      resourceIds.length > 0 ? resolveResourceNames(resourceIds) : ({} as Record<string, string>),
    ]);

    // Enrich requests with resolved names
    const enriched = requests.map((req) => ({
      ...req,
      requesterName: req.requestedBy?.externalId ? nameMap[req.requestedBy.externalId] : undefined,
      requestedForName: req.requestedFor?.externalId ? nameMap[req.requestedFor.externalId] : undefined,
      resourceName: req.requested?.resourceId ? resourceMap[req.requested.resourceId] : undefined,
    }));

    return NextResponse.json({ data: enriched, nextCursor, ...(isDebug && { debug, totalFetched: allRequests.length, userId }) });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch access requests" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
