"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { vnToday } from "@/lib/date-vn";
import { parseVnd } from "@/lib/money";
import { DEFAULT_QTY_GRAMS, formatGrams } from "@/lib/qty";

// Mọi thay đổi thực đơn đều phải làm mới cả trang quản trị lẫn trang chủ —
// trang chủ đọc thẳng thực đơn hôm nay nên khách thấy ngay, không chờ deploy.
function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/fridge");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createProduct(_prevState: string | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const emoji = String(formData.get("emoji") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return "Vui lòng nhập tên sản phẩm.";
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    return "Vui lòng chọn danh mục.";
  }

  const last = await prisma.product.findFirst({ orderBy: { sortOrder: "desc" } });

  await prisma.product.create({
    data: {
      name,
      category,
      emoji: emoji || "🍎",
      description: description || null,
      // Quy cách và giá để trống ở bước tạo nhanh — admin điền giá ngay trong
      // dòng thực đơn, còn quy cách sửa sau ở màn hình sửa sản phẩm.
      weight: "",
      price: "",
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  revalidateAll();
}

export async function updateProduct(id: string, _prevState: string | undefined, formData: FormData) {
  const category = String(formData.get("category") ?? "");
  const emoji = String(formData.get("emoji") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const weight = String(formData.get("weight") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const featured = formData.get("featured") === "on";

  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    return "Danh mục không hợp lệ.";
  }
  if (!emoji || !name) return "Vui lòng điền icon và tên sản phẩm.";

  await prisma.product.update({
    where: { id },
    data: {
      category,
      emoji,
      name,
      weight,
      price,
      badge: badge || null,
      description: description || null,
      featured,
    },
  });

  revalidateAll();
}

export async function deleteProduct(id: string) {
  // Xoá sản phẩm kéo theo mọi dòng thực đơn và nhật ký hao hụt của nó
  // (onDelete: Cascade trong schema) — cảnh báo này đã hiện ở nút xoá.
  await prisma.product.delete({ where: { id } });
  revalidateAll();
}

export async function addToTodayMenu(productId: string) {
  const date = vnToday();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const last = await prisma.dailyMenuEntry.findFirst({
    where: { date },
    orderBy: { sortOrder: "desc" },
  });

  await prisma.dailyMenuEntry.upsert({
    where: { productId_date: { productId, date } },
    // Đã có trong thực đơn hôm nay thì không đụng vào số liệu đang chạy.
    update: {},
    create: {
      productId,
      date,
      priceToday: parseVnd(product.price),
      qtyGrams: DEFAULT_QTY_GRAMS,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  revalidateAll();
}

export async function removeFromTodayMenu(entryId: string) {
  await prisma.dailyMenuEntry.delete({ where: { id: entryId } });
  revalidateAll();
}

export async function updateMenuEntry(
  entryId: string,
  patch: { priceToday?: number; qtyGrams?: number; soldGrams?: number }
) {
  const entry = await prisma.dailyMenuEntry.findUnique({ where: { id: entryId } });
  if (!entry) return "Không tìm thấy dòng thực đơn.";

  const priceToday = patch.priceToday ?? entry.priceToday;
  const qtyGrams = patch.qtyGrams ?? entry.qtyGrams;
  const soldGrams = patch.soldGrams ?? entry.soldGrams;

  if (priceToday < 0 || qtyGrams < 0 || soldGrams < 0) {
    return "Số liệu không được âm.";
  }
  // Đã bán + hư hỏng không thể vượt quá lượng nhập — chặn ở đây để "còn lại"
  // không bao giờ âm.
  const used = soldGrams + entry.spoiledGrams;
  if (used > qtyGrams) {
    return `Đã bán + hư hỏng (${formatGrams(used)}) vượt quá lượng nhập (${formatGrams(qtyGrams)}).`;
  }

  await prisma.dailyMenuEntry.update({
    where: { id: entryId },
    data: { priceToday, qtyGrams, soldGrams },
  });

  revalidateAll();
}

export async function moveMenuEntry(entryId: string, direction: "up" | "down") {
  const date = vnToday();
  const entries = await prisma.dailyMenuEntry.findMany({
    where: { date },
    orderBy: { sortOrder: "asc" },
  });

  const index = entries.findIndex((e) => e.id === entryId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= entries.length) return;

  // Đổi chỗ sortOrder của hai dòng liền kề. Dữ liệu cũ có thể có sortOrder
  // trùng nhau, nên ghi lại theo vị trí trong mảng thay vì hoán đổi giá trị.
  const reordered = [...entries];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  await prisma.$transaction(
    reordered.map((entry, i) =>
      prisma.dailyMenuEntry.update({ where: { id: entry.id }, data: { sortOrder: i } })
    )
  );

  revalidateAll();
}
