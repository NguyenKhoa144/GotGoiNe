"use server";

import { revalidatePath } from "next/cache";
import { carryForwardToToday } from "@/lib/close-day";

/** Nút "Chuyển hàng tồn" trong trang quản trị — dự phòng khi cron lỡ không chạy. */
export async function carryForwardNow() {
  const result = await carryForwardToToday();

  revalidatePath("/admin/products");
  revalidatePath("/admin/fridge");
  revalidatePath("/admin");
  revalidatePath("/");

  return result.carried;
}
