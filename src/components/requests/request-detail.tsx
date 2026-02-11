"use client";

import { OktaAccessRequest } from "@/types/okta";
import { formatDate, formatRelativeTime } from "@/lib/utils/date";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RequestDetailProps {
  request: OktaAccessRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: () => void;
  onDeny?: () => void;
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

export function RequestDetail({
  request,
  open,
  onOpenChange,
  onApprove,
  onDeny,
}: RequestDetailProps) {
  if (!request) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Request Details</SheetTitle>
          <SheetDescription>
            <Badge className={`${getStatusColor(request.status)} mt-2`}>
              {request.status}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Requester */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              REQUESTER
            </p>
            <p className="text-sm font-medium text-foreground">
              {request.requesterName || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">{request.requesterId}</p>
          </div>

          <Separator />

          {/* Resource */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              RESOURCE
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {request.resourceName || "N/A"}
              </p>
              <Badge className={getResourceTypeColor(request.resourceType)}>
                {request.resourceType}
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
              {request.justification || "No justification provided"}
            </p>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                SUBMITTED
              </p>
              <p className="text-sm text-foreground">
                {formatDate(request.created)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(request.created)}
              </p>
            </div>
            {request.decisionDate && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  DECIDED
                </p>
                <p className="text-sm text-foreground">
                  {formatDate(request.decisionDate)}
                </p>
              </div>
            )}
          </div>

          {/* Reviewer Comment */}
          {request.reviewerComment && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  COMMENT
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {request.reviewerComment}
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          {request.status === "PENDING" && (onApprove || onDeny) && (
            <>
              <Separator />
              <div className="flex gap-2">
                {onApprove && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={onApprove}
                  >
                    Approve
                  </Button>
                )}
                {onDeny && (
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={onDeny}
                  >
                    Deny
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
