"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ClipboardCheck } from "lucide-react";

interface OverviewCardsProps {
  directReportsCount: number;
  pendingReviewsCount: number;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  stat: number;
  label: string;
  sublabel: string;
  isLoading: boolean;
  iconBg: string;
  iconColor: string;
  href?: string;
}

function StatCard({
  icon,
  stat,
  label,
  sublabel,
  isLoading,
  iconBg,
  href,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-0 bg-card shadow-sm">
        <div className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const content = (
    <div className="p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">{stat}</p>
            <span className="text-[11px] font-medium text-muted-foreground/70">{sublabel}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className="group relative overflow-hidden border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
      {content}
    </Card>
  );
}

export function OverviewCards({
  directReportsCount,
  pendingReviewsCount,
  isLoading,
}: OverviewCardsProps) {
  const cards = [
    {
      icon: <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      stat: directReportsCount,
      label: "Direct Reports",
      sublabel: "people",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
      iconColor: "text-indigo-600",
    },
    {
      icon: <ClipboardCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
      stat: pendingReviewsCount,
      label: "Pending Reviews",
      sublabel: "active",
      iconBg: "bg-violet-50 dark:bg-violet-950/40",
      iconColor: "text-violet-600",
      href: "/reviews",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card, i) => (
        <StatCard
          key={i}
          icon={card.icon}
          stat={card.stat}
          label={card.label}
          sublabel={card.sublabel}
          isLoading={isLoading}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
          href={card.href}
        />
      ))}
    </div>
  );
}
