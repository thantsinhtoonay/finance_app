import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default: "glass-toggle text-muted-foreground",
        primary: "bg-primary/10 text-primary border border-primary/20",
        income: "glass-toggle bg-emerald-50/80 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30",
        expense: "glass-toggle bg-red-50/80 text-red-500 border border-red-200/50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
        outline: "glass-toggle border border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
