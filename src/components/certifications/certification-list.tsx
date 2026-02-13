"use client";

import Link from "next/link";
import { OktaCertificationTask } from "@/types/okta";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { EntitlementRow } from "./entitlement-row";

interface CertificationListProps {
  tasks: OktaCertificationTask[];
}

const decisionColors: Record<string, string> = {
  APPROVE: "bg-green-100 text-green-800",
  REVOKE: "bg-red-100 text-red-800",
};

function resourceTypeBadge(type: string) {
  switch (type) {
    case "APPLICATION":
      return "bg-blue-100 text-blue-800";
    case "GROUP":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function CertificationList({ tasks }: CertificationListProps) {
  const isOverdue = (task: OktaCertificationTask) => {
    if (!task.dueDate || task.status !== "PENDING") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Resource</TableHead>
            <TableHead className="font-semibold">Campaign</TableHead>
            <TableHead className="font-semibold">Due Date</TableHead>
            <TableHead className="font-semibold">Decision</TableHead>
            <TableHead className="font-semibold w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const principalName = task.principalProfile
              ? `${task.principalProfile.firstName} ${task.principalProfile.lastName}`.trim()
              : "";

            return (
              <TableRow
                key={task.id}
                className={isOverdue(task) ? "bg-red-50" : "hover:bg-muted/50"}
              >
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-foreground">
                      {principalName || "Unknown"}
                    </p>
                    {task.principalProfile?.email && (
                      <p className="text-xs text-muted-foreground">
                        {task.principalProfile.email}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Link
                      href={`/certifications/${task.id}?campaignId=${task.campaignId}`}
                      className="hover:underline text-primary text-sm font-medium"
                    >
                      {task.resourceName || task.resourceId}
                    </Link>
                    <Badge variant="outline" className={resourceTypeBadge(task.resourceType)}>
                      {task.resourceType}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.campaignName || task.campaignId}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(task.dueDate)}</span>
                  {isOverdue(task) && (
                    <Badge variant="destructive" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {task.decision ? (
                    <Badge className={decisionColors[task.decision] || "bg-gray-100 text-gray-800"}>
                      {task.decision}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <EntitlementRow task={task} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
