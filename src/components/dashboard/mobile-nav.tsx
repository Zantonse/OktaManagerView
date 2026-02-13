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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useColorTheme } from "@/lib/hooks/use-color-theme";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface MobileNavProps {
  session: Session | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const navigationItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/reviews", label: "Access Reviews", icon: ClipboardCheck },
];

const settingsItems = [{ href: "/settings", label: "Set Governance Delegates", icon: Settings }];

export function MobileNavSheet({
  open,
  onOpenChange,
}: MobileNavProps) {
  const pathname = usePathname();
  const { cycleTheme } = useColorTheme();
  const [spinning, setSpinning] = useState(false);

  const handleLinkClick = () => {
    onOpenChange?.(false);
  };

  const handleLogoClick = () => {
    setSpinning(true);
    const next = cycleTheme();
    toast(next.label, { duration: 1500 });
    setTimeout(() => setSpinning(false), 500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0 bg-[var(--sidebar)]">
        <SheetHeader className="border-b border-[var(--sidebar-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] transition-transform duration-500 ease-out"
              style={spinning ? { transform: "rotate(360deg)" } : undefined}
              aria-label="Change color theme"
            >
              <Shield className="h-4.5 w-4.5 text-white" />
            </button>
            <SheetTitle className="text-base font-semibold text-foreground">Okta Manager</SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors",
                    isActive
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                      : "text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--sidebar-border)] p-3">
          <nav className="space-y-1">
            <a
              href="https://craigverzosa.oktapreview.com/app/UserHome"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50 transition-colors"
            >
              <ExternalLink className="h-[18px] w-[18px]" />
              <span>End User Dashboard</span>
            </a>
            <div className="my-2 mx-2 border-t border-[var(--sidebar-border)]" />
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors",
                    isActive
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-semibold"
                      : "text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-foreground/70 font-medium hover:text-foreground hover:bg-[var(--sidebar-accent)]/50 transition-colors"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MobileNav(
  _props: Omit<MobileNavProps, "open" | "onOpenChange">
) {
  return null; // Mobile nav is controlled via TopNav
}
