"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OktaUser, OktaGroup } from "@/types/okta";
import { Check, X, Filter } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

interface AppWithRole {
  id: string;
  label: string;
  logoUrl: string;
  appName: string;
  appInstanceId: string;
  role: string;
}

interface AccessComparisonProps {
  userIdA: string;
  userIdB: string;
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
}

function getStatusColor(status: OktaUser["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "SUSPENDED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-500 border-gray-200";
  }
}

interface MergedApp {
  label: string;
  roleA: string | null;
  roleB: string | null;
  isDifferent: boolean;
}

interface MergedGroup {
  name: string;
  description?: string;
  inA: boolean;
  inB: boolean;
  isDifferent: boolean;
}

function UserCard({ user, label }: { user: OktaUser; label: string }) {
  return (
    <Card className="p-4 flex-1 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
            {getInitials(user.profile.firstName, user.profile.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Link href={`/team/${user.id}`} className="text-sm font-semibold hover:text-primary hover:underline truncate block">
            {user.profile.firstName} {user.profile.lastName}
          </Link>
          <p className="text-xs text-muted-foreground truncate">{user.profile.title || user.profile.email}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] shrink-0 ${getStatusColor(user.status)}`}>
          {user.status}
        </Badge>
      </div>
    </Card>
  );
}

export function AccessComparison({ userIdA, userIdB }: AccessComparisonProps) {
  const [showDiffsOnly, setShowDiffsOnly] = useState(false);

  const { data: userA, isLoading: loadingA } = useSWR<OktaUser>(`/api/okta/users/${userIdA}`, fetcher, { revalidateOnFocus: false });
  const { data: userB, isLoading: loadingB } = useSWR<OktaUser>(`/api/okta/users/${userIdB}`, fetcher, { revalidateOnFocus: false });
  const { data: appsA, isLoading: loadingAppsA } = useSWR<AppWithRole[]>(`/api/okta/users/${userIdA}/apps`, fetcher, { revalidateOnFocus: false });
  const { data: appsB, isLoading: loadingAppsB } = useSWR<AppWithRole[]>(`/api/okta/users/${userIdB}/apps`, fetcher, { revalidateOnFocus: false });
  const { data: groupsA, isLoading: loadingGroupsA } = useSWR<OktaGroup[]>(`/api/okta/users/${userIdA}/groups`, fetcher, { revalidateOnFocus: false });
  const { data: groupsB, isLoading: loadingGroupsB } = useSWR<OktaGroup[]>(`/api/okta/users/${userIdB}/groups`, fetcher, { revalidateOnFocus: false });

  const isLoading = loadingA || loadingB || loadingAppsA || loadingAppsB || loadingGroupsA || loadingGroupsB;

  const mergedApps = useMemo<MergedApp[]>(() => {
    const mapA = new Map<string, AppWithRole>();
    const mapB = new Map<string, AppWithRole>();
    (appsA ?? []).forEach((a) => mapA.set(a.label, a));
    (appsB ?? []).forEach((b) => mapB.set(b.label, b));

    const allLabels = new Set([...mapA.keys(), ...mapB.keys()]);
    const result: MergedApp[] = [];

    for (const label of allLabels) {
      const a = mapA.get(label);
      const b = mapB.get(label);
      const roleA = a?.role ?? null;
      const roleB = b?.role ?? null;
      result.push({
        label,
        roleA,
        roleB,
        isDifferent: roleA !== roleB,
      });
    }

    return result.sort((x, y) => {
      if (x.isDifferent !== y.isDifferent) return x.isDifferent ? -1 : 1;
      return x.label.localeCompare(y.label);
    });
  }, [appsA, appsB]);

  const mergedGroups = useMemo<MergedGroup[]>(() => {
    const mapA = new Map<string, OktaGroup>();
    const mapB = new Map<string, OktaGroup>();
    (groupsA ?? []).forEach((g) => mapA.set(g.profile.name, g));
    (groupsB ?? []).forEach((g) => mapB.set(g.profile.name, g));

    const allNames = new Set([...mapA.keys(), ...mapB.keys()]);
    const result: MergedGroup[] = [];

    for (const name of allNames) {
      const inA = mapA.has(name);
      const inB = mapB.has(name);
      const group = mapA.get(name) ?? mapB.get(name);
      result.push({
        name,
        description: group?.profile.description,
        inA,
        inB,
        isDifferent: inA !== inB,
      });
    }

    return result.sort((x, y) => {
      if (x.isDifferent !== y.isDifferent) return x.isDifferent ? -1 : 1;
      return x.name.localeCompare(y.name);
    });
  }, [groupsA, groupsB]);

  const filteredApps = showDiffsOnly ? mergedApps.filter((a) => a.isDifferent) : mergedApps;
  const filteredGroups = showDiffsOnly ? mergedGroups.filter((g) => g.isDifferent) : mergedGroups;
  const diffCount = mergedApps.filter((a) => a.isDifferent).length + mergedGroups.filter((g) => g.isDifferent).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!userA || !userB) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          One or both users could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UserCard user={userA} label="User A" />
        <UserCard user={userB} label="User B" />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {diffCount} difference{diffCount !== 1 ? "s" : ""} found
        </p>
        <Button
          variant={showDiffsOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowDiffsOnly(!showDiffsOnly)}
          className="gap-2"
        >
          <Filter className="h-3.5 w-3.5" />
          {showDiffsOnly ? "Show all" : "Differences only"}
        </Button>
      </div>

      {/* Apps Comparison */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Apps & Roles</h3>
        {filteredApps.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {showDiffsOnly ? "No differences in app access." : "No apps assigned."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">App</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    {userA.profile.firstName} {userA.profile.lastName?.[0]}.
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">
                    {userB.profile.firstName} {userB.profile.lastName?.[0]}.
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow
                    key={app.label}
                    className={app.isDifferent ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}
                  >
                    <TableCell className="text-[13px] font-medium">{app.label}</TableCell>
                    <TableCell>
                      {app.roleA ? (
                        <Badge variant="secondary" className="text-[11px]">{app.roleA}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No access</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {app.roleB ? (
                        <Badge variant="secondary" className="text-[11px]">{app.roleB}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No access</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Groups Comparison */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Groups</h3>
        {filteredGroups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {showDiffsOnly ? "No differences in group membership." : "No groups assigned."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Group</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider w-24 text-center">
                    {userA.profile.firstName} {userA.profile.lastName?.[0]}.
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider w-24 text-center">
                    {userB.profile.firstName} {userB.profile.lastName?.[0]}.
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow
                    key={group.name}
                    className={group.isDifferent ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}
                  >
                    <TableCell>
                      <p className="text-[13px] font-medium">{group.name}</p>
                      {group.description && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-sm">{group.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.inA ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {group.inB ? (
                        <Check className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
