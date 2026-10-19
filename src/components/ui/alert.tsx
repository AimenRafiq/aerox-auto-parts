import React from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  children,
  ...props
}) => {
  const variantConfig = {
    info: {
      container: "border-brand-border bg-brand-bg text-brand-ink",
      icon: <Info className="h-5 w-5 text-brand-navy flex-shrink-0" />,
    },
    success: {
      container: "border-brand-success/30 bg-brand-success-light text-brand-success",
      icon: <CheckCircle2 className="h-5 w-5 text-brand-success flex-shrink-0" />,
    },
    warning: {
      container: "border-brand-warning/30 bg-brand-warning-light text-brand-warning",
      icon: <AlertTriangle className="h-5 w-5 text-brand-warning flex-shrink-0" />,
    },
    error: {
      container: "border-brand-error/30 bg-brand-error-light text-brand-error",
      icon: <AlertCircle className="h-5 w-5 text-brand-error flex-shrink-0" />,
    },
  };

  const { container, icon } = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start gap-3 rounded border p-4 text-sm transition-all",
        container,
        className
      )}
      {...props}
    >
      {icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-inherit">{title}</h5>}
        <div className="text-xs opacity-90 leading-relaxed text-brand-ink">{children}</div>
      </div>
    </div>
  );
};

