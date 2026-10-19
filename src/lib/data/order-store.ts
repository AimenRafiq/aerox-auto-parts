import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types/database";

export interface FullOrderReceipt extends Order {
  items: OrderItem[];
}

// In-memory cache for recent orders (ensures demo orders are viewable on confirmation page)
const recentOrdersMemoryMap = new Map<string, FullOrderReceipt>();

export function saveRecentOrderInMemory(order: FullOrderReceipt): void {
  recentOrdersMemoryMap.set(order.order_number, order);
}

/**
 * Retrieves an order and its items by order number.
 * Checks Supabase first; falls back to in-memory store for development demo orders.
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<FullOrderReceipt | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = Boolean(
    url && !url.includes("placeholder-project")
  );

  if (isConfigured) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
          id, order_number, user_id, status, currency,
          subtotal, shipping_amount, tax_amount, discount_amount, total,
          customer_email, customer_name, customer_phone,
          shipping_address, payment_provider, payment_status, payment_reference,
          notes, created_at, updated_at
        `)
        .eq("order_number", orderNumber)
        .single();

      if (!error && order) {
        const { data: items } = await supabase
          .from("order_items")
          .select("id, order_id, product_id, sku_snapshot, product_name_snapshot, unit_price, quantity, line_total, created_at")
          .eq("order_id", order.id);

        return {
          ...(order as Order),
          items: (items || []) as OrderItem[],
        };
      }
    } catch {
      // Fallback below
    }
  }

  // Check recent memory store
  const memoryOrder = recentOrdersMemoryMap.get(orderNumber);
  return memoryOrder || null;
}

