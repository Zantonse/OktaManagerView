"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { RefreshCw, ChevronDown, AlertTriangle } from "lucide-react";
import { OktaAccessRequest } from "@/types/okta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RequestQueue } from "./request-queue";
import { RequestCards } from "./request-cards";
import { fetcher } from "@/lib/fetcher";

interface RequestsResponse {
  data: OktaAccessRequest[];
  nextCursor?: string;
}

export function RequestQueueContent() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [allRequests, setAllRequests] = useState<OktaAccessRequest[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<RequestsResponse>(
    `/api/okta/governance/requests${statusFilter ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Update allRequests when data changes (e.g., on filter change)
  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      setAllRequests(data.data);
      setNextCursor(data.nextCursor);
    }
  }, [data]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return;

    setIsLoadingMore(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.set("status", statusFilter);
      queryParams.set("limit", "50");
      queryParams.set("after", nextCursor);

      const response = await fetch(`/api/okta/governance/requests?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to load more requests");

      const result: RequestsResponse = await response.json();
      setAllRequests((prev) => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      console.error("Error loading more requests:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, statusFilter]);

  const isApiUnavailable = error?.message?.includes("does not support") ||
    error?.message?.includes("not found") ||
    error?.status === 404 ||
    error?.status === 405;

  if (isApiUnavailable) {
    return (
      <Card className="p-6">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Access Requests not available
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your Okta org does not have the Governance Access Requests API enabled.
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
      {/* Filter Bar with Refresh Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1" />
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => mutate()}
          title="Refresh requests"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

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

              {/* Load More Button */}
              {nextCursor && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <ChevronDown className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
