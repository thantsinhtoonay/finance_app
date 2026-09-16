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
        "glass-toggle animate-toggle",
        checked ? "glass-toggle-active" : "",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "glass-toggle-knob pointer-events-none block size-6 rounded-full",
          "transition-all duration-400",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export { Switch };
export type { SwitchProps };
