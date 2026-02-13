"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface AppWithRole {
  id: string;
  label: string;
  logoUrl: string;
  appName: string;
  role: string;
}

interface AccessSummaryProps {
  apps: AppWithRole[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 12;

export function AccessSummary({ apps, isLoading }: AccessSummaryProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const filteredApps = useMemo(() => {
    if (!debouncedSearch) return apps;
    return apps.filter(
      (app) =>
        app.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        app.appName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        app.role.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [apps, debouncedSearch]);

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedApps = filteredApps.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const hasMore = page < totalPages;
  const hasPrev = page > 1;

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Input placeholder="Search apps..." value="" disabled />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No apps assigned to this user.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by app name or role..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {filteredApps.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No apps matching your search.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedApps.map((app) => (
              <Card
                key={app.id}
                className="flex flex-col p-4 hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded bg-muted">
                  {app.logoUrl ? (
                    <img
                      src={app.logoUrl}
                      alt={app.label}
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {app.label.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{app.label}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {app.role}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
