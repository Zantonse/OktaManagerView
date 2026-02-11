"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { OktaAccessRequest } from "@/types/okta";
import { formatDate } from "@/lib/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestDetailContent } from "./request-detail-content";
import { fetcher } from "@/lib/fetcher";

interface RequestDetailPageProps {
  params: Promise<{ requestId: string }>;
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "DENIED":
      return "bg-red-100 text-red-800";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getResourceTypeColor(resourceType: string) {
  switch (resourceType) {
    case "APPLICATION":
      return "bg-blue-100 text-blue-800";
    case "GROUP":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function RequestDetailPage({ params }: RequestDetailPageProps) {
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setRequestId(p.requestId));
  }, [params]);

  const { data: requests = [], error, isLoading, mutate } = useSWR(
    "/api/okta/governance/requests",
    fetcher,
    { revalidateOnFocus: false }
  );

  const allRequests = Array.isArray(requests) ? requests : [];
  const request = allRequests.find((r: OktaAccessRequest) => r.id === requestId);

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

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* Requester Information Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-40" />
            </div>
          ))}
        </div>

        <Skeleton className="h-px w-full" />

        {/* Resource Information Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-40" />
            </div>
          ))}
        </div>

        <Skeleton className="h-px w-full" />

        {/* Justification Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* Dates Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <Skeleton className="h-px w-full" />

        {/* Action Buttons Skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-40" />
        </div>
      </Card>
    );
  }

  if (!request) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-medium text-foreground">Request not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find the access request you're looking for.
        </p>
      </Card>
    );
  }

  return <RequestDetailContent request={request} />;
}
