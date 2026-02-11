"use client";

import useSWR from "swr";
import { OktaUser, OktaCampaign, OktaAccessRequest } from "@/types/okta";
import { OverviewCards } from "./overview-cards";
import { QuickActions } from "./quick-actions";
import { TeamContent } from "@/components/team/team-content";
import { fetcher } from "@/lib/fetcher";

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

  const isLoading = isLoadingUsers || isLoadingRequests || isLoadingCampaigns;

  // Extract metrics — use Array.isArray to guard against error responses
  const directReportsCount = Array.isArray(usersData) ? usersData.length : 0;
  const onPTOCount = Array.isArray(usersData)
    ? usersData.filter((u) => u.profile.onPTO === true).length
    : 0;
  const pendingRequestsCount = Array.isArray(requestsData) ? requestsData.length : 0;
  const activeReviewsCount = Array.isArray(campaignsData) ? campaignsData.length : 0;

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team and access reviews
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Overview Cards */}
      <OverviewCards
        directReportsCount={directReportsCount}
        pendingReviewsCount={activeReviewsCount}
        accessRequestsCount={pendingRequestsCount}
        onPTOCount={onPTOCount}
        isLoading={isLoading}
      />

      {/* Team */}
      <div>
        <h2 className="text-[15px] font-semibold text-foreground mb-3">
          Team Members
        </h2>
        <TeamContent initialUsers={usersData} />
      </div>
    </div>
  );
}
