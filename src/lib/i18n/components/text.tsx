import React from "react";
import { useTranslation } from "../store";
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "div";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  leading?: "tight" | "normal" | "relaxed";
  tracking?: "tight" | "normal" | "wide";
  className?: string;
  children: React.ReactNode;
}

export function Text({
  as: Component = "p",
  size = "base",
  weight = "normal",
  leading,
  tracking,
  className,
  children,
  ...props
}: TextProps) {
  const { typography, isBurmese } = useTranslation();
  
  // Auto-adjust leading for Burmese if not explicitly set
  const effectiveLeading = leading || (isBurmese ? "relaxed" : "normal");
  
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  };
  
  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };
  
  const leadingClasses = {
    tight: "leading-tight",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
  };
  
  const trackingClasses = {
    tight: "tracking-tight",
    normal: "tracking-normal",
    wide: "tracking-wide",
  };
  
  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        leadingClasses[effectiveLeading],
        tracking && trackingClasses[tracking],
        className
      )}
      style={{
        fontFamily: typography.fontFamily,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

// Specialized text components
export function Heading({
  level = 1,
  className,
  children,
  ...props
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
} & Omit<TextProps, "as" | "level">) {
  const sizeMap = {
    1: "3xl",
    2: "2xl",
    3: "xl",
    4: "lg",
    5: "base",
    6: "sm",
  } as const;
  
  return (
    <Text
      as={`h${level}`}
      size={sizeMap[level]}
      weight="bold"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Label({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & Omit<TextProps, "as">) {
  return (
    <Text
      as="label"
      size="sm"
      weight="medium"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & Omit<TextProps, "as">) {
  return (
    <Text
      as="span"
      size="xs"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Text>
  );
}
