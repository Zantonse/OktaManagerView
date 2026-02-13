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

// Fetch with headers returned (for pagination cursor extraction)
async function oktaFetchWithHeaders<T>(path: string, options: FetchOptions = {}): Promise<{ data: T; headers: Headers }> {
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
    return { data: undefined as T, headers: response.headers };
  }

  const data = await response.json();
  return { data, headers: response.headers };
}

// Parse Link header for pagination
function parseLinkHeader(linkHeader: string | null): { after?: string } {
  if (!linkHeader) return {};
  const match = linkHeader.match(/<[^>]*[?&]after=([^&>]*)[^>]*>;\s*rel="next"/);
  return match ? { after: match[1] } : {};
}

// ─── Bearer-token fetch for Governance APIs ──────────

async function oktaGovernanceFetch<T>(path: string, bearerToken: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, params, headers = {} } = options;

  if (!OKTA_DOMAIN) throw new Error('OKTA_DOMAIN is not configured');

  const url = buildUrl(path, params);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function oktaGovernanceFetchWithHeaders<T>(path: string, bearerToken: string, options: FetchOptions = {}): Promise<{ data: T; headers: Headers }> {
  const { method = 'GET', body, params, headers = {} } = options;

  if (!OKTA_DOMAIN) throw new Error('OKTA_DOMAIN is not configured');

  const url = buildUrl(path, params);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
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

  if (response.status === 204) {
    return { data: undefined as T, headers: response.headers };
  }

  const data = await response.json();
  return { data, headers: response.headers };
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

export async function getDirectReportsWithPagination(managerEmail: string, params?: { search?: string; status?: string; after?: string; limit?: string }) {
  let searchFilter = `profile.managerId eq "${managerEmail}"`;
  if (params?.status) {
    searchFilter += ` and status eq "${params.status}"`;
  }
  const fullSearch = params?.search
    ? `${searchFilter} and (profile.firstName sw "${params.search}" or profile.lastName sw "${params.search}" or profile.email sw "${params.search}")`
    : searchFilter;

  const result = await oktaFetchWithHeaders<import('@/types/okta').OktaUser[]>('/api/v1/users', {
    params: {
      search: fullSearch,
      ...(params?.limit && { limit: params.limit }),
      ...(params?.after && { after: params.after }),
    },
  });

  const linkHeader = result.headers.get('link');
  const pagination = parseLinkHeader(linkHeader);

  return {
    data: result.data,
    nextCursor: pagination.after,
  };
}

export async function searchAllUsers(query: string, params?: { limit?: string }) {
  const search = `profile.firstName co "${query}" or profile.lastName co "${query}" or profile.email co "${query}"`;

  return oktaFetch<import('@/types/okta').OktaUser[]>('/api/v1/users', {
    params: {
      search,
      ...(params?.limit && { limit: params.limit }),
    },
  });
}

export async function getUser(userId: string) {
  return oktaFetch<import('@/types/okta').OktaUser>(`/api/v1/users/${userId}`);
}

export async function getUserAppLinks(userId: string) {
  return oktaFetch<import('@/types/okta').OktaAppLink[]>(`/api/v1/users/${userId}/appLinks`);
}

export async function getApp(appId: string) {
  return oktaFetch<{ id: string; name: string; label: string; status: string }>(`/api/v1/apps/${appId}`);
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
  // Governance API may return { data: [...] } envelope or plain array
  const response = await oktaFetch<{ data: import('@/types/okta').OktaCampaign[] } | import('@/types/okta').OktaCampaign[]>('/governance/api/v1/campaigns', { params: params as Record<string, string> });
  return Array.isArray(response) ? response : response.data;
}

export async function getCampaignsWithPagination(params?: { status?: string; after?: string; limit?: string }) {
  const result = await oktaFetchWithHeaders<{ data: import('@/types/okta').OktaCampaign[]; _links?: unknown } | import('@/types/okta').OktaCampaign[]>('/governance/api/v1/campaigns', { params: params as Record<string, string> });

  const linkHeader = result.headers.get('link');
  const pagination = parseLinkHeader(linkHeader);

  // Governance API may wrap results in { data: [...], _links: {...} }
  const campaigns = Array.isArray(result.data) ? result.data : (result.data as { data: import('@/types/okta').OktaCampaign[] }).data;

  return {
    data: campaigns,
    nextCursor: pagination.after,
  };
}

export async function createCampaign(campaign: Record<string, unknown>) {
  return oktaFetch<import('@/types/okta').OktaCampaign>('/governance/api/v1/campaigns', {
    method: 'POST',
    body: campaign,
  });
}

// Bearer-token variants for user-scoped governance calls
export async function getCampaignsWithPaginationAsUser(token: string, params?: { status?: string; after?: string; limit?: string }) {
  const result = await oktaGovernanceFetchWithHeaders<{ data: import('@/types/okta').OktaCampaign[]; _links?: unknown } | import('@/types/okta').OktaCampaign[]>('/governance/api/v1/campaigns', token, { params: params as Record<string, string> });

  const linkHeader = result.headers.get('link');
  const pagination = parseLinkHeader(linkHeader);
  const campaigns = Array.isArray(result.data) ? result.data : (result.data as { data: import('@/types/okta').OktaCampaign[] }).data;

  return {
    data: campaigns,
    nextCursor: pagination.after,
  };
}

export async function createCampaignAsUser(token: string, campaign: { name: string; description?: string; scheduledStartDate?: string; deadline?: string; resourceSets?: unknown[] }) {
  return oktaGovernanceFetch<import('@/types/okta').OktaCampaign>('/governance/api/v1/campaigns', token, {
    method: 'POST',
    body: campaign,
  });
}

// ─── Governance - Reviews ─────────────────────────────

export async function getReviews(params?: { filter?: string; after?: string; limit?: string; orderBy?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.filter) queryParams.filter = params.filter;
  if (params?.after) queryParams.after = params.after;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.orderBy) queryParams.orderBy = params.orderBy;

  const response = await oktaFetch<{ data: unknown[] } | unknown[]>(
    '/governance/api/v1/reviews',
    { params: queryParams }
  );
  return Array.isArray(response) ? response : (response as { data: unknown[] }).data ?? [];
}

