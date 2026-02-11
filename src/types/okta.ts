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
  status: 'ACTIVE' | 'CLOSED' | 'SCHEDULED' | 'BUILDING' | 'LAUNCHING';
  created: string;
  lastUpdated: string;
  launchedDate?: string;
  endedDate?: string;
  scheduledStartDate?: string;
  deadline?: string;
}

// Governance - Certification Tasks
export interface OktaCertificationTask {
  id: string;
  campaignId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  reviewerId: string;
  resourceId: string;
  resourceType: string;
  resourceName?: string;
  decision?: 'APPROVE' | 'REVOKE' | null;
  decisionDate?: string;
  justification?: string;
  dueDate?: string;
  createdDate: string;
}

// Governance - Access Requests
export interface OktaAccessRequest {
  id: string;
  requesterId: string;
  requesterName?: string;
  resourceId: string;
  resourceName?: string;
  resourceType: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'CANCELLED' | 'EXPIRED';
  justification?: string;
  created: string;
  lastUpdated: string;
  reviewerId?: string;
  reviewerComment?: string;
  decisionDate?: string;
}

// Governance - Delegate Appointments (Principal Settings API)
export interface OktaDelegateAppointment {
  id: string;
  delegator: { externalId: string; type: string };
  delegate: { externalId: string; type: string };
  startTime: string;
  endTime: string;
  note: string;
  createdBy: string;
  created: string;
  lastUpdated: string;
  lastUpdatedBy: string;
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
