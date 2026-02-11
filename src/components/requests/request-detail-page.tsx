"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { OktaAccessRequest } from "@/types/okta";
import { formatDate } from "@/lib/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestDetailContent } from "./request-detail-content";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

  const { data: requests = [], isLoading } = useSWR(
    "/api/okta/governance/requests",
    fetcher,
    { revalidateOnFocus: false }
  );

  const allRequests = Array.isArray(requests) ? requests : [];
  const request = allRequests.find((r: OktaAccessRequest) => r.id === requestId);

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-32" />
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
