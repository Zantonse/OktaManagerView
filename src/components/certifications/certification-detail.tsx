"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { OktaCertificationTask } from "@/types/okta";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/date";
import { EntitlementRow } from "./entitlement-row";
import { fetcher } from "@/lib/fetcher";

interface CertificationDetailProps {
  certId: string;
  campaignId: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
};

const decisionColors: Record<string, string> = {
  APPROVE: "bg-green-100 text-green-800",
  REVOKE: "bg-red-100 text-red-800",
};

export function CertificationDetail({ certId, campaignId }: CertificationDetailProps) {
  const { data: tasks, isLoading } = useSWR<OktaCertificationTask[]>(
    campaignId ? `/api/okta/governance/certifications?campaignId=${campaignId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const task = useMemo(
    () => tasks?.find((t) => t.id === certId) ?? null,
    [tasks, certId]
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg font-medium text-foreground">Certification task not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested certification task could not be loaded.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Details Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Resource Name</h3>
            <p className="text-lg font-semibold">{task.resourceName || task.resourceId}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Resource Type</h3>
            <p className="text-lg font-semibold">{task.resourceType}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
            <Badge className={statusColors[task.status] || "bg-gray-100 text-gray-800"}>
              {task.status}
            </Badge>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
            <p className="text-lg font-semibold">{formatDate(task.dueDate)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Decision</h3>
            {task.decision ? (
              <Badge className={decisionColors[task.decision] || "bg-gray-100 text-gray-800"}>
                {task.decision}
              </Badge>
            ) : (
              <p className="text-lg">—</p>
            )}
          </div>

          {task.decisionDate && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Decision Date</h3>
              <p className="text-lg font-semibold">{formatDate(task.decisionDate)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Justification Card (if revoked) */}
      {task.justification && (
        <Card className="p-6 bg-muted/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Justification</h3>
          <p className="text-foreground">{task.justification}</p>
        </Card>
      )}

      {/* Actions */}
      {task.status === "PENDING" && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Actions</h3>
          <EntitlementRow task={task} />
        </Card>
      )}
    </div>
  );
}
