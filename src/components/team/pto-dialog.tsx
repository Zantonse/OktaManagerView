"use client";

import { useState, useCallback } from "react";
import { OktaUser, OktaDelegateAppointment } from "@/types/okta";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface PTODialogProps {
  user: OktaUser;
  existingDelegates?: OktaDelegateAppointment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PTODialog({
  user,
  existingDelegates,
  open,
  onOpenChange,
  onSuccess,
}: PTODialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingDelegate = existingDelegates?.[0];
  const isUpdate = !!existingDelegate;

  const [startDate, setStartDate] = useState<Date | undefined>(
    existingDelegate?.startTime
      ? new Date(existingDelegate.startTime)
      : user.profile.ptoStartDate
        ? new Date(user.profile.ptoStartDate)
        : tomorrow
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    existingDelegate?.endTime
      ? new Date(existingDelegate.endTime)
      : user.profile.ptoEndDate
        ? new Date(user.profile.ptoEndDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Delegate search state — pre-populate from existing delegate
  const [delegateUser, setDelegateUser] = useState<OktaUser | null>(
    existingDelegate
      ? ({
          id: existingDelegate.delegate.externalId,
          profile: {
            firstName: existingDelegate.delegateName?.split(" ")[0] || "",
            lastName: existingDelegate.delegateName?.split(" ").slice(1).join(" ") || "",
            email: existingDelegate.delegateEmail || "",
            login: existingDelegate.delegateEmail || "",
          },
          status: "ACTIVE",
          created: "",
          lastUpdated: "",
        } as OktaUser)
      : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OktaUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fullName = `${user.profile.firstName} ${user.profile.lastName}`;

  const defaultNote = existingDelegate?.note
    || `${fullName} is on PTO, and you have been appointed to cover for this duration. Thank you!`;
  const [note, setNote] = useState(defaultNote);

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
        `/api/okta/users/search?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const users: OktaUser[] = await response.json();
        // Filter out the PTO user themselves
        setSearchResults(users.filter((u) => u.id !== user.id));
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  }, [user.id]);

  const handleSelectDelegate = (selected: OktaUser) => {
    setDelegateUser(selected);
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
  };

  const handleClearDelegate = () => {
    setDelegateUser(null);
    setSearchQuery("");
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (startDate > endDate) {
      toast.error("End date must be after start date");
      return;
    }
    if (!delegateUser) {
      toast.error("Please select a delegate");
      return;
    }
    if (!note.trim()) {
      toast.error("Please provide a note for the delegate");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/okta/users/${user.id}/pto`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ptoStartDate: startDate.toISOString().split("T")[0],
          ptoEndDate: endDate.toISOString().split("T")[0],
          delegateId: delegateUser.id,
          note: note.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign delegate");
      }

      toast.success(`Delegate assigned for ${fullName}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning delegate:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to assign delegate"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading || !startDate || !endDate || !delegateUser || !note.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Update Delegate" : "Assign Delegate"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? `Update the delegate assignment for ${fullName}.`
              : `Assign a delegate to cover for ${fullName} during their PTO absence.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            {/* Delegate to */}
            <div className="space-y-2">
              <Label>Delegate to</Label>
              <div className="relative">
                {!delegateUser ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for a delegate..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() =>
                          searchResults.length > 0 && setShowResults(true)
                        }
                        className="pl-10"
                      />
                    </div>

                    {showResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10">
                        <div className="max-h-[200px] overflow-y-auto">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleSelectDelegate(result)}
                              className="w-full text-left px-3 py-2 hover:bg-muted"
                            >
                              <div className="font-medium text-sm">
                                {result.profile.firstName}{" "}
                                {result.profile.lastName}
                              </div>
                              <div className="text-xs text-popover-foreground/60">
                                {result.profile.email}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {showResults && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 p-3 text-sm text-popover-foreground/60">
                        No users found
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="text-sm">
                      <div className="font-medium">
                        {delegateUser.profile.firstName}{" "}
                        {delegateUser.profile.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {delegateUser.profile.email}
                      </div>
                    </div>
                    <button onClick={handleClearDelegate}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate
                      ? formatDate(startDate.toISOString())
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={{ before: tomorrow }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate
                      ? formatDate(endDate.toISOString())
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {isLoading ? "Processing..." : isUpdate ? "Update Delegate" : "Assign Delegate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
