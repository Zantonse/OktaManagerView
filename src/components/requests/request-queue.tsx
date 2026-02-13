"use client";

import { OktaAccessRequest } from "@/types/okta";
import { formatRelativeTime } from "@/lib/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApproveDenyDialog } from "./approve-deny-dialog";
import { useState } from "react";

interface RequestQueueProps {
  requests: OktaAccessRequest[];
  mutate: () => void;
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

export function RequestQueue({ requests, mutate }: RequestQueueProps) {
  const [selectedRequest, setSelectedRequest] = useState<OktaAccessRequest | null>(null);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);

  const handleAction = (request: OktaAccessRequest, actionType: "approve" | "deny") => {
    setSelectedRequest(request);
    setAction(actionType);
  };

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Requester</TableHead>
              <TableHead className="font-semibold">Resource</TableHead>
              <TableHead className="font-semibold">Justification</TableHead>
              <TableHead className="font-semibold">Submitted</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const requesterName = request.requesterName || request.requestedBy?.externalId || "Unknown";
              const requestedForName = request.requestedForName || request.requestedFor?.externalId;
              const resourceType = request.requested?.resourceType || request.resourceType || "—";
              const resourceLabel = request.resourceName || request.requested?.resourceId || request.resourceId || "N/A";
              const justificationField = request.requesterFieldValues?.find(f => f.type === "TEXT");
              const justification = justificationField?.value || request.justification;

              return (
              <TableRow key={request.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-sm">
                      {requesterName}
                    </p>
                    {requestedForName && requestedForName !== requesterName && (
                      <p className="text-xs text-muted-foreground">
                        for {requestedForName}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {resourceLabel}
                    </p>
                    {resourceType !== "—" && (
                      <Badge variant="outline" className={getResourceTypeColor(resourceType)}>
                        {resourceType}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p
                    className="text-sm text-muted-foreground truncate max-w-xs"
                    title={justification || "No justification provided"}
                  >
                    {justification
                      ? justification.substring(0, 100) +
                        (justification.length > 100 ? "..." : "")
                      : "No justification"}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeTime(request.created)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === "PENDING" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(request, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(request, "deny")}
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedRequest && action && (
        <ApproveDenyDialog
          request={selectedRequest}
          action={action}
          onClose={() => {
            setSelectedRequest(null);
            setAction(null);
          }}
          onSuccess={() => {
            setSelectedRequest(null);
            setAction(null);
            mutate();
          }}
        />
      )}
    </>
  );
}
