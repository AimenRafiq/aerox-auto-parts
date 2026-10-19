"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber <= 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="mt-8 flex items-center justify-between border-t border-brand-border/70 pt-4"
    >
      <div>
        <p className="text-xs text-brand-muted">
          Showing page <span className="font-semibold text-brand-ink">{currentPage}</span> of{" "}
          <span className="font-semibold text-brand-ink">{totalPages}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link href={createPageUrl(currentPage - 1)}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
        )}

        {hasNext ? (
          <Link href={createPageUrl(currentPage + 1)}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        )}
      </div>
    </nav>
  );
};

