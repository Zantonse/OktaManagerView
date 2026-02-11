"use client";

import { OktaAccessRequest, OktaCampaign } from "@/types/okta";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils/date";
import {
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

interface ActivityFeedProps {
  requests: OktaAccessRequest[];
  campaigns: OktaCampaign[];
  isLoading: boolean;
}

interface ActivityItem {
  id: string;
  type: "request_approved" | "request_denied" | "campaign_created" | "request_pending";
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

export function ActivityFeed({
  requests,
  campaigns,
  isLoading,
}: ActivityFeedProps) {
  // Build activity items from requests and campaigns
  const activityItems: ActivityItem[] = [];

  // Add recent approved/denied requests
  if (requests && requests.length > 0) {
    requests.forEach((req) => {
      if (req.status === "APPROVED") {
        activityItems.push({
          id: req.id,
          type: "request_approved",
          description: `${req.requesterName || "User"} was approved for access to ${req.resourceName || "resource"}`,
          timestamp: req.decisionDate || req.lastUpdated,
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        });
      } else if (req.status === "DENIED") {
        activityItems.push({
          id: req.id,
          type: "request_denied",
          description: `${req.requesterName || "User"}'s access request for ${req.resourceName || "resource"} was denied`,
          timestamp: req.decisionDate || req.lastUpdated,
          icon: <XCircle className="h-5 w-5 text-red-600" />,
        });
      } else if (req.status === "PENDING") {
        activityItems.push({
          id: req.id,
          type: "request_pending",
          description: `${req.requesterName || "User"} requested access to ${req.resourceName || "resource"}`,
          timestamp: req.created,
          icon: <AlertCircle className="h-5 w-5 text-amber-600" />,
        });
      }
    });
  }

  // Add recent campaigns
  if (campaigns && campaigns.length > 0) {
    campaigns.forEach((camp) => {
      activityItems.push({
        id: camp.id,
        type: "campaign_created",
        description: `Access review campaign "${camp.name}" was created`,
        timestamp: camp.created,
        icon: <ClipboardCheck className="h-5 w-5 text-blue-600" />,
      });
    });
  }

  // Sort by timestamp descending and take last 10
  const sortedItems = activityItems
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  if (isLoading) {
    return (
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest governance actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest governance actions</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedItems.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 last:pb-0 border-b last:border-b-0">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground break-words">
                    {item.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
