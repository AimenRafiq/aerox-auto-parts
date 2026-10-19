"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw } from "lucide-react";
import {
  archiveProductAction,
  restoreProductAction,
} from "@/actions/product-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
  archived: boolean;
}

export function ProductRowActions({
  productId,
  productName,
  archived,
}: ProductRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restore = () => {
    setError(null);
    startTransition(async () => {
      const result = await restoreProductAction(productId);
      if (result.success) router.refresh();
      else setError(result.error ?? "Could not restore this product.");
    });
  };

  const archive = () => {
    setError(null);
    startTransition(async () => {
      const result = await archiveProductAction(productId);
      if (result.success) {
        setConfirmOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not archive this product.");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {error && <p role="alert" className="w-full text-right text-xs text-brand-error">{error}</p>}
      {archived ? (
        <Button
          variant="outline"
          size="sm"
          onClick={restore}
          isLoading={isPending}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Restore as draft
        </Button>
      ) : (
        <>
          <Link href={`/admin/products/${productId}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            leftIcon={<Archive className="h-3.5 w-3.5" />}
          >
            Archive
          </Button>
        </>
      )}
      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Archive this product?"
        description="The product will be unpublished and hidden from the storefront. Order history is retained."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={archive}
              isLoading={isPending}
              leftIcon={<Archive className="h-4 w-4" />}
            >
              Archive product
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          <span className="font-medium">{productName}</span> will no longer be
          available in the public catalog. You can restore it later as an unpublished draft.
        </Alert>
      </Dialog>
    </div>
  );
}
