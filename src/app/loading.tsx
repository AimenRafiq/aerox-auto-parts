import React from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-8">
      <Spinner size="lg" />
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-brand-muted">
        Loading catalog data...
      </p>
    </div>
  );
}

