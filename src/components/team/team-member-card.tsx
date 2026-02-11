"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { OktaUser } from "@/types/okta";
import { ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date";

interface TeamMemberCardProps {
  user: OktaUser;
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
}

function getStatusColor(status: OktaUser["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PROVISIONED":
      return "bg-yellow-100 text-yellow-800";
    case "SUSPENDED":
      return "bg-red-100 text-red-800";
    case "DEPROVISIONED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function TeamMemberCard({ user }: TeamMemberCardProps) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(user.profile.firstName, user.profile.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link href={`/team/${user.id}`} className="font-semibold hover:text-primary hover:underline">
                {user.profile.firstName} {user.profile.lastName}
              </Link>
              {user.profile.onPTO && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  PTO
                </Badge>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(user.status)}>
            {user.status}
          </Badge>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">{user.profile.email}</p>
          {user.profile.title && (
            <p className="text-muted-foreground">{user.profile.title}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Last login: {formatRelativeTime(user.lastLogin)}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/team/${user.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            Mark PTO
          </Button>
        </div>
      </div>
    </Card>
  );
}
