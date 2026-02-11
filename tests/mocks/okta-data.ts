import type { OktaUser, OktaAppLink, OktaGroup, OktaCampaign, OktaCertificationTask, OktaAccessRequest, OktaDelegate, OktaOrg } from '@/types/okta';

export const mockManager: OktaUser = {
  id: 'mgr001',
  status: 'ACTIVE',
  created: '2023-01-15T00:00:00.000Z',
  lastUpdated: '2024-06-01T00:00:00.000Z',
  lastLogin: '2024-12-01T10:00:00.000Z',
  profile: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    login: 'jane.doe@example.com',
    title: 'Engineering Manager',
    department: 'Engineering',
    managerId: undefined,
    manager: undefined,
  },
};

export const mockDirectReports: OktaUser[] = [
  {
    id: 'usr001',
    status: 'ACTIVE',
    created: '2023-03-01T00:00:00.000Z',
    lastUpdated: '2024-11-15T00:00:00.000Z',
    lastLogin: '2024-12-01T09:30:00.000Z',
    profile: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      login: 'alice.smith@example.com',
      title: 'Software Engineer',
      department: 'Engineering',
      managerId: 'jane.doe@example.com',
      manager: 'Jane Doe',
    },
  },
  {
    id: 'usr002',
    status: 'ACTIVE',
    created: '2023-04-15T00:00:00.000Z',
    lastUpdated: '2024-10-20T00:00:00.000Z',
    lastLogin: '2024-11-30T14:00:00.000Z',
    profile: {
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob.jones@example.com',
      login: 'bob.jones@example.com',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      managerId: 'jane.doe@example.com',
      manager: 'Jane Doe',
      onPTO: true,
      ptoStartDate: '2024-12-20',
      ptoEndDate: '2024-12-27',
    },
  },
  {
    id: 'usr003',
    status: 'ACTIVE',
    created: '2023-06-01T00:00:00.000Z',
    lastUpdated: '2024-11-01T00:00:00.000Z',
    lastLogin: '2024-12-01T08:00:00.000Z',
    profile: {
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol.williams@example.com',
      login: 'carol.williams@example.com',
      title: 'Software Engineer',
      department: 'Engineering',
      managerId: 'jane.doe@example.com',
      manager: 'Jane Doe',
    },
  },
  {
    id: 'usr004',
    status: 'PROVISIONED',
    created: '2024-11-01T00:00:00.000Z',
    lastUpdated: '2024-11-01T00:00:00.000Z',
    profile: {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@example.com',
      login: 'david.brown@example.com',
      title: 'Junior Developer',
      department: 'Engineering',
      managerId: 'jane.doe@example.com',
      manager: 'Jane Doe',
    },
  },
  {
    id: 'usr005',
    status: 'ACTIVE',
    created: '2023-02-15T00:00:00.000Z',
    lastUpdated: '2024-09-15T00:00:00.000Z',
    lastLogin: '2024-12-01T11:00:00.000Z',
    profile: {
      firstName: 'Eve',
      lastName: 'Davis',
      email: 'eve.davis@example.com',
      login: 'eve.davis@example.com',
      title: 'QA Engineer',
      department: 'Engineering',
      managerId: 'jane.doe@example.com',
      manager: 'Jane Doe',
    },
  },
];

export const mockApps: OktaAppLink[] = [
  { id: 'link001', label: 'Salesforce', linkUrl: 'https://example.salesforce.com', logoUrl: 'https://ok12static.oktacdn.com/assets/img/logos/salesforce.png', appName: 'salesforce', appInstanceId: 'app001', appAssignmentId: 'assign001', credentialsSetup: true, hidden: false, sortOrder: 0 },
  { id: 'link002', label: 'GitHub', linkUrl: 'https://github.com', logoUrl: 'https://ok12static.oktacdn.com/assets/img/logos/github.png', appName: 'github', appInstanceId: 'app002', appAssignmentId: 'assign002', credentialsSetup: true, hidden: false, sortOrder: 1 },
  { id: 'link003', label: 'AWS Console', linkUrl: 'https://console.aws.amazon.com', logoUrl: 'https://ok12static.oktacdn.com/assets/img/logos/aws.png', appName: 'aws', appInstanceId: 'app003', appAssignmentId: 'assign003', credentialsSetup: true, hidden: false, sortOrder: 2 },
  { id: 'link004', label: 'Jira', linkUrl: 'https://example.atlassian.net', logoUrl: 'https://ok12static.oktacdn.com/assets/img/logos/jira.png', appName: 'jira', appInstanceId: 'app004', appAssignmentId: 'assign004', credentialsSetup: true, hidden: false, sortOrder: 3 },
  { id: 'link005', label: 'Slack', linkUrl: 'https://example.slack.com', logoUrl: 'https://ok12static.oktacdn.com/assets/img/logos/slack.png', appName: 'slack', appInstanceId: 'app005', appAssignmentId: 'assign005', credentialsSetup: true, hidden: false, sortOrder: 4 },
];

