"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { applyStockMovement } from "@/lib/stock";
import { FRIDGE_ACTIONS, type FridgeActionId } from "./constants";

// Kho đổi thì cả trang quản trị lẫn trang chủ đều phải làm mới — trang chủ
// đọc thẳng tồn kho để ẩn loại đã hết, khách thấy ngay chứ không chờ deploy.
function revalidateAll() {
  revalidatePath("/admin/fridge");
  revalidatePath("/admin/menu");
  revalidatePath("/admin");
  revalidatePath("/");
}

/**
 * Một thao tác tủ lạnh: nhập thêm, bán tại chỗ, ghi hao hụt, hoặc đếm lại.
 * Trả về `null` nếu thành công, hoặc chuỗi lỗi tiếng Việt để hiện cho admin.
 */
export async function recordFridgeChange(
  productId: string,
  actionId: FridgeActionId,
  amountGrams: number,
  note?: string
): Promise<string | null> {
  const action = FRIDGE_ACTIONS.find((a) => a.id === actionId);
  if (!action) return "Thao tác không hợp lệ.";

  if (!Number.isFinite(amountGrams) || amountGrams < 0) {
    return "Số gram phải là số dương.";
  }

  if (action.kind === "ADJUST") {
    // "Đếm lại" nhận vào số tồn THẬT vừa đếm được, không phải chênh lệch —
    // bắt admin tự tính chênh lệch là cách chắc chắn nhất để có số sai.
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return "Không tìm thấy loại trái cây này.";

    const delta = Math.trunc(amountGrams) - product.stockGrams;
    if (delta === 0) return "Số vừa đếm đúng bằng số đang có, không cần sửa.";

    const error = await applyStockMovement({
      productId,
      kind: "ADJUST",
      amountGrams: delta,
      reason: action.reason ?? undefined,
      note: note?.trim() || `Sửa từ ${product.stockGrams}g thành ${Math.trunc(amountGrams)}g`,
    });
    if (error) return error;
    revalidateAll();
    return null;
  }

  if (amountGrams === 0) return "Số gram phải lớn hơn 0.";

  const error = await applyStockMovement({
    productId,
    kind: action.kind,
    amountGrams,
    reason: action.reason ?? undefined,
    note,
  });
  if (error) return error;

  revalidateAll();
  return null;
}
