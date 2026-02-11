"use client";

import { Session } from "next-auth";
import { Menu, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { MobileNavSheet } from "./mobile-nav";
import { handleSignOut } from "./actions";

interface TopNavProps {
  session: Session | null;
}

export function TopNav({ session }: TopNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const cycleMode = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ModeIcon = !mounted
    ? Monitor
    : theme === "dark"
      ? Moon
      : theme === "light"
        ? Sun
        : Monitor;

  const modeLabel = !mounted
    ? "System"
    : theme === "dark"
      ? "Dark"
      : theme === "light"
        ? "Light"
        : "System";

  return (
    <div className="flex items-center justify-between px-4 py-3 lg:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Toggle mobile menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Nav Sheet */}
      <MobileNavSheet open={isOpen} onOpenChange={setIsOpen} session={session} />

      {/* App Title (Mobile) */}
      <h1 className="lg:hidden text-lg font-semibold text-foreground">
        Okta Manager
      </h1>

      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleMode}
          aria-label={`Theme: ${modeLabel}`}
          className="rounded-full"
        >
          <ModeIcon className="h-4 w-4" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(session?.user?.name ?? undefined)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={handleSignOut} className="w-full">
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
