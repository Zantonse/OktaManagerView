"use client";

import Link from "next/link";
import { OktaCertificationTask } from "@/types/okta";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { EntitlementRow } from "./entitlement-row";

interface CertificationCardsProps {
  tasks: OktaCertificationTask[];
}

const decisionColors: Record<string, string> = {
  APPROVE: "bg-green-100 text-green-800",
  REVOKE: "bg-red-100 text-red-800",
};

export function CertificationCards({ tasks }: CertificationCardsProps) {
  const isOverdue = (task: OktaCertificationTask) => {
    if (!task.dueDate || task.status !== "PENDING") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const principalName = task.principalProfile
          ? `${task.principalProfile.firstName} ${task.principalProfile.lastName}`.trim()
          : "";

        return (
          <Card
            key={task.id}
            className={`p-4 ${isOverdue(task) ? "border-red-300 bg-red-50" : ""}`}
          >
            <div className="space-y-3">
              {/* User being reviewed */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">
                    {principalName || "Unknown"}
                  </h3>
                  {task.principalProfile?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {task.principalProfile.email}
                    </p>
                  )}
                </div>
                {task.decision ? (
                  <Badge className={decisionColors[task.decision] || "bg-gray-100 text-gray-800"}>
                    {task.decision}
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>
                )}
              </div>

              {/* Resource */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Resource</p>
                <Link
                  href={`/certifications/${task.id}?campaignId=${task.campaignId}`}
                  className="hover:underline text-primary text-sm font-medium"
                >
                  {task.resourceName || task.resourceId}
                </Link>
              </div>

              {/* Campaign + Due Date */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Campaign</p>
                  <p className="font-medium truncate">{task.campaignName || task.campaignId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>

              {isOverdue(task) && (
                <Badge variant="destructive">Overdue</Badge>
              )}

              {/* Actions */}
              <div>
                <EntitlementRow task={task} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
