"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { OktaUser } from "@/types/okta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";

interface CreateReviewFormProps {
  managerName?: string;
}

export function CreateReviewForm({ managerName }: CreateReviewFormProps) {
  const router = useRouter();
  const defaultName = managerName ? `${managerName} Direct report campaign` : "";
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);

  // Fetch direct reports (the /api/okta/users endpoint returns only this manager's reports)
  const { data: usersResponse, error: usersError, isLoading: isLoadingUsers, mutate: mutateUsers } = useSWR<{ data: OktaUser[]; nextCursor?: string }>(
    "/api/okta/users",
    fetcher,
    { revalidateOnFocus: false }
  );

  const userList: OktaUser[] = usersResponse?.data ?? (Array.isArray(usersResponse) ? usersResponse : []);

  // Pre-select all direct reports once they load
  useEffect(() => {
    if (userList.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setSelectedUsers(new Set(userList.map((u) => u.id)));
    }
  }, [userList]);

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedUsers(new Set(userList.map((u) => u.id)));
  };

  const handleDeselectAll = () => {
    setSelectedUsers(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Review name is required");
      return;
    }

    if (selectedUsers.size === 0) {
      toast.error("Select at least one team member");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/okta/governance/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          userIds: Array.from(selectedUsers),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create review");
      }

      toast.success("Manager access review created");
      router.push("/reviews");
    } catch (error) {
      console.error("Error creating review:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create review"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Review Type Badge */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Manager Access Review</h3>
              <p className="text-sm text-muted-foreground">
                Review access for your direct reports
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Review Name */}
          <div>
            <Label htmlFor="name" className="text-base font-semibold">
              Review Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Q1 2025 Manager Access Review"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Optional: Add context for this review"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="mt-2 min-h-[100px]"
            />
          </div>
        </div>
      </Card>

      {/* Team Members */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">
                Direct Reports
                {selectedUsers.size > 0 && (
                  <Badge variant="secondary" className="ml-2 font-mono">
                    {selectedUsers.size}/{userList.length}
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                All your direct reports are included by default. Uncheck to exclude.
              </p>
            </div>
            {userList.length > 0 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading || selectedUsers.size === userList.length}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={isLoading || selectedUsers.size === 0}
                >
                  Deselect all
                </Button>
              </div>
            )}
          </div>

          {usersError ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                {usersError.message || "Something went wrong"}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => mutateUsers()}>
                Try again
              </Button>
            </div>
          ) : isLoadingUsers ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : userList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No direct reports found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userList.map((user: OktaUser) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={user.id}
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={user.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <div>
                      <p>{user.profile.firstName} {user.profile.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.profile.email}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || !name.trim() || selectedUsers.size === 0}
        >
          {isLoading ? "Creating..." : "Start Manager Review"}
        </Button>
      </div>
    </form>
  );
}
