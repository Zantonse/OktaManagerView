import { http, HttpResponse } from 'msw';
import { mockDirectReports, mockApps, mockGroups, mockCampaigns, mockCertifications, mockAccessRequests, mockDelegates, mockOrg } from './okta-data';

const OKTA_BASE = process.env.NEXT_PUBLIC_OKTA_DOMAIN || 'https://test.okta.com';

export const handlers = [
  // Users
  http.get(`${OKTA_BASE}/api/v1/users`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    let results = mockDirectReports;
    // Basic search filtering
    if (search.includes('profile.firstName sw')) {
      const match = search.match(/profile\.firstName sw "([^"]+)"/);
      if (match) {
        results = results.filter(u => u.profile.firstName.toLowerCase().startsWith(match[1].toLowerCase()));
      }
    }
    return HttpResponse.json(results);
  }),

  http.get(`${OKTA_BASE}/api/v1/users/:id`, ({ params }) => {
    const user = mockDirectReports.find(u => u.id === params.id);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.get(`${OKTA_BASE}/api/v1/users/:id/appLinks`, () => {
    return HttpResponse.json(mockApps);
  }),

  http.get(`${OKTA_BASE}/api/v1/users/:id/groups`, () => {
    return HttpResponse.json(mockGroups);
  }),

  http.post(`${OKTA_BASE}/api/v1/users/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const user = mockDirectReports.find(u => u.id === params.id);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...user, profile: { ...user.profile, ...(body as { profile?: Record<string, unknown> }).profile } });
  }),

  // Lifecycle
  http.post(`${OKTA_BASE}/api/v1/users/:id/lifecycle/suspend`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(`${OKTA_BASE}/api/v1/users/:id/lifecycle/unsuspend`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Campaigns
  http.get(`${OKTA_BASE}/api/v1/campaigns`, () => {
    return HttpResponse.json(mockCampaigns);
  }),

  http.post(`${OKTA_BASE}/api/v1/campaigns`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'camp-new',
      ...body,
      status: 'BUILDING',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Certifications
  http.get(`${OKTA_BASE}/governance/api/v2/campaigns/:id/reviewers/tasks`, () => {
    return HttpResponse.json(mockCertifications);
  }),

  // Access Requests
  http.get(`${OKTA_BASE}/governance/api/v2/requests`, () => {
    return HttpResponse.json(mockAccessRequests);
  }),

  http.put(`${OKTA_BASE}/governance/api/v2/requests/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const req = mockAccessRequests.find(r => r.id === params.id);
    if (!req) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...req, ...body, lastUpdated: new Date().toISOString() });
  }),

  // Delegates
  http.get(`${OKTA_BASE}/governance/api/v2/delegates`, () => {
    return HttpResponse.json(mockDelegates);
  }),

  http.post(`${OKTA_BASE}/governance/api/v2/delegates`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'del-new',
      ...body,
      status: 'ACTIVE',
      created: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.delete(`${OKTA_BASE}/governance/api/v2/delegates/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Org
  http.get(`${OKTA_BASE}/api/v1/org`, () => {
    return HttpResponse.json(mockOrg);
  }),
];
