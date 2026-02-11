"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  ClipboardCheck,
  Inbox,
  Settings,
  Shield,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useColorTheme } from "@/lib/hooks/use-color-theme";
import { useState } from "react";
import { toast } from "sonner";

interface MobileNavProps {
  session: Session | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const navigationItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/reviews", label: "Access Reviews", icon: ClipboardCheck },
  { href: "/requests", label: "Requests", icon: Inbox },
];

const settingsItems = [{ href: "/settings", label: "Settings", icon: Settings }];

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
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLogoClick}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)] transition-transform duration-500 ease-out"
              style={spinning ? { transform: "rotate(360deg)" } : undefined}
              aria-label="Change color theme"
            >
              <Shield className="h-4 w-4 text-white" />
            </button>
            <SheetTitle className="text-[15px] font-bold text-foreground">Okta Manager</SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
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

        <div className="border-t border-border p-3">
          <nav className="space-y-0.5">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
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