export async function getReviewsWithPagination(params?: { filter?: string; after?: string; limit?: string; orderBy?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.filter) queryParams.filter = params.filter;
  if (params?.after) queryParams.after = params.after;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.orderBy) queryParams.orderBy = params.orderBy;

  const result = await oktaFetchWithHeaders<{ data: unknown[] } | unknown[]>(
    '/governance/api/v1/reviews',
    { params: queryParams }
  );

  // Governance API uses body-based pagination (_links.next.href) not Link header
  let nextCursor: string | undefined;
  let data: unknown[];

  if (Array.isArray(result.data)) {
    data = result.data;
  } else {
    const body = result.data as { data: unknown[]; _links?: { next?: { href?: string } } };
    data = body.data ?? [];
    // Extract `after` cursor from _links.next.href
    if (body._links?.next?.href) {
      const afterMatch = body._links.next.href.match(/[?&]after=([^&]+)/);
      if (afterMatch) nextCursor = decodeURIComponent(afterMatch[1]);
    }
  }

  // Fall back to Link header (Management API style)
  if (!nextCursor) {
    const linkHeader = result.headers.get('link');
    const pagination = parseLinkHeader(linkHeader);
    nextCursor = pagination.after;
  }

  return { data, nextCursor };
}

export async function getCampaignById(campaignId: string) {
  return oktaFetch<import('@/types/okta').OktaCampaign>(
    `/governance/api/v1/campaigns/${campaignId}`
  );
}

export async function getCampaignByIdAsUser(token: string, campaignId: string) {
  return oktaGovernanceFetch<import('@/types/okta').OktaCampaign>(
    `/governance/api/v1/campaigns/${campaignId}`,
    token
  );
}

export async function getGroup(groupId: string) {
  return oktaFetch<{ id: string; profile: { name: string; description?: string } }>(
    `/api/v1/groups/${groupId}`
  );
}

export async function submitReviewDecision(
  reviewId: string,
  decision: { decision: 'APPROVE' | 'REVOKE'; note?: string }
) {
  return oktaFetch<unknown>(
    `/governance/api/v1/reviews/${reviewId}`,
    {
      method: 'PATCH',
      body: decision,
    }
  );
}

