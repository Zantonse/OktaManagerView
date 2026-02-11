"use client";

import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { OktaUser } from "@/types/okta";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Search, X } from "lucide-react";

interface DelegateManagerProps {
  onSuccess?: () => void;
}

export function DelegateManager({ onSuccess }: DelegateManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [delegateUserId, setDelegateUserId] = useState("");
  const [delegateUser, setDelegateUser] = useState<OktaUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OktaUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scopes, setScopes] = useState<string[]>(["reviews"]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  );

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/okta/users?search=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectDelegate = (user: OktaUser) => {
    setDelegateUser(user);
    setDelegateUserId(user.id);
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
  };

  const handleScopeChange = (scope: string, checked: boolean) => {
    setScopes((prev) =>
      checked
        ? [...prev, scope]
        : prev.filter((s) => s !== scope)
    );
  };

  const handleSubmit = async () => {
    if (!delegateUser || scopes.length === 0 || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (startDate > endDate) {
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/okta/governance/delegates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delegateId: delegateUser.id,
          scope: scopes,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign delegate");
      }

      toast.success(`Delegate assigned to ${delegateUser.profile.firstName} ${delegateUser.profile.lastName}`);

      // Reset form
      setDelegateUser(null);
      setDelegateUserId("");
      setSearchQuery("");
      setScopes(["reviews"]);
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

      onSuccess?.();
    } catch (error) {
      console.error("Error assigning delegate:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign delegate"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Assign New Delegate</h3>

      <div className="space-y-4">
        {/* Delegate User Search */}
        <div className="space-y-2">
          <Label htmlFor="delegate-search">Delegate User</Label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="delegate-search"
                placeholder="Search for a user..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="pl-10"
              />
              {delegateUser && (
                <button
                  onClick={() => {
                    setDelegateUser(null);
                    setDelegateUserId("");
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-3"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10">
                <div className="max-h-[200px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectDelegate(user)}
                      className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {user.profile.firstName} {user.profile.lastName}
                        </div>
                        <div className="text-xs text-popover-foreground/60">
                          {user.profile.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {delegateUser && (
              <div className="mt-2 p-2 bg-muted rounded flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">
                    {delegateUser.profile.firstName}{" "}
                    {delegateUser.profile.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {delegateUser.profile.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scopes */}
        <div className="space-y-2">
          <Label>Delegation Scope</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scope-reviews"
                checked={scopes.includes("reviews")}
                onCheckedChange={(checked) =>
                  handleScopeChange("reviews", checked as boolean)
                }
              />
              <Label htmlFor="scope-reviews" className="font-normal">
                Reviews
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scope-requests"
                checked={scopes.includes("requests")}
                onCheckedChange={(checked) =>
                  handleScopeChange("requests", checked as boolean)
                }
              />
              <Label htmlFor="scope-requests" className="font-normal">
                Requests
              </Label>
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                {startDate ? formatDate(startDate.toISOString()) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                {endDate ? formatDate(endDate.toISOString()) : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !delegateUser || scopes.length === 0}
          className="w-full"
        >
          {isLoading ? "Assigning..." : "Assign Delegate"}
        </Button>
      </div>
    </Card>
  );
}
