"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isOrderStatus, ORDER_STATUS_TRANSITIONS } from "@/lib/order-workflow";
import type { OrderStatus } from "@/types/database";

export interface OrderStatusActionResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatusAction(
  orderId: string,
  requestedStatus: string
): Promise<OrderStatusActionResult> {
  await requireAdminSession();

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Configure Supabase before updating orders." };
  }
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      orderId
    )
  ) {
    return { success: false, error: "The order identifier is invalid." };
  }
  if (!isOrderStatus(requestedStatus)) {
    return { success: false, error: "Select a valid order status." };
  }

  const supabase = await getSupabaseServerClient();
  const { data: currentOrder, error: lookupError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  if (lookupError) {
    console.error("Order status lookup failed:", lookupError);
    return { success: false, error: "Could not verify the current order status." };
  }
  if (!currentOrder) return { success: false, error: "This order no longer exists." };

  const currentStatus = currentOrder.status as OrderStatus;
  if (!ORDER_STATUS_TRANSITIONS[currentStatus].includes(requestedStatus)) {
    return {
      success: false,
      error: `An order in ${currentStatus} status cannot be changed to ${requestedStatus}.`,
    };
  }

  const { error: transitionError } = await supabase.rpc(
    "admin_update_order_status",
    {
      p_order_id: orderId,
      p_expected_status: currentStatus,
      p_new_status: requestedStatus,
    }
  );
  if (transitionError) {
    console.error("Order status transition failed:", transitionError);
    if (transitionError.code === "22023") {
      return {
        success: false,
        error: "The order status changed elsewhere or this transition is no longer allowed. Refresh and try again.",
      };
    }
    if (transitionError.code === "P0002") {
      return { success: false, error: "This order no longer exists." };
    }
    return {
      success: false,
      error: "Could not update the order. Refresh and try again.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { success: true };
}
