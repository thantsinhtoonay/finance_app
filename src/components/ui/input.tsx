import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl glass-input px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
