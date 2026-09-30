import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Switch({
  className,
  checked = false,
  onCheckedChange,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5",
        "transition-all duration-300 ease-out-smooth",
        checked
          ? "gradient-gold border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_16px_rgba(184,134,11,0.35)]"
          : "border border-border bg-secondary/80 hover:border-primary/40 hover:bg-secondary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-6 rounded-full bg-white shadow-md ring-1 ring-black/5",
          "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export { Switch };
export type { SwitchProps };
