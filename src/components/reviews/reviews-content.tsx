"use client";

import { useState } from "react";
import useSWR from "swr";
import { OktaCampaign } from "@/types/okta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewsList } from "./reviews-list";
import { ReviewsCards } from "./reviews-cards";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ReviewsContent() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: campaigns = [], isLoading } = useSWR(
    `/api/okta/governance/campaigns${statusFilter ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const allCampaigns = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <Tabs
        value={statusFilter || "all"}
        onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}
        className="w-full"
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
              {[...Array(5)].map((_, i) => (
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
                There are currently no access reviews. Create one to get started.
              </p>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <ReviewsList campaigns={allCampaigns} />
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <ReviewsCards campaigns={allCampaigns} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
