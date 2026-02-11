"use client";

import { useState } from "react";
import { OktaCertificationTask } from "@/types/okta";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RevokeDialog } from "./revoke-dialog";

interface EntitlementRowProps {
  task: OktaCertificationTask;
}

export function EntitlementRow({ task }: EntitlementRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const handleAttest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/okta/governance/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: task.campaignId,
          certificationId: task.id,
          decision: "APPROVE",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to attest access");
      }

      toast.success("Access attested");
      // Trigger a revalidation by reloading the page or updating parent state
      window.location.reload();
    } catch (error) {
      console.error("Error attesting access:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to attest access"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSubmit = async (justification: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/okta/governance/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: task.campaignId,
          certificationId: task.id,
          decision: "REVOKE",
          justification,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke access");
      }

      toast.success("Access revoked");
      setShowRevokeDialog(false);
      // Trigger a revalidation
      window.location.reload();
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke access"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (task.status === "PENDING") {
    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleAttest}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "..." : "Attest"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowRevokeDialog(true)}
          disabled={isLoading}
        >
          Revoke
        </Button>
        {showRevokeDialog && (
          <RevokeDialog
            onConfirm={handleRevokeSubmit}
            onCancel={() => setShowRevokeDialog(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }

  if (task.status === "COMPLETED" && task.decision) {
    return (
      <div className="text-sm text-muted-foreground">
        {task.decision === "APPROVE" ? "✓ Approved" : "✕ Revoked"}
      </div>
    );
  }

  return <div className="text-sm text-muted-foreground">—</div>;
}
