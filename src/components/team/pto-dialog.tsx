"use client";

import { useState } from "react";
import { OktaUser } from "@/types/okta";
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
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

interface PTODialogProps {
  user: OktaUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PTODialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: PTODialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    user.profile.ptoStartDate
      ? new Date(user.profile.ptoStartDate)
      : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    user.profile.ptoEndDate
      ? new Date(user.profile.ptoEndDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const isMarkingPTO = !user.profile.onPTO;
  const title = isMarkingPTO ? "Mark PTO" : "End PTO";
  const fullName = `${user.profile.firstName} ${user.profile.lastName}`;

  const handleSubmit = async () => {
    // Validate dates for marking PTO
    if (isMarkingPTO && (!startDate || !endDate)) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (isMarkingPTO && startDate && endDate && startDate > endDate) {
      toast.error("End date must be after start date");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/okta/users/${user.id}/pto`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onPTO: isMarkingPTO,
          ...(isMarkingPTO && {
            ptoStartDate: startDate?.toISOString().split("T")[0],
            ptoEndDate: endDate?.toISOString().split("T")[0],
          }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update PTO status");
      }

      toast.success(`PTO updated for ${fullName}`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating PTO:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update PTO status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isMarkingPTO
              ? `Mark ${fullName} as on PTO. This is a visual flag only — the user's access will not be changed.`
              : `Remove PTO flag from ${fullName}. Their status will return to normal.`}
          </DialogDescription>
        </DialogHeader>

        {isMarkingPTO && (
          <div className="space-y-4 py-4">
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
                    onSelect={setStartDate}
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
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (isMarkingPTO && (!startDate || !endDate))}
          >
            {isLoading ? "Processing..." : title}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
