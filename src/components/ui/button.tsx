import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "gradient-gold text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 hover:brightness-105 active:scale-[0.97]",
        destructive: "bg-destructive text-destructive-foreground shadow-md shadow-destructive/25 hover:shadow-lg hover:shadow-destructive/40 hover:bg-destructive/90 active:scale-[0.97]",
        outline: "border border-border/70 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]",
        secondary: "border border-border/60 bg-secondary text-secondary-foreground hover:bg-accent active:scale-[0.98]",
        ghost: "hover:bg-primary/10 hover:text-primary active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "gradient-gold text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-105 active:scale-[0.97]",
        glass: "glass-toggle text-foreground hover:border-primary/30 hover:bg-primary/10 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 rounded-lg px-3 text-sm",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
