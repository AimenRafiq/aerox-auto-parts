import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg text-brand-navy">
        <FileQuestion className="h-7 w-7" />
      </div>
      <span className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-accent">
        404 Error
      </span>
      <h1 className="mt-1 text-2xl font-bold text-brand-ink">
        Part or Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-xs text-brand-muted leading-relaxed">
        The requested URL, part SKU, or category does not exist in our catalog or may have been relocated.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link href="/">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="primary">Browse All Parts</Button>
        </Link>
      </div>
    </div>
  );
}

