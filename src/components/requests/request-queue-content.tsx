"use client";

import { ExternalLink, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOktaRequestsDashboardUrl(): string {
  const domain = process.env.NEXT_PUBLIC_OKTA_DOMAIN || "";
  try {
    const url = new URL(domain);
    const parts = url.hostname.split(".");
    if (parts.length >= 2 && !parts[1].startsWith("at")) {
      parts.splice(1, 0, "at");
    }
    url.hostname = parts.join(".");
    return `${url.origin}/next/requests/inbox/open`;
  } catch {
    return `${domain}/next/requests/inbox/open`;
  }
}

export function RequestQueueContent() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Inbox className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Manage Access Requests in Okta
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            View and action your pending access requests directly in the Okta
            requests dashboard.
          </p>
        </div>
        <a
          href={getOktaRequestsDashboardUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg">
            Open Requests Dashboard
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </Card>
  );
}
