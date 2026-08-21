"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { vnToday } from "@/lib/date-vn";
import { parseVnd } from "@/lib/money";
import { uploadProductImage } from "@/lib/upload";

// Mọi thay đổi thực đơn đều phải làm mới cả trang quản trị lẫn trang chủ —
// trang chủ đọc thẳng thực đơn hôm nay nên khách thấy ngay, không chờ deploy.
function revalidateAll() {
  revalidatePath("/admin/menu");
  revalidatePath("/admin/fridge");
  revalidatePath("/admin");
  revalidatePath("/");
}

/**
 * Lấy ảnh từ form: ưu tiên file tải lên, không có thì nhận link dán vào.
 * Trả về `undefined` nếu admin không đụng gì tới ảnh (giữ nguyên ảnh cũ).
 */
async function resolveImage(formData: FormData): Promise<string | null | undefined | { error: string }> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const result = await uploadProductImage(file);
    return "error" in result ? result : result.url;
  }

  const raw = formData.get("imageUrl");
  if (typeof raw !== "string") return undefined;

  const url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) {
    return { error: "Link ảnh phải bắt đầu bằng http:// hoặc https://" };
  }
  return url;
}

export async function createProduct(_prevState: string | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const emoji = String(formData.get("emoji") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return "Vui lòng nhập tên trái cây.";
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    return "Vui lòng chọn danh mục.";
  }

  const image = await resolveImage(formData);
  if (image && typeof image === "object") return image.error;

  const last = await prisma.product.findFirst({ orderBy: { sortOrder: "desc" } });

  await prisma.product.create({
    data: {
      name,
      category,
      emoji: emoji || "🍎",
      description: description || null,
      imageUrl: image ?? null,
      // Quy cách và giá để trống ở bước tạo nhanh — giá bán tính theo cỡ hộp,
      // không theo từng loại trái, nên hai ô này chỉ còn ý nghĩa lịch sử.
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
  if (!emoji || !name) return "Vui lòng điền icon và tên trái cây.";

  const image = await resolveImage(formData);
  if (image && typeof image === "object") return image.error;

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
      ...(image === undefined ? {} : { imageUrl: image }),
    },
  });

  revalidateAll();
}

export async function deleteProduct(id: string) {
  // Xoá trái cây kéo theo mọi dòng thực đơn và nhật ký kho của nó
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
    // Đã có trong thực đơn hôm nay thì không đụng vào.
    update: {},
    create: {
      productId,
      date,
      // Ba cột này thuộc mô hình cũ (định lượng gắn theo ngày), sẽ được xoá ở
      // nhịp thu hẹp. Tồn kho thật nằm ở Product.stockGrams.
      priceToday: parseVnd(product.price),
      qtyGrams: product.stockGrams,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  revalidateAll();
}

export async function removeFromTodayMenu(entryId: string) {
  await prisma.dailyMenuEntry.delete({ where: { id: entryId } });
  revalidateAll();
}

/**
 * Ghi lại thứ tự sau khi kéo thả. Nhận nguyên mảng id theo đúng thứ tự mới
 * thay vì "đổi chỗ hai dòng" — kéo một dòng từ cuối lên đầu chỉ là một lần
 * gọi, và dữ liệu cũ có sortOrder trùng nhau cũng được ghi lại cho sạch.
 */
export async function reorderTodayMenu(orderedEntryIds: string[]) {
  await prisma.$transaction(
    orderedEntryIds.map((id, index) =>
      prisma.dailyMenuEntry.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidateAll();
}
