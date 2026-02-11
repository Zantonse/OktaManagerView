"use client";

import { useState } from "react";
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

interface LifecycleDialogProps {
  userId: string;
  userName: string;
  action: "suspend" | "unsuspend";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LifecycleDialog({
  userId,
  userName,
  action,
  open,
  onOpenChange,
  onSuccess,
}: LifecycleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuspend = action === "suspend";
  const title = isSuspend ? "Suspend User" : "Reactivate User";
  const description = isSuspend
    ? `This will immediately block ${userName}'s access to all applications. They will not be able to sign in until reactivated.`
    : `This will restore ${userName}'s access to all previously assigned applications.`;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/okta/users/${userId}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update user status");
      }

      toast.success(
        isSuspend
          ? `${userName} has been suspended`
          : `${userName} has been reactivated`
      );
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant={isSuspend ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : isSuspend
                ? "Suspend"
                : "Reactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
