"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OktaUser, OktaDelegateAppointment } from "@/types/okta";
import { MoreHorizontal, ArrowUpDown, Users } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date";
import { PTODialog } from "./pto-dialog";
import { EndPTODialog } from "./end-pto-dialog";
import { LifecycleDialog } from "./lifecycle-dialog";

type SortField = "name" | "email" | "status" | "lastLogin";
type SortDirection = "asc" | "desc";

interface TeamTableProps {
  users: OktaUser[];
  selectedUsers: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  delegatesByUser?: Map<string, OktaDelegateAppointment[]>;
  onPTOSuccess?: () => void;
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
}

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getStatusStyle(status: OktaUser["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PROVISIONED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "SUSPENDED":
      return "bg-red-50 text-red-700 border-red-200";
    case "DEPROVISIONED":
      return "bg-gray-50 text-gray-500 border-gray-200";
    default:
      return "bg-gray-50 text-gray-500 border-gray-200";
  }
}

export function TeamTable({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  delegatesByUser,
  onPTOSuccess,
}: TeamTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ptoDialogOpen, setPTODialogOpen] = useState(false);
  const [selectedUserForPTO, setSelectedUserForPTO] = useState<OktaUser | null>(null);
  const [selectedUserDelegates, setSelectedUserDelegates] = useState<OktaDelegateAppointment[]>([]);
  const [endPTODialogOpen, setEndPTODialogOpen] = useState(false);
  const [selectedUserForEndPTO, setSelectedUserForEndPTO] = useState<OktaUser | null>(null);
  const [selectedDelegateForEnd, setSelectedDelegateForEnd] = useState<OktaDelegateAppointment | null>(null);
  const [lifecycleDialogOpen, setLifecycleDialogOpen] = useState(false);
  const [lifecycleUser, setLifecycleUser] = useState<OktaUser | null>(null);
  const [lifecycleAction, setLifecycleAction] = useState<"suspend" | "unsuspend">("suspend");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const statusOrder: Record<string, number> = {
    ACTIVE: 0,
    PROVISIONED: 1,
    SUSPENDED: 2,
    DEPROVISIONED: 3,
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortField) {
      case "name":
        aVal = `${a.profile.firstName} ${a.profile.lastName}`;
        bVal = `${b.profile.firstName} ${b.profile.lastName}`;
        break;
      case "email":
        aVal = a.profile.email;
        bVal = b.profile.email;
        break;
      case "status":
        aVal = statusOrder[a.status] ?? 99;
        bVal = statusOrder[b.status] ?? 99;
        break;
      case "lastLogin":
        aVal = new Date(a.lastLogin || 0).getTime();
        bVal = new Date(b.lastLogin || 0).getTime();
        break;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;
  const isSomeSelected = selectedUsers.size > 0 && selectedUsers.size < users.length;

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`ml-1.5 h-3 w-3 ${
        sortField === field ? "opacity-100" : "opacity-0 group-hover:opacity-40"
      }`}
    />
  );

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected || isSomeSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead
              className="group cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Name
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead
              className="group cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center">
                Email
                <SortIcon field="email" />
              </div>
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
            <TableHead
              className="group cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </TableHead>
            <TableHead
              className="group cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              onClick={() => handleSort("lastLogin")}
            >
              <div className="flex items-center">
                Last Login
                <SortIcon field="lastLogin" />
              </div>
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delegate</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => {
            const fullName = `${user.profile.firstName} ${user.profile.lastName}`;
            const userDelegates = delegatesByUser?.get(user.id) ?? [];
            const hasDelegate = userDelegates.length > 0;
            return (
              <TableRow key={user.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={(checked) =>
                      onSelectUser(user.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs font-semibold ${getAvatarColor(fullName)}`}>
                        {getInitials(
                          user.profile.firstName,
                          user.profile.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link href={`/team/${user.id}`} className="text-[13px] font-semibold text-foreground hover:text-primary hover:underline truncate block">
                        {fullName}
                      </Link>
                      {user.profile.onPTO && (
                        <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200">
                          PTO
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{user.profile.email}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{user.profile.title || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[11px] font-medium border ${getStatusStyle(user.status)}`}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">
                  {formatRelativeTime(user.lastLogin)}
                </TableCell>
                <TableCell>
                  {hasDelegate ? (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[13px] text-foreground font-medium truncate block max-w-[140px]">
                          {userDelegates[0].delegateName && userDelegates[0].delegateName !== "- -"
                            ? userDelegates[0].delegateName
                            : userDelegates[0].delegateEmail || userDelegates[0].delegate.externalId}
                        </span>
                        {userDelegates[0].delegateEmail && userDelegates[0].delegateName && userDelegates[0].delegateName !== "- -" && (
                          <span className="text-[11px] text-muted-foreground truncate block max-w-[140px]">
                            {userDelegates[0].delegateEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/team/${user.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUserForPTO(user);
                          setSelectedUserDelegates(userDelegates);
                          setPTODialogOpen(true);
                        }}
                      >
                        {hasDelegate ? "Update Delegate" : "Assign Delegate"}
                      </DropdownMenuItem>
                      {hasDelegate && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUserForEndPTO(user);
                            setSelectedDelegateForEnd(userDelegates[0]);
                            setEndPTODialogOpen(true);
                          }}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          End PTO
                        </DropdownMenuItem>
                      )}
                      {user.status === "ACTIVE" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setLifecycleUser(user);
                            setLifecycleAction("suspend");
                            setLifecycleDialogOpen(true);
                          }}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          Suspend User
                        </DropdownMenuItem>
                      )}
                      {user.status === "SUSPENDED" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setLifecycleUser(user);
                            setLifecycleAction("unsuspend");
                            setLifecycleDialogOpen(true);
                          }}
                        >
                          Reactivate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedUserForPTO && (
        <PTODialog
          user={selectedUserForPTO}
          existingDelegates={selectedUserDelegates}
          open={ptoDialogOpen}
          onOpenChange={setPTODialogOpen}
          onSuccess={() => {
            onPTOSuccess?.();
          }}
        />
      )}

      {selectedUserForEndPTO && selectedDelegateForEnd && (
        <EndPTODialog
          userName={`${selectedUserForEndPTO.profile.firstName} ${selectedUserForEndPTO.profile.lastName}`}
          delegate={selectedDelegateForEnd}
          userId={selectedUserForEndPTO.id}
          open={endPTODialogOpen}
          onOpenChange={setEndPTODialogOpen}
          onSuccess={() => {
            onPTOSuccess?.();
          }}
        />
      )}

      {lifecycleUser && (
        <LifecycleDialog
          userId={lifecycleUser.id}
          userName={`${lifecycleUser.profile.firstName} ${lifecycleUser.profile.lastName}`}
          action={lifecycleAction}
          open={lifecycleDialogOpen}
          onOpenChange={setLifecycleDialogOpen}
          onSuccess={() => {
            onPTOSuccess?.();
          }}
        />
      )}
    </div>
  );
}
