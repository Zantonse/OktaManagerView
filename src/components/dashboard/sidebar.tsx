"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  ClipboardCheck,
  Award,
  Inbox,
  Settings,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  session: Session | null;
}

const navigationItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/reviews", label: "Reviews", icon: ClipboardCheck },
  { href: "/certifications", label: "Certifications", icon: Award },
  { href: "/requests", label: "Requests", icon: Inbox },
];

const settingsItems = [{ href: "/settings", label: "Settings", icon: Settings }];

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)]">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-foreground">Okta Manager</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 pt-1">
        <div className="space-y-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-4 mx-3 border-t border-border" />

        <div className="space-y-0.5">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      {session?.user && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[var(--sidebar-primary)] text-white text-xs font-semibold">
                {getInitials(session.user.name ?? undefined)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">
                {session.user.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
