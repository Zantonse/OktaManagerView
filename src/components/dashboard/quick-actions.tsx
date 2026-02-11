"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Inbox, Shield } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      label: "View Team",
      href: "/team",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Start Review",
      href: "/reviews/create",
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
      label: "View Requests",
      href: "/requests",
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      label: "Manage Delegates",
      href: "/settings",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" size="sm" className="gap-2">
                {action.icon}
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
