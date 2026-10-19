import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "error" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-brand-navy/10 text-brand-navy border-transparent",
    accent: "bg-brand-accent-light text-brand-accent border-transparent",
    success: "bg-brand-success-light text-brand-success border-transparent",
    warning: "bg-brand-warning-light text-brand-warning border-transparent",
    error: "bg-brand-error-light text-brand-error border-transparent",
    outline: "bg-white text-brand-ink border-brand-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

