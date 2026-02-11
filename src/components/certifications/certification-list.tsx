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

export function CertificationList({ tasks }: CertificationListProps) {
  const isOverdue = (task: OktaCertificationTask) => {
    if (!task.dueDate || task.status !== "PENDING") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Decision</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className={isOverdue(task) ? "bg-red-50" : undefined}
            >
              <TableCell className="font-medium">
                <Link
                  href={`/certifications/${task.id}?campaignId=${task.campaignId}`}
                  className="hover:underline text-primary"
                >
                  {task.resourceName || task.resourceId}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {task.resourceType}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[task.status] || "bg-gray-100 text-gray-800"}>
                  {task.status}
                </Badge>
                {isOverdue(task) && (
                  <Badge variant="destructive" className="ml-2">
                    Overdue
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {formatDate(task.dueDate)}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
