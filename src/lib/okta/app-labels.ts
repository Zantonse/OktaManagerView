// Mapping of common Okta app role identifiers to friendly labels
const APP_ROLE_LABELS: Record<string, Record<string, string>> = {
  salesforce: {
    'sysadmin': 'System Administrator',
    'standard_user': 'Standard User',
    'read_only': 'Read Only',
    'marketing_user': 'Marketing User',
    'chatter_free': 'Chatter Free User',
  },
  aws: {
    'admin': 'Administrator',
    'poweruser': 'Power User',
    'readonly': 'Read Only',
    'developer': 'Developer',
    'billing': 'Billing',
  },
  github: {
    'admin': 'Organization Admin',
    'member': 'Member',
    'billing_manager': 'Billing Manager',
    'outside_collaborator': 'Outside Collaborator',
  },
  jira: {
    'jira-administrators': 'Jira Administrator',
    'jira-software-users': 'Jira Software User',
    'jira-servicemanagement-users': 'Service Management User',
  },
  slack: {
    'admin': 'Workspace Admin',
    'owner': 'Workspace Owner',
    'member': 'Member',
    'guest': 'Guest',
  },
  google_workspace: {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'user': 'User',
  },
};

// Generic fallback labels
const GENERIC_ROLE_LABELS: Record<string, string> = {
  'admin': 'Administrator',
  'administrator': 'Administrator',
  'user': 'Standard User',
  'standard': 'Standard User',
  'readonly': 'Read Only',
  'read_only': 'Read Only',
  'viewer': 'Viewer',
  'editor': 'Editor',
  'contributor': 'Contributor',
  'manager': 'Manager',
  'owner': 'Owner',
  'member': 'Member',
  'guest': 'Guest',
  'superadmin': 'Super Administrator',
  'super_admin': 'Super Administrator',
  'billing': 'Billing',
  'developer': 'Developer',
  'analyst': 'Analyst',
  'auditor': 'Auditor',
  'operator': 'Operator',
  'support': 'Support',
};

export function getFriendlyRoleLabel(appName: string, roleId: string): string {
  const normalizedApp = appName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const normalizedRole = roleId.toLowerCase().trim();

  // Check app-specific labels first
  const appLabels = APP_ROLE_LABELS[normalizedApp];
  if (appLabels && appLabels[normalizedRole]) {
    return appLabels[normalizedRole];
  }

  // Check generic labels
  if (GENERIC_ROLE_LABELS[normalizedRole]) {
    return GENERIC_ROLE_LABELS[normalizedRole];
  }

  // Title-case the raw role ID as fallback
  return roleId
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
