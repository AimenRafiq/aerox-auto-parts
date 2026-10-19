"use server";

import { checkoutFormSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import { revalidateCartItems } from "@/lib/data/cart-validation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isTestPaymentAllowed } from "@/lib/payment-methods";
import { saveRecentOrderInMemory, type FullOrderReceipt } from "@/lib/data/order-store";
import type {
  Json,
  OrderStatus,
  PaymentStatus,
  PaymentProvider,
} from "@/types/database";

export interface CheckoutActionResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function processCheckoutAction(
  rawData: unknown
): Promise<CheckoutActionResult> {
  // 1. Validate Form Input Schema
  const parsed = checkoutFormSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path.join(".");
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(err.message);
    });
    return {
      success: false,
      error: "Please correct the highlighted form errors before submitting.",
      fieldErrors,
    };
  }

  const data: CheckoutFormData = parsed.data;
  const isDatabaseConfigured = isSupabaseConfigured();
  if (data.paymentMethod === "test" && !isTestPaymentAllowed()) {
    return {
      success: false,
      error: "Test checkout is available only in non-production environments.",
    };
  }
  if (!isDatabaseConfigured && process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Checkout is unavailable until the store database is configured.",
    };
  }

  // 2. Authoritatively Revalidate Cart Items (Disregards client-submitted prices)
  let validation;
  try {
    validation = await revalidateCartItems(data.items);
  } catch (error) {
    console.error("Checkout inventory validation failed:", error);
    return {
      success: false,
      error: "We could not verify current inventory. Please try again shortly.",
    };
  }
  if (!validation.isValid || validation.items.length === 0) {
    const errorMsg =
      validation.errors.join(" ") ||
      "Unable to validate selected automotive parts against inventory.";
    return {
      success: false,
      error: errorMsg,
    };
  }

  // 3. Authoritative Calculations
  const subtotal = validation.subtotal;
  // Free ground shipping for orders $150 and above; otherwise $15.00 flat ground shipping
  const shippingAmount = subtotal >= 150 ? 0.0 : 15.0;
  // Estimated 7% sales tax on components
  const taxAmount = Number((subtotal * 0.07).toFixed(2));
  const discountAmount = 0.0;
  const total = Number((subtotal + shippingAmount + taxAmount - discountAmount).toFixed(2));

  // 4. Generate Safe Human-Readable Order Number
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeCode = Date.now().toString(36).toUpperCase();
  const orderNumber = `ARX-${timeCode}-${randomSuffix}`;
  const orderId = crypto.randomUUID();

  const shippingAddressSnapshot = {
    street: data.shippingStreet,
    city: data.shippingCity,
    state: data.shippingState,
    postalCode: data.shippingPostalCode,
    country: data.shippingCountry,
  };

  const initialStatus: OrderStatus = "pending";
  const initialPaymentStatus: PaymentStatus =
    data.paymentMethod === "test" ? "authorized" : "pending";
  const paymentProvider: PaymentProvider = data.paymentMethod;

  const nowIso = new Date().toISOString();

  // 5. Build Receipt
  const fullReceipt: FullOrderReceipt = {
    id: orderId,
    order_number: orderNumber,
    user_id: null,
    status: initialStatus,
    currency: "USD",
    subtotal,
    shipping_amount: shippingAmount,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    total,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone || null,
    shipping_address: shippingAddressSnapshot,
    payment_provider: paymentProvider,
    payment_status: initialPaymentStatus,
    payment_reference: `MANUAL-REF-${orderNumber}`,
    notes: data.notes || null,
    created_at: nowIso,
    updated_at: nowIso,
    items: validation.items.map((lineItem) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: lineItem.product.id,
      sku_snapshot: lineItem.product.sku,
      product_name_snapshot: lineItem.product.name,
      unit_price: lineItem.unitPrice,
      quantity: lineItem.confirmedQuantity,
      line_total: lineItem.lineTotal,
      created_at: nowIso,
    })),
  };

  // 6. Database Insertion if Supabase is connected
  if (isDatabaseConfigured) {
    try {
      const supabase = await getSupabaseServerClient();

      const orderData: Json = {
        id: fullReceipt.id,
        order_number: fullReceipt.order_number,
        user_id: fullReceipt.user_id,
        status: fullReceipt.status,
        currency: fullReceipt.currency,
        subtotal: fullReceipt.subtotal,
        shipping_amount: fullReceipt.shipping_amount,
        tax_amount: fullReceipt.tax_amount,
        discount_amount: fullReceipt.discount_amount,
        total: fullReceipt.total,
        customer_name: fullReceipt.customer_name,
        customer_email: fullReceipt.customer_email,
        customer_phone: fullReceipt.customer_phone,
        shipping_address: fullReceipt.shipping_address,
        payment_provider: fullReceipt.payment_provider,
        payment_status: fullReceipt.payment_status,
        payment_reference: fullReceipt.payment_reference,
        notes: fullReceipt.notes,
        created_at: fullReceipt.created_at,
        updated_at: fullReceipt.updated_at,
      };
      const itemData: Json = fullReceipt.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        sku_snapshot: item.sku_snapshot,
        product_name_snapshot: item.product_name_snapshot,
        unit_price: item.unit_price,
        quantity: item.quantity,
        line_total: item.line_total,
        created_at: item.created_at,
      }));

      const { error } = await supabase.rpc("create_checkout_order", {
        p_order: orderData,
        p_items: itemData,
      });
      if (error) {
        console.error("Atomic checkout order save failed:", error);
        return {
          success: false,
          error: "We could not save your order. Please try again shortly.",
        };
      }
    } catch (err: unknown) {
      console.error("Checkout order transaction failed:", err);
      return {
        success: false,
        error: "We could not save your order. Please try again shortly.",
      };
    }
  }

  // Save to memory store for instant confirmation receipt rendering
  saveRecentOrderInMemory(fullReceipt);

  return {
    success: true,
    orderNumber,
  };
}
