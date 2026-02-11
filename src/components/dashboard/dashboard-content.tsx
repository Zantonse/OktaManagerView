"use client";

import useSWR from "swr";
import { OktaUser, OktaCampaign, OktaAccessRequest } from "@/types/okta";
import { OverviewCards } from "./overview-cards";
import { QuickActions } from "./quick-actions";
import { ActivityFeed } from "./activity-feed";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardContent() {
  // Fetch direct reports
  const { data: usersData, isLoading: isLoadingUsers } = useSWR<OktaUser[]>(
    "/api/okta/users?limit=200",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch pending access requests
  const { data: requestsData, isLoading: isLoadingRequests } = useSWR<
    OktaAccessRequest[]
  >("/api/okta/governance/requests?status=PENDING&limit=50", fetcher, {
    revalidateOnFocus: false,
  });

  // Fetch active campaigns
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useSWR<
    OktaCampaign[]
  >("/api/okta/governance/campaigns?status=ACTIVE&limit=50", fetcher, {
    revalidateOnFocus: false,
  });

  // Fetch all requests (for activity feed)
  const { data: allRequestsData } = useSWR<OktaAccessRequest[]>(
    "/api/okta/governance/requests?limit=50",
    fetcher,
    { revalidateOnFocus: false }
  );

  const isLoading = isLoadingUsers || isLoadingRequests || isLoadingCampaigns;

  // Extract metrics
  const directReportsCount = usersData ? usersData.length : 0;
  const onPTOCount = usersData
    ? usersData.filter((u) => u.profile.onPTO === true).length
    : 0;
  const pendingRequestsCount = requestsData ? requestsData.length : 0;
  const activeReviewsCount = campaignsData ? campaignsData.length : 0;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage your team and access reviews
        </p>
      </div>

      {/* Overview Cards */}
      <OverviewCards
        directReportsCount={directReportsCount}
        pendingReviewsCount={activeReviewsCount}
        accessRequestsCount={pendingRequestsCount}
        onPTOCount={onPTOCount}
        isLoading={isLoading}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Activity Feed */}
      <ActivityFeed
        requests={allRequestsData || []}
        campaigns={campaignsData || []}
        isLoading={isLoadingCampaigns}
      />
    </div>
  );
}
