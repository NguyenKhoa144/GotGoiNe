"use server";

import { revalidatePath } from "next/cache";
import { placeOrder } from "@/lib/orders";
import type { PlaceOrderInput, PlaceOrderResult } from "@/lib/order-rules";

/**
 * Khách đặt hộp từ trang chủ. Cố ý KHÔNG đòi đăng nhập — đây là cửa công
 * khai. Mọi kiểm tra (đầu vào, cỡ hộp, thực đơn hôm nay, đủ hàng, chống gửi
 * trùng) nằm trong `placeOrder`, không tin gì từ trình duyệt.
 */
export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const result = await placeOrder(input);
  // Đặt thành công thì tủ vừa đổi: trang chủ (ẩn loại vừa hết) và trang quản
  // trị (đơn mới, tồn kho mới) đều phải làm mới.
  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/fridge");
  }
  return result;
}
