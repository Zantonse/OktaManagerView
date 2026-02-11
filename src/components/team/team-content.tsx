"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TeamTable } from "./team-table";
import { TeamMemberCard } from "./team-member-card";
import { OktaUser, OktaDelegateAppointment } from "@/types/okta";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

interface DelegatesBulkResponse {
  appointments: OktaDelegateAppointment[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TeamContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);

  // Build query params
  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (status !== "all") queryParams.set("status", status);
  queryParams.set("limit", "200");

  const { data, error, isLoading, mutate } = useSWR<OktaUser[]>(
    `/api/okta/users?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch delegate appointments for all loaded users
  const userIds = useMemo(() => data?.map((u) => u.id) ?? [], [data]);
  const delegatesKey = userIds.length > 0
    ? `/api/okta/governance/delegates/bulk?userIds=${userIds.join(",")}`
    : null;
  const { data: delegatesData, mutate: mutateDelegates } = useSWR<DelegatesBulkResponse>(
    delegatesKey,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Build a map: userId -> delegate appointments
  const delegatesByUser = useMemo(() => {
    const map = new Map<string, OktaDelegateAppointment[]>();
    if (delegatesData?.appointments) {
      for (const appt of delegatesData.appointments) {
        const uid = appt.delegator.externalId;
        if (!map.has(uid)) map.set(uid, []);
        map.get(uid)!.push(appt);
      }
    }
    return map;
  }, [delegatesData]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && data) {
      setSelectedUsers(new Set(data.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  }, [data]);

  const handleSelectUser = useCallback((userId: string, checked: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  const selectedUserIds = Array.from(selectedUsers).join(",");
  const showFloatingBar = selectedUsers.size > 0;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Error loading team members. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PROVISIONED">Provisioned</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="DEPROVISIONED">Deprovisioned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!data || data.length === 0) && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No team members found matching your search criteria.
          </p>
        </div>
      )}

      {/* Desktop View - Table */}
      {!isLoading && data && data.length > 0 && (
        <div className="hidden md:block">
          <TeamTable
            users={data}
            selectedUsers={selectedUsers}
            onSelectAll={handleSelectAll}
            onSelectUser={handleSelectUser}
            delegatesByUser={delegatesByUser}
            onPTOSuccess={() => { mutate(); mutateDelegates(); }}
          />
        </div>
      )}

      {/* Mobile View - Cards */}
      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3 md:hidden">
          {data.map((user) => (
            <TeamMemberCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Floating Action Bar */}
      {showFloatingBar && (
        <div className="fixed bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-lg md:left-auto md:right-6">
          <p className="text-sm font-medium">
            {selectedUsers.size} selected
          </p>
          <Link
            href={`/reviews/create?users=${selectedUserIds}`}
          >
            <Button size="sm">
              Start Review for Selected ({selectedUsers.size})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
