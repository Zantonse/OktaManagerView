"use client";

import { useState } from "react";
import { OktaAccessRequest } from "@/types/okta";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ApproveDenyDialogProps {
  request: OktaAccessRequest;
  action: "approve" | "deny";
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveDenyDialog({
  request,
  action,
  onClose,
  onSuccess,
}: ApproveDenyDialogProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const title = action === "approve" ? "Approve Request" : "Deny Request";
  const isApprove = action === "approve";
  const commentRequired = !isApprove;

  const handleSubmit = async () => {
    if (commentRequired && !comment.trim()) {
      toast.error("Please add a comment when denying a request");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/okta/governance/requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isApprove ? "APPROVED" : "DENIED",
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update request");
      }

      toast.success(isApprove ? "Request approved" : "Request denied");
      onSuccess();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {request.requesterName} requested access to {request.resourceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Justification Display */}
          {request.justification && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Request Justification:
              </p>
              <p className="text-sm text-foreground">{request.justification}</p>
            </div>
          )}

          {/* Comment Field */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Add a comment {commentRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isApprove
                  ? "Optional: Add any notes about this approval"
                  : "Required: Explain why you are denying this request"
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (commentRequired && !comment.trim())}
            className={isApprove ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLoading ? "Processing..." : isApprove ? "Approve" : "Deny"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
