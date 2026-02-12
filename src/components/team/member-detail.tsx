"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OktaUser, OktaGroup, OktaDelegateAppointment } from "@/types/okta";
import { formatDate } from "@/lib/utils/date";
import { AccessSummary } from "./access-summary";
import { AlertTriangle, ShieldAlert, Users, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { EndPTODialog } from "./end-pto-dialog";
import { LifecycleDialog } from "./lifecycle-dialog";

interface AppWithRole {
  id: string;
  label: string;
  logoUrl: string;
  appName: string;
  role: string;
}

interface MemberDetailProps {
  userId: string;
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

export function MemberDetail({ userId }: MemberDetailProps) {
  const [endPTODialogOpen, setEndPTODialogOpen] = useState(false);
  const [selectedDelegateForEnd, setSelectedDelegateForEnd] = useState<OktaDelegateAppointment | null>(null);
  const [lifecycleDialogOpen, setLifecycleDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [campaignSubmitting, setCampaignSubmitting] = useState(false);

  const { data: user, error: userError, isLoading: userLoading, mutate: mutateUser } = useSWR<OktaUser>(
    `/api/okta/users/${userId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: apps, error: appsError, isLoading: appsLoading, mutate: mutateApps } = useSWR<AppWithRole[]>(
    userId ? `/api/okta/users/${userId}/apps` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: groups, error: groupsError, isLoading: groupsLoading, mutate: mutateGroups } = useSWR<OktaGroup[]>(
    userId ? `/api/okta/users/${userId}/groups` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: delegatesData, error: delegatesError, isLoading: delegatesLoading, mutate: mutateDelegates } = useSWR<{
    appointments: OktaDelegateAppointment[];
    warning?: string;
  }>(
    userId ? `/api/okta/users/${userId}/delegates` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (userError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {userError.message || "Something went wrong"}
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => mutateUser()}>
          Try again
        </Button>
      </div>
    );
  }

  if (appsError || groupsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {appsError?.message || groupsError?.message || "Something went wrong"}
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => { mutateApps(); mutateGroups(); }}>
          Try again
        </Button>
      </div>
    );
  }

  if (delegatesError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          {delegatesError.message || "Something went wrong"}
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => mutateDelegates()}>
          Try again
        </Button>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">Member not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-lg">
              {getInitials(user.profile.firstName, user.profile.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {user.profile.firstName} {user.profile.lastName}
                </h2>
                {user.profile.onPTO && (
                  <Badge variant="secondary" className="mt-1">
                    PTO
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.profile.email}</p>
              </div>
              {user.profile.title && (
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{user.profile.title}</p>
                </div>
              )}
              {user.profile.department && (
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{user.profile.department}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(user.status)}>
                {user.status}
              </Badge>
              {user.status === "ACTIVE" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setLifecycleDialogOpen(true)}
                >
                  Suspend
                </Button>
              )}
              {user.status === "SUSPENDED" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLifecycleDialogOpen(true)}
                >
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apps">Apps & Entitlements</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="delegates">Delegates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{user.profile.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium">{user.profile.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Login</p>
                <p className="font-medium">{user.profile.login}</p>
              </div>
              {user.profile.mobilePhone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.profile.mobilePhone}</p>
                </div>
              )}
              {user.profile.department && (
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{user.profile.department}</p>
                </div>
              )}
              {user.profile.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{user.profile.title}</p>
                </div>
              )}
              {user.profile.manager && (
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">{user.profile.manager}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="font-medium">
                  {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="font-medium">{formatDate(user.created)}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Apps & Entitlements Tab */}
        <TabsContent value="apps" className="space-y-4">
          <div className="p-4 border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50 rounded-lg flex flex-col sm:flex-row gap-3 sm:items-center">
            <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                Access Removal
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                Access cannot be removed directly. To review and revoke this
                user&apos;s access, start an access certification campaign.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start sm:self-center shrink-0"
              onClick={() => {
                setCampaignName(
                  `Access review - ${user.profile.firstName} ${user.profile.lastName}`
                );
                setCampaignDescription("");
                setCampaignDialogOpen(true);
              }}
            >
              Start Campaign
            </Button>
          </div>
          <Card className="p-6">
            <AccessSummary
              apps={apps || []}
              isLoading={appsLoading}
            />
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <Card className="p-6">
            {groupsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !groups || groups.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No groups assigned to this user.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{group.profile.name}</p>
                      {group.profile.description && (
                        <p className="text-sm text-muted-foreground">
                          {group.profile.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">{group.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Delegates Tab */}
        <TabsContent value="delegates">
          <Card className="p-6">
            {delegatesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : delegatesData?.warning ? (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    API Not Available
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {delegatesData.warning}
                  </p>
                </div>
              </div>
            ) : !delegatesData?.appointments ||
              delegatesData.appointments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No delegate appointments for this user.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {delegatesData.appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {appointment.delegateName ||
                          appointment.delegate.externalId}
                      </p>
                      {appointment.delegateEmail && (
                        <p className="text-xs text-muted-foreground truncate">
                          {appointment.delegateEmail}
                        </p>
                      )}
                      {appointment.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {appointment.note}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {(appointment.startTime || appointment.endTime) && (
                          <span>
                            {appointment.startTime
                              ? formatDate(appointment.startTime)
                              : "No start"}{" "}
                            &mdash;{" "}
                            {appointment.endTime
                              ? formatDate(appointment.endTime)
                              : "No end"}
                          </span>
                        )}
                        <span>Created {formatDate(appointment.created)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <Badge variant="outline">
                        {appointment.delegate.type === "OKTA_USER"
                          ? "User"
                          : appointment.delegate.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedDelegateForEnd(appointment);
                          setEndPTODialogOpen(true);
                        }}
                        title="End PTO"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {user && selectedDelegateForEnd && (
        <EndPTODialog
          userName={`${user.profile.firstName} ${user.profile.lastName}`}
          delegate={selectedDelegateForEnd}
          userId={user.id}
          open={endPTODialogOpen}
          onOpenChange={setEndPTODialogOpen}
          onSuccess={() => {
            mutateDelegates();
          }}
        />
      )}

      {user && (user.status === "ACTIVE" || user.status === "SUSPENDED") && (
        <LifecycleDialog
          userId={user.id}
          userName={`${user.profile.firstName} ${user.profile.lastName}`}
          action={user.status === "ACTIVE" ? "suspend" : "unsuspend"}
          open={lifecycleDialogOpen}
          onOpenChange={setLifecycleDialogOpen}
          onSuccess={() => {
            mutateUser();
          }}
        />
      )}

      {user && (
        <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start Access Certification</DialogTitle>
              <DialogDescription>
                Create a manager-based certification campaign to review access
                for {user.profile.firstName} {user.profile.lastName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-description">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="campaign-description"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  placeholder="Add a description for this campaign"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCampaignDialogOpen(false)}
                disabled={campaignSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!campaignName.trim()) {
                    toast.error("Campaign name is required");
                    return;
                  }
                  setCampaignSubmitting(true);
                  try {
                    const res = await fetch(
                      "/api/okta/governance/campaigns",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: campaignName.trim(),
                          description:
                            campaignDescription.trim() || undefined,
                          userIds: [userId],
                        }),
                      }
                    );
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(
                        data.error || "Failed to create campaign"
                      );
                    }
                    toast.success(
                      `Campaign started for ${user.profile.firstName} ${user.profile.lastName}`
                    );
                    setCampaignDialogOpen(false);
                  } catch (err) {
                    toast.error((err as Error).message);
                  } finally {
                    setCampaignSubmitting(false);
                  }
                }}
                disabled={campaignSubmitting || !campaignName.trim()}
              >
                {campaignSubmitting ? "Starting..." : "Start Campaign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
