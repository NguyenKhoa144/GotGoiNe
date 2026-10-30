"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { advanceOrder as advance, cancelOrder as cancel } from "@/lib/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-rules";

function revalidateAll() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/fridge");
  revalidatePath("/admin");
  revalidatePath("/");
}

/** Chờ -> Đã xác nhận, hoặc Đã xác nhận -> Đã giao. */
export async function advanceOrder(orderId: string, from: OrderStatus): Promise<string | null> {
  await requireAdmin();
  if (!(ORDER_STATUSES as readonly string[]).includes(from)) return "Trạng thái không hợp lệ.";
  const error = await advance(orderId, from);
  if (!error) revalidateAll();
  return error;
}

/** Huỷ đơn và hoàn hàng về tủ lạnh. */
export async function cancelOrder(orderId: string): Promise<string | null> {
  await requireAdmin();
  const error = await cancel(orderId);
  if (!error) revalidateAll();
  return error;
}
