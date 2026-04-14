"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  className?: string;
  /** If true, shows a simple toggle button. If false, shows a dropdown with light/dark/system options */
  simple?: boolean;
}

/**
 * ThemeToggle component
 * 
 * Provides UI for switching between light, dark, and system themes.
 * Two modes:
 * - simple: Single button that toggles between light/dark
 * - dropdown: Dropdown menu with all three options (default)
 */
export function ThemeToggle({ className, simple = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-xl bg-muted",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  if (simple) {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className={cn(
          "group relative inline-flex items-center justify-center",
          "w-10 h-10 rounded-xl",
          "bg-card border border-border",
          "hover:bg-accent",
          "transition-all duration-200 ease-smooth",
          "active:scale-95",
          className
        )}
        aria-label={
          resolvedTheme === "light" ? "Switch to dark mode" : "Switch to light mode"
        }
      >
        <Sun
          className={cn(
            "h-5 w-5 transition-all duration-300 ease-smooth",
            "text-foreground",
            resolvedTheme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        <Moon
          className={cn(
            "h-5 w-5 transition-all duration-300 ease-smooth",
            "text-foreground",
            resolvedTheme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group relative inline-flex items-center justify-center",
          "w-10 h-10 rounded-xl",
          "bg-card border border-border",
          "hover:bg-accent",
          "transition-all duration-200 ease-smooth",
          "active:scale-95",
          className
        )}
        aria-label="Toggle theme"
      >
        <Sun
          className={cn(
            "h-5 w-5 transition-all duration-300 ease-smooth",
            "text-foreground",
            resolvedTheme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        <Moon
          className={cn(
            "h-5 w-5 transition-all duration-300 ease-smooth",
            "text-foreground",
            resolvedTheme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "light" && "bg-accent"
          )}
        >
          <Sun className="h-4 w-4" />
          <span>Claro</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-primary">activo</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" && "bg-accent"
          )}
        >
          <Moon className="h-4 w-4" />
          <span>Oscuro</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-primary">activo</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "system" && "bg-accent"
          )}
        >
          <Monitor className="h-4 w-4" />
          <span>Sistema</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-primary">activo</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
