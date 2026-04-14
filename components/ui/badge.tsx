import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    "transition-colors duration-200 ease-smooth"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary dark:bg-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/20",
        success:
          "bg-success-500/10 text-success-500 dark:bg-success-500/20",
        warning:
          "bg-warning-500/10 text-warning-500 dark:bg-warning-500/20",
        outline:
          "border border-border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
