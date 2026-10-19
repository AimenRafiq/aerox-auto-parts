"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { updateOrderStatusAction } from "@/actions/admin-order-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/order-workflow";
import type { OrderStatus } from "@/types/database";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableStatuses = ORDER_STATUS_TRANSITIONS[status];

  const update = () => {
    if (!selectedStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, selectedStatus);
      if (result.success) {
        setSelectedStatus("");
        setConfirmCancel(false);
        router.refresh();
      } else {
        setError(result.error ?? "Could not update the order status.");
      }
    });
  };

  const beginUpdate = () => {
    if (selectedStatus === "cancelled") setConfirmCancel(true);
    else update();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-brand-ink">
            Order status
          </span>
          <select
            value={selectedStatus}
            disabled={isPending || availableStatuses.length === 0}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:bg-brand-bg"
          >
            <option value="">
              {availableStatuses.length ? `Current: ${status}` : `Final status: ${status}`}
            </option>
            {availableStatuses.map((nextStatus) => (
              <option key={nextStatus} value={nextStatus}>
                {nextStatus.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <Button
          onClick={beginUpdate}
          disabled={isPending || !selectedStatus}
          isLoading={isPending}
          leftIcon={isPending ? undefined : <ArrowRight className="h-4 w-4" />}
        >
          Update status
        </Button>
      </div>
      {availableStatuses.length === 0 && (
        <p className="text-xs text-brand-muted">
          This order has reached a final status. Payment status is managed separately.
        </p>
      )}
      {error && <Alert variant="error" title="Status was not updated">{error}</Alert>}
      <Dialog
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this order?"
        description="This changes the order fulfillment status only. It does not issue a refund or change payment status."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmCancel(false)}
              disabled={isPending}
            >
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={update}
              isLoading={isPending}
              leftIcon={!isPending && <Check className="h-4 w-4" />}
            >
              Confirm cancellation
            </Button>
          </>
        }
      >
        <Alert variant="warning">
          The order will be marked cancelled. This action is recorded in the
          administrative audit log; payment status remains unchanged.
        </Alert>
      </Dialog>
    </div>
  );
}
