"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  isLoading: boolean;
  accentColor: string;
}

function StatCard({
  icon,
  stat,
  label,
  isLoading,
  accentColor,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
      <div className={`h-1 ${accentColor}`} />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stat}</p>
          </div>
          <div className={`p-2 rounded-lg ${accentColor} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardContent>
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
      icon: <Users className="h-6 w-6 text-blue-600" />,
      stat: directReportsCount,
      label: "Direct Reports",
      accentColor: "bg-blue-600",
    },
    {
      icon: <ClipboardCheck className="h-6 w-6 text-purple-600" />,
      stat: pendingReviewsCount,
      label: "Pending Reviews",
      accentColor: "bg-purple-600",
    },
    {
      icon: <Inbox className="h-6 w-6 text-amber-600" />,
      stat: accessRequestsCount,
      label: "Access Requests",
      accentColor: "bg-amber-600",
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-green-600" />,
      stat: onPTOCount,
      label: "On PTO",
      accentColor: "bg-green-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard
          key={i}
          icon={card.icon}
          stat={card.stat}
          label={card.label}
          isLoading={isLoading}
          accentColor={card.accentColor}
        />
      ))}
    </div>
  );
}
