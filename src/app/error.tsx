"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error in development
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-error-light text-brand-error">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-brand-ink">
        An unexpected error occurred
      </h1>
      <p className="mt-2 max-w-md text-xs text-brand-muted leading-relaxed">
        The application encountered an issue while rendering this view. Your cart and stored data are safe.
      </p>
      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => reset()}
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