export const mockGroups: OktaGroup[] = [
  { id: 'grp001', created: '2023-01-01T00:00:00.000Z', lastUpdated: '2024-06-01T00:00:00.000Z', lastMembershipUpdated: '2024-11-01T00:00:00.000Z', type: 'OKTA_GROUP', profile: { name: 'Engineering', description: 'Engineering team members' } },
  { id: 'grp002', created: '2023-01-01T00:00:00.000Z', lastUpdated: '2024-06-01T00:00:00.000Z', lastMembershipUpdated: '2024-10-01T00:00:00.000Z', type: 'OKTA_GROUP', profile: { name: 'All Users', description: 'All company employees' } },
  { id: 'grp003', created: '2023-03-01T00:00:00.000Z', lastUpdated: '2024-08-01T00:00:00.000Z', lastMembershipUpdated: '2024-09-01T00:00:00.000Z', type: 'APP_GROUP', profile: { name: 'AWS-Developers', description: 'AWS developer access group' } },
];

export const mockCampaigns: OktaCampaign[] = [
  { id: 'camp001', name: 'Q1 2025 Access Review', description: 'Quarterly access review for engineering team', status: 'ACTIVE', created: '2024-12-01T00:00:00.000Z', lastUpdated: '2024-12-01T00:00:00.000Z', launchedDate: '2024-12-01T00:00:00.000Z', deadline: '2024-12-15T00:00:00.000Z' },
  { id: 'camp002', name: 'Ad-hoc Review - Alice Smith', description: 'Role change review', status: 'CLOSED', created: '2024-11-01T00:00:00.000Z', lastUpdated: '2024-11-05T00:00:00.000Z', launchedDate: '2024-11-01T00:00:00.000Z', endedDate: '2024-11-05T00:00:00.000Z' },
];

export const mockCertifications: OktaCertificationTask[] = [
  { id: 'cert001', campaignId: 'camp001', status: 'PENDING', reviewerId: 'mgr001', resourceId: 'usr001', resourceType: 'USER_APP', resourceName: 'Alice Smith - Salesforce', decision: null, dueDate: '2024-12-15T00:00:00.000Z', createdDate: '2024-12-01T00:00:00.000Z' },
  { id: 'cert002', campaignId: 'camp001', status: 'PENDING', reviewerId: 'mgr001', resourceId: 'usr002', resourceType: 'USER_APP', resourceName: 'Bob Jones - AWS Console', decision: null, dueDate: '2024-12-15T00:00:00.000Z', createdDate: '2024-12-01T00:00:00.000Z' },
  { id: 'cert003', campaignId: 'camp001', status: 'COMPLETED', reviewerId: 'mgr001', resourceId: 'usr003', resourceType: 'USER_APP', resourceName: 'Carol Williams - GitHub', decision: 'APPROVE', decisionDate: '2024-12-02T00:00:00.000Z', dueDate: '2024-12-15T00:00:00.000Z', createdDate: '2024-12-01T00:00:00.000Z' },
];

export const mockAccessRequests: OktaAccessRequest[] = [
  { id: 'req001', requesterId: 'usr001', requesterName: 'Alice Smith', resourceId: 'app006', resourceName: 'Datadog', resourceType: 'APPLICATION', status: 'PENDING', justification: 'Need access for monitoring production services', created: '2024-12-01T10:00:00.000Z', lastUpdated: '2024-12-01T10:00:00.000Z' },
  { id: 'req002', requesterId: 'usr003', requesterName: 'Carol Williams', resourceId: 'grp004', resourceName: 'VPN-Engineering', resourceType: 'GROUP', status: 'PENDING', justification: 'Remote work requires VPN access', created: '2024-11-30T15:00:00.000Z', lastUpdated: '2024-11-30T15:00:00.000Z' },
  { id: 'req003', requesterId: 'usr005', requesterName: 'Eve Davis', resourceId: 'app007', resourceName: 'PagerDuty', resourceType: 'APPLICATION', status: 'APPROVED', justification: 'On-call rotation starting next week', created: '2024-11-28T09:00:00.000Z', lastUpdated: '2024-11-29T11:00:00.000Z', reviewerId: 'mgr001', reviewerComment: 'Approved for on-call duties', decisionDate: '2024-11-29T11:00:00.000Z' },
];

export const mockDelegates: OktaDelegate[] = [
  { id: 'del001', delegateId: 'usr006', delegateName: 'Frank Miller', delegateEmail: 'frank.miller@example.com', delegatorId: 'mgr001', scope: ['reviews', 'requests'], startDate: '2024-12-20', endDate: '2024-12-27', created: '2024-12-15T00:00:00.000Z', status: 'ACTIVE' },
];

export const mockOrg: OktaOrg = {
  id: 'org001',
  companyName: 'Acme Corporation',
  subdomain: 'acme',
  status: 'ACTIVE',
  created: '2022-01-01T00:00:00.000Z',
};
