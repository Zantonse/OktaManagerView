// Okta User Profile
export interface OktaUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  login: string;
  mobilePhone?: string;
  secondEmail?: string;
  managerId?: string;    // Manager's EMAIL (not Okta UID)
  manager?: string;      // Manager's display name
  department?: string;
  title?: string;
  onPTO?: boolean;
  ptoStartDate?: string;
  ptoEndDate?: string;
}

export interface OktaUser {
  id: string;
  status: 'STAGED' | 'PROVISIONED' | 'ACTIVE' | 'RECOVERY' | 'PASSWORD_EXPIRED' | 'LOCKED_OUT' | 'SUSPENDED' | 'DEPROVISIONED';
  created: string;
  activated?: string;
  statusChanged?: string;
  lastLogin?: string;
  lastUpdated: string;
  profile: OktaUserProfile;
  _links?: Record<string, { href: string }>;
}

// App Links
export interface OktaAppLink {
  id: string;
  label: string;
  linkUrl: string;
  logoUrl: string;
  appName: string;
  appInstanceId: string;
  appAssignmentId: string;
  credentialsSetup: boolean;
  hidden: boolean;
  sortOrder: number;
}

// App User (entitlements/roles within an app)
export interface OktaAppUser {
  id: string;
  scope: string;
  credentials?: {
    userName?: string;
  };
  profile?: Record<string, unknown>;
  _links?: Record<string, { href: string }>;
}

// Groups
export interface OktaGroup {
  id: string;
  created: string;
  lastUpdated: string;
  lastMembershipUpdated: string;
  type: 'OKTA_GROUP' | 'APP_GROUP' | 'BUILT_IN';
  profile: {
    name: string;
    description?: string;
  };
}

// Governance - Campaigns (Access Reviews)
export interface OktaCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CLOSED' | 'SCHEDULED' | 'BUILDING' | 'LAUNCHING' | 'ERROR';
  created: string;
  lastUpdated: string;
  launchedDate?: string;
  endedDate?: string;
  scheduledStartDate?: string;
  deadline?: string;
  scheduleSettings?: {
    type: string;
    startDate?: string;
    endDate?: string;
    durationInDays?: number;
    timeZone?: string;
  };
}

// Governance - Certification Tasks
export interface OktaCertificationTask {
  id: string;
  campaignId: string;
  campaignName?: string;
  // Mapped status: UNREVIEWED → PENDING, decided → COMPLETED
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  reviewerId: string;
  resourceId: string;
  resourceType: string;
  resourceName?: string;
  decision?: 'APPROVE' | 'REVOKE' | 'UNREVIEWED' | null;
  decisionDate?: string;
  justification?: string;
  dueDate?: string;
  createdDate: string;
  // From Governance Reviews API v1
  principalProfile?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  reviewerProfile?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  remediationStatus?: string;
  reviewerType?: string;
}

// Governance - Access Requests
export interface OktaAccessRequest {
  id: string;
  status: 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'DENIED' | 'REJECTED' | 'CANCELED' | 'EXPIRED';
  created: string;
  createdBy?: string;
  lastUpdated: string;
  lastUpdatedBy?: string;
  resolved?: string;
  grantStatus?: string;
  granted?: string;
  requestedBy?: { type: string; externalId: string };
  requestedFor?: { type: string; externalId: string };
  requested?: {
    entryId?: string;
    resourceId?: string;
    resourceType?: string;
    accessScopeId?: string;
    accessScopeType?: string;
  };
  requesterFieldValues?: Array<{ id: string; label: string; type: string; value: string }>;
  _links?: Record<string, { href: string; type?: string }>;
  // Enriched by our API route (resolved from user IDs)
  requesterName?: string;
  requestedForName?: string;
  // Legacy flat fields (for backwards compatibility)
  requesterId?: string;
  resourceId?: string;
  resourceName?: string;
  resourceType?: string;
  justification?: string;
  reviewerId?: string;
  reviewerComment?: string;
  decisionDate?: string;
}

// Governance - Delegate Appointments (Principal Settings / Delegates API)
export interface OktaDelegateAppointment {
  id: string;
  delegator: { externalId: string; type: string };
  delegate: { externalId: string; type: string };
  startTime?: string;
  endTime?: string;
  note: string;
  createdBy: string;
  created: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  // Enriched client-side fields (resolved from delegate.externalId)
  delegateName?: string;
  delegateEmail?: string;
}

// Governance - Delegates (Beta)
export interface OktaDelegate {
  id: string;
  delegateId: string;
  delegateName?: string;
  delegateEmail?: string;
  delegatorId: string;
  scope: ('reviews' | 'requests')[];
  startDate: string;
  endDate: string;
  created: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

// Org Info
export interface OktaOrg {
  id: string;
  companyName: string;
  subdomain: string;
  status: string;
  created: string;
  _links?: Record<string, { href: string }>;
}

// API Response wrappers
export interface OktaPaginatedResponse<T> {
  data: T[];
  after?: string;
  hasMore: boolean;
}

export interface OktaApiError {
  errorCode: string;
  errorSummary: string;
  errorLink?: string;
  errorId?: string;
  errorCauses?: Array<{
    errorSummary: string;
  }>;
}
