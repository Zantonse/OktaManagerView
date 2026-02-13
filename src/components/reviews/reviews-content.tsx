"use client";

import { ExternalLink, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOktaReviewerDashboardUrl(): string {
  const domain = process.env.NEXT_PUBLIC_OKTA_DOMAIN || "";
  return `${domain}/enduser/governance/reviewers/dashboard`;
}

export function ReviewsContent() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Manage Access Reviews in Okta
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            View and complete your assigned certification reviews directly in
            the Okta Governance dashboard.
          </p>
        </div>
        <a
          href={getOktaReviewerDashboardUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg">
            Open Review Dashboard
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </Card>
  );
}
