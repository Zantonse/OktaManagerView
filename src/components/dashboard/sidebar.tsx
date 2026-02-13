"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  ClipboardCheck,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useColorTheme } from "@/lib/hooks/use-color-theme";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface SidebarProps {
  session: Session | null;
}

const navigationItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/reviews", label: "Access Reviews", icon: ClipboardCheck },
];

const settingsItems = [{ href: "/settings", label: "Settings", icon: Settings }];

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const { cycleTheme } = useColorTheme();
  const [spinning, setSpinning] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogoClick = () => {
    setSpinning(true);
    const next = cycleTheme();
    toast(next.label, { duration: 1500 });
    setTimeout(() => setSpinning(false), 500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <button
          onClick={handleLogoClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] transition-transform duration-500 ease-out hover:scale-105"
          style={spinning ? { transform: "rotate(360deg)" } : undefined}
          aria-label="Change color theme"
        >
          <Shield className="h-4.5 w-4.5 text-white" />
        </button>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Okta Manager
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 pt-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                    : "text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50"
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-4 mx-2 border-t border-[var(--sidebar-border)]" />

        <div className="space-y-1">
          <a
            href="https://craigverzosa.oktapreview.com/app/UserHome"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50 transition-colors"
          >
            <ExternalLink className="h-[18px] w-[18px] flex-shrink-0" />
            <span>End User Dashboard</span>
          </a>
        </div>

        <div className="my-4 mx-2 border-t border-[var(--sidebar-border)]" />

        <div className="space-y-1">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors",
                  isActive
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                    : "text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50"
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      {session?.user && (
        <div className="border-t border-[var(--sidebar-border)] p-4">
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
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-accent)]/50 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
