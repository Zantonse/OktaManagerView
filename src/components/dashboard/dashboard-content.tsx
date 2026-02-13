"use client";

import useSWR from "swr";
import { OktaUser } from "@/types/okta";
import { OverviewCards } from "./overview-cards";
import { QuickActions } from "./quick-actions";
import { TeamContent } from "@/components/team/team-content";
import { fetcher } from "@/lib/fetcher";

export function DashboardContent() {
  // Fetch direct reports — API returns { data: OktaUser[], nextCursor? }
  const { data: usersResponse, isLoading: isLoadingUsers } = useSWR<{ data: OktaUser[]; nextCursor?: string }>(
    "/api/okta/users?limit=200",
    fetcher,
    { revalidateOnFocus: false }
  );
  const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse?.data;

  // Fetch pending review count for the logged-in manager
  const { data: reviewsCountResponse, isLoading: isLoadingReviews } = useSWR(
    "/api/okta/governance/certifications?pendingOnly=true&countOnly=true",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const isLoading = isLoadingUsers || isLoadingReviews;

  // Extract metrics — safely unwrap { data } wrappers and guard with Array.isArray
  const directReportsCount = Array.isArray(usersData) ? usersData.length : 0;
  const activeReviewsCount = reviewsCountResponse?.count ?? 0;

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
