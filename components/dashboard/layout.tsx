"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  Calendar,
  ChartBar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from "@clerk/nextjs";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  activePattern: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, activePattern: "/dashboard$" },
  { label: "Pacientes", href: "/dashboard/patients", icon: Users, activePattern: "/dashboard/patients" },
  { label: "Turnos", href: "/dashboard/appointments", icon: Calendar, activePattern: "/dashboard/appointments" },
  { label: "Sesiones", href: "/dashboard/sessions", icon: Clock, activePattern: "/dashboard/sessions" },
  { label: "Analisis", href: "/dashboard/analytics", icon: ChartBar, activePattern: "/dashboard/analytics" },
];

export function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();

  const isActive = (pattern: string) => {
    const regex = new RegExp(pattern);
    return regex.test(pathname);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "transform transition-all duration-300 ease-smooth",
          "lg:translate-x-0 lg:static lg:inset-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: "280px" }}
      >
        <div className="flex flex-col h-full bg-card border-r border-border">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-lg font-bold text-foreground truncate">FisioGestiona</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.activePattern);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                    "transition-all duration-200 ease-smooth",
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-border px-3 py-4 space-y-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Configuracion</span>
            </Link>
            <SignOutButton>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Cerrar sesion</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? "User"} />
            <AvatarFallback className="bg-muted text-foreground">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
