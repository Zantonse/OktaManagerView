"use client";

import { useState } from "react";
import useSWR from "swr";
import { OktaAccessRequest } from "@/types/okta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestQueue } from "./request-queue";
import { RequestCards } from "./request-cards";
import { fetcher } from "@/lib/fetcher";

export function RequestQueueContent() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: requests = [], isLoading, mutate } = useSWR(
    `/api/okta/governance/requests${statusFilter ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const allRequests = Array.isArray(requests) ? requests : [];

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <Tabs
        value={statusFilter || "all"}
        onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="DENIED">Denied</TabsTrigger>
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
          ) : allRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-lg font-medium text-foreground">No access requests</p>
              <p className="mt-2 text-sm text-muted-foreground">
                There are currently no access requests to review.
              </p>
            </Card>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <RequestQueue requests={allRequests} mutate={mutate} />
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                <RequestCards requests={allRequests} mutate={mutate} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
