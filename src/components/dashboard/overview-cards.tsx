"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ClipboardCheck, Inbox, CalendarDays } from "lucide-react";

interface OverviewCardsProps {
  directReportsCount: number;
  pendingReviewsCount: number;
  accessRequestsCount: number;
  onPTOCount: number;
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
}

function StatCard({
  icon,
  stat,
  label,
  sublabel,
  isLoading,
  iconBg,
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

  return (
    <Card className="group relative overflow-hidden border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
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
    </Card>
  );
}

export function OverviewCards({
  directReportsCount,
  pendingReviewsCount,
  accessRequestsCount,
  onPTOCount,
  isLoading,
}: OverviewCardsProps) {
  const cards = [
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      stat: directReportsCount,
      label: "Direct Reports",
      sublabel: "people",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: <ClipboardCheck className="h-5 w-5 text-sky-600" />,
      stat: pendingReviewsCount,
      label: "Pending Reviews",
      sublabel: "active",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      icon: <Inbox className="h-5 w-5 text-amber-600" />,
      stat: accessRequestsCount,
      label: "Access Requests",
      sublabel: "pending",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: <CalendarDays className="h-5 w-5 text-emerald-600" />,
      stat: onPTOCount,
      label: "On PTO",
      sublabel: "away",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        />
      ))}
    </div>
  );
}
