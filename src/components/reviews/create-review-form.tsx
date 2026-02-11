"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { OktaUser } from "@/types/okta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CreateReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Get pre-selected users from URL params
  const preSelectedUsers = searchParams.get("users")?.split(",") || [];

  // Initialize with pre-selected users
  useEffect(() => {
    if (preSelectedUsers.length > 0) {
      setSelectedUsers(new Set(preSelectedUsers));
    }
  }, []);

  // Fetch users list
  const { data: users = [], isLoading: isLoadingUsers } = useSWR(
    "/api/okta/users",
    fetcher,
    { revalidateOnFocus: false }
  );

  const userList = Array.isArray(users) ? users : [];

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Review name is required");
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

      toast.success("Access review created");
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
      <Card className="p-6">
        {/* Review Name */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base font-semibold">
              Review Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Q4 2024 Compliance Review"
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
              placeholder="Optional: Add context for reviewers"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="mt-2 min-h-[100px]"
            />
          </div>
        </div>
      </Card>

      {/* Select Team Members */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">
              Select Team Members {selectedUsers.size > 0 && `(${selectedUsers.size})`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the team members whose access will be reviewed
            </p>
          </div>

          {isLoadingUsers ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : userList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users available</p>
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

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? "Creating..." : "Start Review"}
        </Button>
      </div>
    </form>
  );
}
