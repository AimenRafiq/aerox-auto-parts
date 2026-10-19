import assert from "node:assert/strict";
import test from "node:test";
import { ORDER_STATUS_TRANSITIONS } from "../src/lib/order-workflow.ts";

test("order workflow permits only the defined forward and cancellation transitions", () => {
  assert.deepEqual(ORDER_STATUS_TRANSITIONS, {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  });
});

test("delivered and cancelled orders are terminal", () => {
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.delivered, []);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.cancelled, []);
});
