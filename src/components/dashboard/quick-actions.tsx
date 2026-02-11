"use client";

import { ClipboardCheck, Inbox, Shield } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      label: "Start Review",
      href: "/reviews/create",
      icon: <ClipboardCheck className="h-3.5 w-3.5" />,
    },
    {
      label: "Requests",
      href: "/requests",
      icon: <Inbox className="h-3.5 w-3.5" />,
    },
    {
      label: "Delegates",
      href: "/settings",
      icon: <Shield className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground hover:shadow-md"
        >
          {action.icon}
          {action.label}
        </Link>
      ))}
    </div>
  );
}
