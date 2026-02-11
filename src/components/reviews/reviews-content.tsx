"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { OktaCampaign, OktaCertificationTask } from "@/types/okta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewsList } from "./reviews-list";
import { ReviewsCards } from "./reviews-cards";
import { CertificationList } from "@/components/certifications/certification-list";
import { CertificationCards } from "@/components/certifications/certification-cards";
import { fetcher } from "@/lib/fetcher";

interface CampaignsResponse {
  data: OktaCampaign[];
  nextCursor?: string;
}

export function ReviewsContent() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [allCampaigns, setAllCampaigns] = useState<OktaCampaign[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Certification state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [certStatusFilter, setCertStatusFilter] = useState<string | undefined>(undefined);

  const { data, error, isLoading, mutate } = useSWR<CampaignsResponse>(
    `/api/okta/governance/campaigns${statusFilter ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Detect if the Governance API is not available
  const isApiUnavailable = error?.message?.includes("does not support") ||
    error?.message?.includes("not found") ||
    error?.status === 404 ||
    error?.status === 405;

  useEffect(() => {
    if (data) {
      // Safely unwrap: proxy returns { data: [...], nextCursor }
      const campaigns = Array.isArray(data) ? data : (data as CampaignsResponse).data;
      if (Array.isArray(campaigns)) {
        setAllCampaigns(campaigns);
        setNextCursor((data as CampaignsResponse).nextCursor);
      }
    }
  }, [data]);

  // Certification tasks for selected campaign
  const { data: tasks, isLoading: isLoadingTasks } = useSWR(
    selectedCampaignId ? `/api/okta/governance/certifications?campaignId=${selectedCampaignId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const taskList: OktaCertificationTask[] = Array.isArray(tasks) ? tasks : (Array.isArray(tasks?.data) ? tasks.data : []);
  const filteredTasks = certStatusFilter
    ? taskList.filter((t) => t.status === certStatusFilter)
    : taskList;

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");
      params.set("after", nextCursor);
      const response = await fetch(`/api/okta/governance/campaigns?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to load more campaigns");
      const result = await response.json();
      const moreCampaigns = Array.isArray(result) ? result : (result.data ?? []);
      setAllCampaigns((prev) => [...prev, ...moreCampaigns]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error("Error loading more campaigns:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, statusFilter]);

  // If the Governance API isn't available, show a friendly message
  if (isApiUnavailable) {
    return (
      <Card className="p-6">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Access Reviews not available
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your Okta org does not have the Governance Campaigns API enabled.
              Contact your Okta admin to enable Identity Governance features.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {error.message || "Something went wrong"}
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => mutate()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Tabs: Campaigns vs Certifications */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="certifications">Review Tasks</TabsTrigger>
          </TabsList>
          {activeTab === "campaigns" && (
            <Link href="/reviews/create">
              <Button size="sm">Create Review</Button>
            </Link>
          )}
        </div>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Campaign Status Filter */}
          <Tabs
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="ACTIVE">Active</TabsTrigger>
              <TabsTrigger value="CLOSED">Closed</TabsTrigger>
              <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
              <TabsTrigger value="BUILDING">Building</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter || "all"} className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : allCampaigns.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-lg font-medium text-foreground">No access reviews</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create a review to get started.
                  </p>
                </Card>
              ) : (
                <>
                  <div className="hidden md:block">
                    <ReviewsList campaigns={allCampaigns} />
                  </div>
                  <div className="md:hidden">
                    <ReviewsCards campaigns={allCampaigns} />
                  </div>
                  {nextCursor && (
                    <div className="flex justify-center pt-4">
                      <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline">
                        {isLoadingMore ? "Loading..." : (
                          <>Load More <ChevronDown className="ml-2 size-4" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-4">
          {/* Campaign selector */}
          <Select
            value={selectedCampaignId ?? undefined}
            onValueChange={(v) => {
              setSelectedCampaignId(v);
              setCertStatusFilter(undefined);
            }}
          >
            <SelectTrigger className="md:w-80">
              <SelectValue placeholder="Select a campaign to review" />
            </SelectTrigger>
            <SelectContent>
              {allCampaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!selectedCampaignId ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select a campaign above to view certification tasks.
              </p>
            </Card>
          ) : isLoadingTasks ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Certification status filter */}
              <Tabs
                value={certStatusFilter || "all"}
                onValueChange={(v) => setCertStatusFilter(v === "all" ? undefined : v)}
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="PENDING">Pending</TabsTrigger>
                  <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
                  <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                  <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
                </TabsList>
                <TabsContent value={certStatusFilter || "all"} className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No certification tasks match the selected filter.
                      </p>
                    </Card>
                  ) : (
                    <>
                      <div className="hidden md:block">
                        <CertificationList tasks={filteredTasks} />
                      </div>
                      <div className="md:hidden">
                        <CertificationCards tasks={filteredTasks} />
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
