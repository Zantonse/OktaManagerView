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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RevokeDialogProps {
  onConfirm: (justification: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function RevokeDialog({ onConfirm, onCancel, isLoading }: RevokeDialogProps) {
  const [justification, setJustification] = useState("");

  const handleSubmit = async () => {
    if (!justification.trim()) {
      toast.error("Please provide a justification for revoking access");
      return;
    }

    await onConfirm(justification.trim());
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Revoke Access</DialogTitle>
          <DialogDescription>
            Please provide a justification for revoking this access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="justification">
              Justification <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justification"
              placeholder="Explain why you are revoking this access"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !justification.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Processing..." : "Revoke Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