export async function getReviewsAsUser(token: string, params?: { filter?: string; after?: string; limit?: string; orderBy?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.filter) queryParams.filter = params.filter;
  if (params?.after) queryParams.after = params.after;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.orderBy) queryParams.orderBy = params.orderBy;

  const response = await oktaGovernanceFetch<{ data: unknown[] } | unknown[]>(
    '/governance/api/v1/reviews',
    token,
    { params: queryParams }
  );
  return Array.isArray(response) ? response : (response as { data: unknown[] }).data ?? [];
}

// ─── Governance - Access Requests ─────────────────────

export async function getAccessRequests(params?: { status?: string; after?: string; limit?: string }) {
  // Governance v2 uses SCIM filter syntax for status filtering
  const queryParams: Record<string, string> = {};
  if (params?.status) queryParams.filter = `status eq "${params.status}"`;
  if (params?.after) queryParams.after = params.after;
  if (params?.limit) queryParams.limit = params.limit;

  const response = await oktaFetch<{ data: import('@/types/okta').OktaAccessRequest[] } | import('@/types/okta').OktaAccessRequest[]>('/governance/api/v2/requests', {
    params: queryParams,
  });
  return Array.isArray(response) ? response : response.data;
}

export async function getAccessRequestsWithPagination(params?: { status?: string; after?: string; limit?: string }) {
  // Governance v2 uses SCIM filter syntax for status filtering
  const queryParams: Record<string, string> = {};
  if (params?.status) queryParams.filter = `status eq "${params.status}"`;
  if (params?.after) queryParams.after = params.after;
  if (params?.limit) queryParams.limit = params.limit;

  const result = await oktaFetchWithHeaders<{ data: import('@/types/okta').OktaAccessRequest[]; _links?: { next?: { href?: string } } } | import('@/types/okta').OktaAccessRequest[]>('/governance/api/v2/requests', {
    params: queryParams,
  });

  // Governance API uses body-based pagination (_links.next.href)
  let nextCursor: string | undefined;
  let requests: import('@/types/okta').OktaAccessRequest[];

  if (Array.isArray(result.data)) {
    requests = result.data;
  } else {
    requests = result.data.data;
    if (result.data._links?.next?.href) {
      const afterMatch = result.data._links.next.href.match(/[?&]after=([^&]+)/);
      if (afterMatch) nextCursor = decodeURIComponent(afterMatch[1]);
    }
  }

  if (!nextCursor) {
    const linkHeader = result.headers.get('link');
    nextCursor = parseLinkHeader(linkHeader).after;
  }

  return { data: requests, nextCursor };
}

// Fetch request detail via v2 admin endpoint
export async function getAccessRequestDetail(requestId: string) {
  return oktaFetch<Record<string, unknown>>(`/governance/api/v2/requests/${requestId}`);
}

// Fetch v1 pending requests (includes permalinkId for cross-referencing with v2)
export async function getV1PendingRequests() {
  return oktaFetch<Record<string, unknown>[]>(
    '/governance/api/v1/requests',
    { params: { filter: 'requeststatus eq "PENDING"' } }
  );
}

// Fetch v1 request detail (includes approvals[].approverId)
export async function getV1RequestDetail(v1RequestId: string) {
  return oktaFetch<Record<string, unknown>>(
    `/governance/api/v1/requests/${v1RequestId}`
  );
}

export async function updateAccessRequest(requestId: string, decision: { status: 'APPROVED' | 'DENIED'; comment?: string }) {
  return oktaFetch<import('@/types/okta').OktaAccessRequest>(`/governance/api/v2/requests/${requestId}`, {
    method: 'PUT',
    body: decision,
  });
}

