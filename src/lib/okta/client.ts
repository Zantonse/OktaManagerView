import { OktaApiError as OktaApiErrorType } from '@/types/okta';
import { OktaApiError } from './errors';

const OKTA_DOMAIN = process.env.NEXT_PUBLIC_OKTA_DOMAIN;
const OKTA_API_TOKEN = process.env.OKTA_API_TOKEN;

interface FetchOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, OKTA_DOMAIN!);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function oktaFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, params, headers = {} } = options;

  if (!OKTA_DOMAIN) throw new Error('OKTA_DOMAIN is not configured');
  if (!OKTA_API_TOKEN) throw new Error('OKTA_API_TOKEN is not configured');

  const url = buildUrl(path, params);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `SSWS ${OKTA_API_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  let response: Response;
  let retries = 0;
  const maxRetries = 3;

  while (true) {
    response = await fetch(url, fetchOptions);

    // Handle rate limiting (429)
    if (response.status === 429 && retries < maxRetries) {
      const retryAfter = response.headers.get('x-rate-limit-reset');
      const waitMs = retryAfter
        ? Math.max(0, (parseInt(retryAfter, 10) * 1000) - Date.now()) + 1000
        : Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, Math.min(waitMs, 30000)));
      retries++;
      continue;
    }

    break;
  }

  if (!response.ok) {
    let errorBody: OktaApiErrorType | undefined;
    try {
      errorBody = await response.json();
    } catch {
      // Response may not be JSON
    }
    throw new OktaApiError(
      errorBody?.errorSummary || `Okta API error: ${response.status}`,
      response.status,
      errorBody?.errorCode,
      errorBody?.errorCauses?.map(c => c.errorSummary)
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Parse Link header for pagination
function parseLinkHeader(linkHeader: string | null): { after?: string } {
  if (!linkHeader) return {};
  const match = linkHeader.match(/<[^>]*[?&]after=([^&>]*)[^>]*>;\s*rel="next"/);
  return match ? { after: match[1] } : {};
}

// ─── User APIs ────────────────────────────────────────

export async function getDirectReports(managerEmail: string, params?: { search?: string; status?: string; after?: string; limit?: string }) {
  const searchFilter = `profile.managerId eq "${managerEmail}"`;
  const fullSearch = params?.search
    ? `${searchFilter} and (profile.firstName sw "${params.search}" or profile.lastName sw "${params.search}" or profile.email sw "${params.search}")`
    : searchFilter;

  return oktaFetch<import('@/types/okta').OktaUser[]>('/api/v1/users', {
    params: {
      search: fullSearch,
      ...(params?.limit && { limit: params.limit }),
      ...(params?.after && { after: params.after }),
    },
  });
}

export async function getUser(userId: string) {
  return oktaFetch<import('@/types/okta').OktaUser>(`/api/v1/users/${userId}`);
}

export async function getUserAppLinks(userId: string) {
  return oktaFetch<import('@/types/okta').OktaAppLink[]>(`/api/v1/users/${userId}/appLinks`);
}

export async function getAppUserEntitlements(appId: string, userId: string) {
  return oktaFetch<import('@/types/okta').OktaAppUser>(`/api/v1/apps/${appId}/users/${userId}`);
}

export async function getUserGroups(userId: string) {
  return oktaFetch<import('@/types/okta').OktaGroup[]>(`/api/v1/users/${userId}/groups`);
}

export async function updateUserProfile(userId: string, profile: Partial<import('@/types/okta').OktaUserProfile>) {
  return oktaFetch<import('@/types/okta').OktaUser>(`/api/v1/users/${userId}`, {
    method: 'POST',
    body: { profile },
  });
}

// ─── User Lifecycle ───────────────────────────────────

export async function suspendUser(userId: string) {
  return oktaFetch<void>(`/api/v1/users/${userId}/lifecycle/suspend`, {
    method: 'POST',
  });
}

export async function unsuspendUser(userId: string) {
  return oktaFetch<void>(`/api/v1/users/${userId}/lifecycle/unsuspend`, {
    method: 'POST',
  });
}

// ─── Governance - Campaigns ───────────────────────────

export async function getCampaigns(params?: { status?: string; after?: string; limit?: string }) {
  return oktaFetch<import('@/types/okta').OktaCampaign[]>('/api/v1/campaigns', { params: params as Record<string, string> });
}

export async function createCampaign(campaign: { name: string; description?: string; scheduledStartDate?: string; deadline?: string; resourceSets?: unknown[] }) {
  return oktaFetch<import('@/types/okta').OktaCampaign>('/api/v1/campaigns', {
    method: 'POST',
    body: campaign,
  });
}

// ─── Governance - Certifications ──────────────────────

export async function getCertificationTasks(campaignId: string) {
  return oktaFetch<import('@/types/okta').OktaCertificationTask[]>(
    `/governance/api/v2/campaigns/${campaignId}/reviewers/tasks`
  );
}

export async function submitCertificationDecision(
  campaignId: string,
  taskId: string,
  decision: { decision: 'APPROVE' | 'REVOKE'; justification?: string }
) {
  return oktaFetch<import('@/types/okta').OktaCertificationTask>(
    `/governance/api/v2/campaigns/${campaignId}/reviewers/tasks/${taskId}`,
    {
      method: 'PATCH',
      body: decision,
    }
  );
}

// ─── Governance - Access Requests ─────────────────────

export async function getAccessRequests(params?: { status?: string; after?: string; limit?: string }) {
  return oktaFetch<import('@/types/okta').OktaAccessRequest[]>('/governance/api/v2/requests', {
    params: params as Record<string, string>,
  });
}

export async function updateAccessRequest(requestId: string, decision: { status: 'APPROVED' | 'DENIED'; comment?: string }) {
  return oktaFetch<import('@/types/okta').OktaAccessRequest>(`/governance/api/v2/requests/${requestId}`, {
    method: 'PUT',
    body: decision,
  });
}

// ─── Governance - Delegates (Beta) ────────────────────

export async function getDelegates() {
  try {
    return await oktaFetch<import('@/types/okta').OktaDelegate[]>('/governance/api/v2/delegates');
  } catch (error) {
    // Beta API — may not be available
    console.warn('Delegates API not available:', error);
    return [];
  }
}

export async function createDelegate(delegate: { delegateId: string; scope: string[]; startDate: string; endDate: string }) {
  return oktaFetch<import('@/types/okta').OktaDelegate>('/governance/api/v2/delegates', {
    method: 'POST',
    body: delegate,
  });
}

export async function deleteDelegate(delegateId: string) {
  return oktaFetch<void>(`/governance/api/v2/delegates/${delegateId}`, {
    method: 'DELETE',
  });
}

// ─── Org API ──────────────────────────────────────────

export async function getOrg() {
  return oktaFetch<import('@/types/okta').OktaOrg>('/api/v1/org');
}
