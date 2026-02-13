"use client";

import { OktaAccessRequest } from "@/types/okta";
import { formatRelativeTime } from "@/lib/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApproveDenyDialog } from "./approve-deny-dialog";
import { useState } from "react";

interface RequestCardsProps {
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

export function RequestCards({ requests, mutate }: RequestCardsProps) {
  const [selectedRequest, setSelectedRequest] = useState<OktaAccessRequest | null>(null);
  const [action, setAction] = useState<"approve" | "deny" | null>(null);

  const handleAction = (request: OktaAccessRequest, actionType: "approve" | "deny") => {
    setSelectedRequest(request);
    setAction(actionType);
  };

  return (
    <>
      <div className="space-y-3">
        {requests.map((request) => {
          const requesterName = request.requesterName || request.requestedBy?.externalId || "Unknown";
          const requestedForName = request.requestedForName || request.requestedFor?.externalId;
          const resourceType = request.requested?.resourceType || request.resourceType || "—";
          const resourceLabel = request.resourceName || request.requested?.resourceId || request.resourceId || "N/A";
          const justificationField = request.requesterFieldValues?.find(f => f.type === "TEXT");
          const justification = justificationField?.value || request.justification;

          return (
          <Card key={request.id} className="p-4 border border-border">
            <div className="space-y-3">
              {/* Header with Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">
                    {requesterName}
                  </h3>
                  {requestedForName && requestedForName !== requesterName && (
                    <p className="text-xs text-muted-foreground truncate">
                      for {requestedForName}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>

              {/* Resource */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Resource</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {resourceLabel}
                  </p>
                  {resourceType !== "—" && (
                    <Badge variant="outline" className={getResourceTypeColor(resourceType)}>
                      {resourceType}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Justification */}
              {justification && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Justification</p>
                  <p className="text-sm text-foreground line-clamp-2">
                    {justification}
                  </p>
                </div>
              )}

              {/* Submitted */}
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Submitted {formatRelativeTime(request.created)}
                </p>
              </div>

              {/* Actions */}
              {request.status === "PENDING" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(request, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAction(request, "deny")}
                  >
                    Deny
                  </Button>
                </div>
              )}
            </div>
          </Card>
          );
        })}
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
