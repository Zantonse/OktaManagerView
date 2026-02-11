"use client";

import { useState } from "react";
import { OktaDelegateAppointment } from "@/types/okta";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EndPTODialogProps {
  userName: string;
  delegate: OktaDelegateAppointment;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EndPTODialog({
  userName,
  delegate,
  userId,
  open,
  onOpenChange,
  onSuccess,
}: EndPTODialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const delegateName = delegate.delegateName && delegate.delegateName !== "- -"
    ? delegate.delegateName
    : delegate.delegateEmail || delegate.delegate.externalId;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/okta/users/${userId}/delegates/${delegate.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to end PTO");
      }

      toast.success(`PTO ended for ${userName}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error ending PTO:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to end PTO"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>End PTO</DialogTitle>
          <DialogDescription>
            This will cancel the delegate assignment for {userName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-900">Current Delegate</p>
            <p className="text-sm text-amber-700 mt-1">{delegateName}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to end PTO and remove this delegate assignment?
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Ending PTO..." : "End PTO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
