"use client";

import { useTheme as useNextTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Toaster component using Sonner
 * Integrates with next-themes for automatic dark/light mode support
 */
export function Toaster() {
  const { resolvedTheme } = useNextTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme as "light" | "dark"}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-border bg-card px-4 py-3 shadow-xl",
          title: "text-sm font-medium text-foreground",
          description: "text-xs text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl",
          cancelButton:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl",
          success:
            "border-success-500 bg-success-500/10 dark:bg-success-500/20",
          error:
            "border-destructive bg-destructive/10 dark:bg-destructive/20",
          warning:
            "border-warning-500 bg-warning-500/10 dark:bg-warning-500/20",
          info:
            "border-accent bg-accent/10 dark:bg-accent/20",
        },
      }}
      closeButton
      richColors
    />
  );
}
