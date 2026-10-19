import React from "react";
import { cn } from "@/lib/utils";
import { PackageSearch } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded border border-dashed border-brand-border bg-white px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg text-brand-navy">
        {icon || <PackageSearch className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-brand-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-brand-muted leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

