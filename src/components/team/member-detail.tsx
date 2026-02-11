"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OktaUser, OktaGroup, OktaDelegateAppointment } from "@/types/okta";
import { formatDate } from "@/lib/utils/date";
import { AccessSummary } from "./access-summary";
import { AlertTriangle, Users } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const { data: user, error: userError, isLoading: userLoading } = useSWR<OktaUser>(
    `/api/okta/users/${userId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: apps, isLoading: appsLoading } = useSWR<AppWithRole[]>(
    userId ? `/api/okta/users/${userId}/apps` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: groups, isLoading: groupsLoading } = useSWR<OktaGroup[]>(
    userId ? `/api/okta/users/${userId}/groups` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: delegatesData, isLoading: delegatesLoading } = useSWR<{
    appointments: OktaDelegateAppointment[];
    warning?: string;
  }>(
    userId ? `/api/okta/users/${userId}/delegates` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (userError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Error loading member details. Please try again.
        </p>
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
        <TabsContent value="apps">
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
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {appointment.delegate.type === "OKTA_USER"
                        ? "User"
                        : appointment.delegate.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
