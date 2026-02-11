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

export function CertificationCards({ tasks }: CertificationCardsProps) {
  const isOverdue = (task: OktaCertificationTask) => {
    if (!task.dueDate || task.status !== "PENDING") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`p-4 ${isOverdue(task) ? "border-red-300 bg-red-50" : ""}`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Link
                  href={`/certifications/${task.id}?campaignId=${task.campaignId}`}
                  className="hover:underline text-primary"
                >
                  <h3 className="font-semibold">{task.resourceName || task.resourceId}</h3>
                </Link>
                <p className="text-xs text-muted-foreground">{task.resourceType}</p>
              </div>
              <Badge className={statusColors[task.status] || "bg-gray-100 text-gray-800"}>
                {task.status}
              </Badge>
            </div>

            {isOverdue(task) && (
              <Badge variant="destructive">Overdue</Badge>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(task.dueDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Decision</p>
                {task.decision ? (
                  <Badge className={decisionColors[task.decision] || "bg-gray-100 text-gray-800"}>
                    {task.decision}
                  </Badge>
                ) : (
                  <p className="font-medium">—</p>
                )}
              </div>
            </div>

            <div>
              <EntitlementRow task={task} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
