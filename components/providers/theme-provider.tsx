"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps,
} from "next-themes";

/**
 * ThemeProvider wrapper using next-themes
 *
 * Configuration:
 * - attribute: "class" - Uses class-based dark mode strategy
 * - defaultTheme: "system" - Respects OS preference by default
 * - enableSystem: true - Allows system preference detection
 * - enableColorScheme: false - Prevents browser color scheme interference
 * - storageKey: "theme" - localStorage key for persistence
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      storageKey="theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Hook to access theme state and controls
 * Provides a unified API for theme management
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme, themes } = useNextTheme();

  return {
    /** Current theme: "light" | "dark" | "system" */
    theme,
    /** Resolved theme after system detection: "light" | "dark" */
    resolvedTheme,
    /** Detected system theme: "light" | "dark" | undefined */
    systemTheme,
    /** Available themes */
    themes,
    /** Set theme programmatically */
    setTheme,
    /** Toggle between light and dark */
    toggleTheme: () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    },
  };
}
