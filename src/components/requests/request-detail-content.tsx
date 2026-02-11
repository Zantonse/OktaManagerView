"use client";

import { useState } from "react";
import useSWR from "swr";
import { OktaAccessRequest } from "@/types/okta";
import { formatDate, formatRelativeTime } from "@/lib/utils/date";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApproveDenyDialog } from "./approve-deny-dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RequestDetailContentProps {
  request: OktaAccessRequest;
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

export function RequestDetailContent({ request: initialRequest }: RequestDetailContentProps) {
  const [selectedAction, setSelectedAction] = useState<"approve" | "deny" | null>(null);
  const { mutate } = useSWR("/api/okta/governance/requests", fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <>
      <Card className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Access Request Details
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ID: {initialRequest.id}
            </p>
          </div>
          <Badge className={getStatusColor(initialRequest.status)}>
            {initialRequest.status}
          </Badge>
        </div>

        <Separator />

        {/* Requester Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              REQUESTER NAME
            </p>
            <p className="text-lg font-medium text-foreground">
              {initialRequest.requesterName || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              REQUESTER ID
            </p>
            <p className="text-lg font-medium text-foreground">
              {initialRequest.requesterId || "N/A"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Resource Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              RESOURCE NAME
            </p>
            <p className="text-lg font-medium text-foreground">
              {initialRequest.resourceName || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              RESOURCE TYPE
            </p>
            <Badge className={getResourceTypeColor(initialRequest.resourceType)}>
              {initialRequest.resourceType}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Justification */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            JUSTIFICATION
          </p>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {initialRequest.justification || "No justification provided"}
          </p>
        </div>

        <Separator />

        {/* Submitted Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              SUBMITTED
            </p>
            <p className="text-sm text-foreground">
              {formatDate(initialRequest.created)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(initialRequest.created)}
            </p>
          </div>

          {initialRequest.decisionDate && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                DECISION DATE
              </p>
              <p className="text-sm text-foreground">
                {formatDate(initialRequest.decisionDate)}
              </p>
            </div>
          )}

          {initialRequest.reviewerId && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                REVIEWER ID
              </p>
              <p className="text-sm text-foreground">{initialRequest.reviewerId}</p>
            </div>
          )}
        </div>

        {/* Reviewer Comment */}
        {initialRequest.reviewerComment && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                REVIEWER COMMENT
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {initialRequest.reviewerComment}
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {initialRequest.status === "PENDING" && (
          <>
            <Separator />
            <div className="flex gap-3">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setSelectedAction("approve")}
              >
                Approve Request
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => setSelectedAction("deny")}
              >
                Deny Request
              </Button>
            </div>
          </>
        )}
      </Card>

      {selectedAction && (
        <ApproveDenyDialog
          request={initialRequest}
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onSuccess={() => {
            setSelectedAction(null);
            mutate();
          }}
        />
      )}
    </>
  );
}
