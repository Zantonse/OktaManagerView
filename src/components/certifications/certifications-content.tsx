"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { OktaCertificationTask, OktaCampaign } from "@/types/okta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificationList } from "./certification-list";
import { CertificationCards } from "./certification-cards";
import { fetcher } from "@/lib/fetcher";

export function CertificationsContent() {
  const searchParams = useSearchParams();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    searchParams.get("campaignId")
  );
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useSWR(
    "/api/okta/governance/campaigns",
    fetcher,
    { revalidateOnFocus: false }
  );

  const campaignList = Array.isArray(campaigns) ? campaigns : [];

  // Fetch certification tasks for selected campaign
  const { data: tasks = [], isLoading: isLoadingTasks } = useSWR(
    selectedCampaignId ? `/api/okta/governance/certifications?campaignId=${selectedCampaignId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const taskList = Array.isArray(tasks) ? tasks : [];

  // Filter tasks by status
  const filteredTasks = statusFilter
    ? taskList.filter((task: OktaCertificationTask) => task.status === statusFilter)
    : taskList;

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setStatusFilter(undefined);
  };

  if (!selectedCampaignId && campaignList.length > 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-foreground">Select a campaign to review</p>
          <Select onValueChange={handleCampaignChange}>
            <SelectTrigger className="w-full md:w-64 mx-auto">
              <SelectValue placeholder="Choose a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaignList.map((campaign: OktaCampaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    );
  }

  if (isLoadingCampaigns || (isLoadingTasks && selectedCampaignId)) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!selectedCampaignId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-medium text-foreground">No campaigns available</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an access review first to start certifying access.
        </p>
      </Card>
    );
  }

  if (filteredTasks.length === 0 && !isLoadingTasks) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-medium text-foreground">No certification tasks</p>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no certification tasks for this campaign.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campaign Selector */}
      <div>
        <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select campaign" />
          </SelectTrigger>
          <SelectContent>
            {campaignList.map((campaign: OktaCampaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter Tabs */}
      <Tabs
        value={statusFilter || "all"}
        onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter || "all"} className="space-y-4">
          {isLoadingTasks ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-lg font-medium text-foreground">No certification tasks</p>
              <p className="mt-2 text-sm text-muted-foreground">
                No tasks match the selected filter.
              </p>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <CertificationList tasks={filteredTasks} />
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <CertificationCards tasks={filteredTasks} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
