"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OktaDelegate } from "@/types/okta";
import { formatDate } from "@/lib/utils/date";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DelegateListResponse {
  delegates: OktaDelegate[];
  warning?: string;
}

const fetcher = async (url: string): Promise<DelegateListResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch delegates");
  return res.json();
};

export function DelegateList() {
  const { data, error, isLoading, mutate } = useSWR<DelegateListResponse>(
    "/api/okta/governance/delegates",
    fetcher,
    { revalidateOnFocus: false }
  );

  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (delegateId: string) => {
    setRevoking(delegateId);
    try {
      const response = await fetch(
        `/api/okta/governance/delegates/${delegateId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke delegate");
      }

      toast.success("Delegate revoked successfully");
      mutate();
    } catch (error) {
      console.error("Error revoking delegate:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke delegate"
      );
    } finally {
      setRevoking(null);
    }
  };

  const getStatusColor = (status: OktaDelegate["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      case "REVOKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScopeLabel = (scope: string) => {
    return scope.charAt(0).toUpperCase() + scope.slice(1);
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Delegates</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Show warning if API is not available
  if (data?.warning) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Delegates</h3>
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">API Not Available</p>
            <p className="text-sm text-yellow-700 mt-1">{data.warning}</p>
          </div>
        </div>
      </Card>
    );
  }

  const delegates = data?.delegates || [];
  const activeDelegates = delegates.filter((d) => d.status === "ACTIVE");
  const otherDelegates = delegates.filter((d) => d.status !== "ACTIVE");

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Active Delegates</h3>

      {delegates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No delegates assigned</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Delegates */}
          {activeDelegates.map((delegate) => (
            <div
              key={delegate.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {delegate.delegateName || "Unknown User"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {delegate.delegateEmail}
                  </div>

                  {/* Scopes */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {delegate.scope.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {getScopeLabel(s)}
                      </Badge>
                    ))}
                  </div>

                  {/* Date Range */}
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(delegate.startDate)} — {formatDate(delegate.endDate)}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(delegate.status)}>
                    {delegate.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(delegate.id)}
                    disabled={revoking === delegate.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Other Delegates (Expired/Revoked) */}
          {otherDelegates.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground font-medium mb-2">
                Past Delegations
              </p>
              {otherDelegates.map((delegate) => (
                <div key={delegate.id} className="p-3 border rounded-lg opacity-60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {delegate.delegateName || "Unknown User"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {delegate.delegateEmail}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDate(delegate.startDate)} — {formatDate(delegate.endDate)}
                      </div>
                    </div>
                    <Badge className={getStatusColor(delegate.status)}>
                      {delegate.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
