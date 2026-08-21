"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";
import { SPOILAGE_REASONS } from "./constants";

export async function reportSpoilage(
  productId: string,
  amountGrams: number,
  reason: string,
  note?: string
) {
  if (!Number.isFinite(amountGrams) || amountGrams <= 0) {
    return "Số lượng hư hỏng phải lớn hơn 0.";
  }
  if (!(SPOILAGE_REASONS as readonly string[]).includes(reason)) {
    return "Vui lòng chọn lý do.";
  }

  const date = vnToday();
  const entry = await prisma.dailyMenuEntry.findUnique({
    where: { productId_date: { productId, date } },
  });
  if (!entry) return "Loại này không có trong thực đơn hôm nay.";

  const remaining = entry.qtyGrams - entry.soldGrams - entry.spoiledGrams;
  if (amountGrams > remaining) {
    return `Chỉ còn ${remaining}g, không thể ghi nhận hư hỏng ${amountGrams}g.`;
  }

  // Trừ kho và ghi nhật ký phải đi cùng nhau — nếu tách rời, một lần lỗi giữa
  // chừng sẽ để lại kho bị trừ mà không có dòng nào giải thích vì sao.
  await prisma.$transaction([
    prisma.dailyMenuEntry.update({
      where: { id: entry.id },
      data: { spoiledGrams: { increment: amountGrams } },
    }),
    prisma.inventoryLoss.create({
      data: {
        productId,
        date,
        amountGrams,
        reason,
        note: note?.trim() || null,
      },
    }),
  ]);

  revalidatePath("/admin/fridge");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/");
}
