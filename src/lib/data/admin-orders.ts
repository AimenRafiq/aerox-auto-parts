import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "@/types/database";
import { ORDER_STATUSES } from "@/lib/order-workflow";

export interface AdminOrderListItem
  extends Pick<
    Order,
    | "id"
    | "order_number"
    | "status"
    | "currency"
    | "total"
    | "customer_email"
    | "customer_name"
    | "payment_provider"
    | "payment_status"
    | "created_at"
  > {
  items: Pick<OrderItem, "quantity">[];
}

export interface AdminOrderDetail extends Order {
  items: OrderItem[];
}

export interface AdminOrderListResult {
  orders: AdminOrderListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderFilterParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: "all" | OrderStatus;
  paymentStatus?: "all" | PaymentStatus;
}

export async function getAdminOrders(
  params: AdminOrderFilterParams = {}
): Promise<AdminOrderListResult> {
  const page = Number.isSafeInteger(params.page) ? Math.max(1, params.page ?? 1) : 1;
  const limit = Number.isSafeInteger(params.limit)
    ? Math.max(1, Math.min(50, params.limit ?? 20))
    : 20;

  if (!isSupabaseConfigured()) {
    return {
      orders: [],
      totalCount: 0,
      page,
      limit,
      totalPages: 1,
    };
  }

  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select(
      `
      id, order_number, status, currency, total,
      customer_email, customer_name, payment_provider, payment_status, created_at,
      items:order_items(quantity)
    `,
      { count: "exact" }
    );

  if (params.query?.trim()) {
    const search = params.query
      .trim()
      .slice(0, 100)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/[%_]/g, "\\$&");
    const term = `"%${search}%"`;
    query = query.or(
      `order_number.ilike.${term},customer_name.ilike.${term},customer_email.ilike.${term}`
    );
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    query = query.eq("payment_status", params.paymentStatus);
  }

  const offset = (page - 1) * limit;
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("Admin order list query failed:", error);
    throw new Error("Could not load orders. Please try again.");
  }

  const totalCount = count ?? data.length;
  return {
    orders: (data ?? []) as unknown as AdminOrderListItem[],
    totalCount,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
}

export async function getAdminOrderById(
  id: string
): Promise<AdminOrderDetail | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, user_id, status, currency,
      subtotal, shipping_amount, tax_amount, discount_amount, total,
      customer_email, customer_name, customer_phone,
      shipping_address, payment_provider, payment_status, payment_reference,
      notes, created_at, updated_at,
      items:order_items(
        id, order_id, product_id, sku_snapshot, product_name_snapshot,
        unit_price, quantity, line_total, created_at
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Admin order detail query failed:", error);
    throw new Error("Could not load this order. Please try again.");
  }
  if (!data) return null;

  const order = data as unknown as AdminOrderDetail;
  order.items.sort((first, second) => first.created_at.localeCompare(second.created_at));
  return order;
}
