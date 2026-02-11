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
import { OktaUser } from "@/types/okta";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date";
import { PTODialog } from "./pto-dialog";

type SortField = "name" | "email" | "status" | "lastLogin";
type SortDirection = "asc" | "desc";

interface TeamTableProps {
  users: OktaUser[];
  selectedUsers: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onPTOSuccess?: () => void;
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

export function TeamTable({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onPTOSuccess,
}: TeamTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ptoDialogOpen, setPTODialogOpen] = useState(false);
  const [selectedUserForPTO, setSelectedUserForPTO] = useState<OktaUser | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
        aVal = a.status;
        bVal = b.status;
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
      className={`ml-2 h-4 w-4 ${
        sortField === field ? "opacity-100" : "opacity-0 group-hover:opacity-50"
      }`}
    />
  );

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected || isSomeSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead
              className="group cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center">
                Name
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead
              className="group cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("email")}
            >
              <div className="flex items-center">
                Email
                <SortIcon field="email" />
              </div>
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead
              className="group cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </TableHead>
            <TableHead
              className="group cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("lastLogin")}
            >
              <div className="flex items-center">
                Last Login
                <SortIcon field="lastLogin" />
              </div>
            </TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selectedUsers.has(user.id)}
                  onCheckedChange={(checked) =>
                    onSelectUser(user.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(
                        user.profile.firstName,
                        user.profile.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.profile.firstName} {user.profile.lastName}
                    </div>
                    {user.profile.onPTO && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        PTO
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.profile.email}</TableCell>
              <TableCell>{user.profile.title || "—"}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(user.lastLogin)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        setPTODialogOpen(true);
                      }}
                    >
                      {user.profile.onPTO ? "End PTO" : "Mark PTO"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedUserForPTO && (
        <PTODialog
          user={selectedUserForPTO}
          open={ptoDialogOpen}
          onOpenChange={setPTODialogOpen}
          onSuccess={() => {
            onPTOSuccess?.();
          }}
        />
      )}
    </div>
  );
}