export async function getAccessRequestsWithPaginationAsUser(token: string, params?: { status?: string; after?: string; limit?: string }) {
  const queryParams: Record<string, string> = {};
  if (params?.status) queryParams.filter = `status eq "${params.status}"`;
  if (params?.after) queryParams.after = params.after;
  if (params?.limit) queryParams.limit = params.limit;

  const result = await oktaGovernanceFetchWithHeaders<{ data: import('@/types/okta').OktaAccessRequest[]; _links?: { next?: { href?: string } } } | import('@/types/okta').OktaAccessRequest[]>('/governance/api/v2/requests', token, {
    params: queryParams,
  });

  // Governance API uses body-based pagination (_links.next.href)
  let nextCursor: string | undefined;
  let requests: import('@/types/okta').OktaAccessRequest[];

  if (Array.isArray(result.data)) {
    requests = result.data;
  } else {
    requests = result.data.data;
    if (result.data._links?.next?.href) {
      const afterMatch = result.data._links.next.href.match(/[?&]after=([^&]+)/);
      if (afterMatch) nextCursor = decodeURIComponent(afterMatch[1]);
    }
  }

  if (!nextCursor) {
    const linkHeader = result.headers.get('link');
    nextCursor = parseLinkHeader(linkHeader).after;
  }

  return { data: requests, nextCursor };
}

export async function updateAccessRequestAsUser(token: string, requestId: string, decision: { status: 'APPROVED' | 'DENIED'; comment?: string }) {
  return oktaGovernanceFetch<import('@/types/okta').OktaAccessRequest>(`/governance/api/v2/requests/${requestId}`, token, {
    method: 'PUT',
    body: decision,
  });
}

// ─── Governance - Principal Settings (Delegate Appointments) ─

export async function appointDelegate(userId: string, appointment: {
  delegateId: string;
  note: string;
  startTime: string;
  endTime: string;
}) {
  return oktaFetch<import('@/types/okta').OktaDelegateAppointment>(
    `/governance/api/v1/principal-settings/${userId}`,
    {
      method: 'PATCH',
      body: {
        delegates: {
          appointments: [{
            delegate: { externalId: appointment.delegateId, type: 'OKTA_USER' },
            note: appointment.note,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
          }],
        },
      },
    }
  );
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

export async function getDelegatesAsUser(token: string) {
  try {
    return await oktaGovernanceFetch<import('@/types/okta').OktaDelegate[]>('/governance/api/v2/delegates', token);
  } catch (error) {
    console.warn('Delegates API not available:', error);
    return [];
  }
}

export async function createDelegateAsUser(token: string, delegate: { delegateId: string; scope: string[]; startDate: string; endDate: string }) {
  return oktaGovernanceFetch<import('@/types/okta').OktaDelegate>('/governance/api/v2/delegates', token, {
    method: 'POST',
    body: delegate,
  });
}

export async function deleteDelegateAsUser(token: string, delegateId: string) {
  return oktaGovernanceFetch<void>(`/governance/api/v2/delegates/${delegateId}`, token, {
    method: 'DELETE',
  });
}

// ─── Governance - Delegate Appointments (List) ───────

export async function getDelegateAppointments(userId: string) {
  try {
    const response = await oktaFetch<{ data: import('@/types/okta').OktaDelegateAppointment[] }>(
      '/governance/api/v1/delegates',
      {
        params: {
          filter: `delegatorId eq "${userId}"`,
          limit: '50',
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    // Beta API — may not be available
    console.warn('Delegate Appointments API not available:', error);
    return [];
  }
}

export async function getDelegateAppointmentsBulk(userIds: string[]) {
  if (userIds.length === 0) return [];
  try {
    const filter = userIds.map(id => `delegatorId eq "${id}"`).join(' OR ');
    const response = await oktaFetch<{ data: import('@/types/okta').OktaDelegateAppointment[] }>(
      '/governance/api/v1/delegates',
      {
        params: {
          filter: `(${filter})`,
          limit: '200',
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.warn('Delegate Appointments bulk API not available:', error);
    return [];
  }
}

export async function getDelegateAppointmentsBulkAsUser(token: string, userIds: string[]) {
  if (userIds.length === 0) return [];
  try {
    const filter = userIds.map(id => `delegatorId eq "${id}"`).join(' OR ');
    const response = await oktaGovernanceFetch<{ data: import('@/types/okta').OktaDelegateAppointment[] }>(
      '/governance/api/v1/delegates',
      token,
      {
        params: {
          filter: `(${filter})`,
          limit: '200',
        },
      }
    );
    return response.data ?? [];
  } catch (error) {
    console.warn('Delegate Appointments bulk API not available:', error);
    return [];
  }
}

// ─── Org API ──────────────────────────────────────────

export async function getOrg() {
  return oktaFetch<import('@/types/okta').OktaOrg>('/api/v1/org');
}
