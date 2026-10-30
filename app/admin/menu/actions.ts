"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { vnToday } from "@/lib/date-vn";
import { formatGrams } from "@/lib/qty";
import { OPEN_ORDER_STATUSES } from "@/lib/order-rules";
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
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const emoji = String(formData.get("emoji") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return "Vui lòng nhập tên trái cây.";
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
    return "Vui lòng chọn danh mục.";
  }

  // Tạo mới một loại trùng tên với loại đã ẩn là tách đôi lịch sử của nó:
  // thống kê sẽ có hai dòng "Xoài cát" riêng. Bỏ ẩn loại cũ thì nối liền.
  const archivedTwin = await prisma.product.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, archivedAt: { not: null } },
  });
  if (archivedTwin) {
    return `"${archivedTwin.name}" đang nằm trong mục Đã ẩn. Bỏ ẩn loại đó để giữ liền lịch sử, thay vì tạo mới.`;
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
  await requireAdmin();
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

/**
 * Xoá hẳn — chỉ dành cho loại tạo nhầm, CHƯA có dòng sổ cái nào. Loại đã có
 * lịch sử thì phải ẩn: xoá là kéo theo thống kê các tháng cũ tụt xuống.
 *
 * Database cũng tự chặn (onDelete: Restrict trên StockMovement), nên dù có
 * ai ghi sổ chen vào giữa lúc kiểm tra và lúc xoá, lịch sử vẫn không mất.
 * Trả về `null` nếu thành công, hoặc chuỗi lỗi tiếng Việt.
 */
export async function deleteProduct(id: string): Promise<string | null> {
  await requireAdmin();
  const movements = await prisma.stockMovement.count({ where: { productId: id } });
  if (movements > 0) {
    return "Loại này đã có lịch sử nhập/bán nên không xoá được. Hãy ẩn thay vì xoá.";
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    // P2003: vi phạm khoá nối — có dòng sổ cái vừa được ghi sau lần đếm ở trên.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return "Loại này vừa có lịch sử nhập/bán nên không xoá được. Hãy ẩn thay vì xoá.";
    }
    throw error;
  }

  revalidateAll();
  return null;
}

/**
 * Ẩn một loại: biến khỏi danh mục, thực đơn và trang chủ, nhưng sổ cái và
 * thống kê giữ nguyên. Chỉ ẩn được khi tủ đã về 0 — nếu không, số hàng đó vẫn
 * được tính vào tổng tủ lạnh mà không còn chỗ nào để trừ đi.
 */
export async function archiveProduct(id: string): Promise<string | null> {
  await requireAdmin();
  const date = vnToday();

  const archived = await prisma.$transaction(async (tx) => {
    // Điều kiện `stockGrams: 0` nằm chung câu lệnh với việc ẩn: nhập hàng chen
    // vào đúng lúc này thì việc ẩn tự thất bại, không có loại ẩn mà còn hàng.
    // Cũng không ẩn loại còn nằm trong đơn chưa giao: huỷ đơn đó sẽ phải
    // hoàn hàng về tủ, mà loại đã ẩn thì không nhận hàng được nữa.
    const updated = await tx.product.updateMany({
      where: {
        id,
        archivedAt: null,
        stockGrams: 0,
        orderItems: { none: { order: { status: { in: OPEN_ORDER_STATUSES } } } },
      },
      data: { archivedAt: new Date() },
    });
    if (updated.count === 0) return false;

    // Gỡ khỏi thực đơn hôm nay. Thực đơn các ngày cũ giữ nguyên làm lịch sử.
    await tx.dailyMenuEntry.deleteMany({ where: { productId: id, date } });
    return true;
  });

  if (!archived) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return "Không tìm thấy loại trái cây này.";
    if (product.archivedAt) return null;
    if (product.stockGrams === 0) {
      return `${product.name} còn nằm trong đơn chưa giao. Giao xong hoặc huỷ đơn đó ở tab Đơn hàng trước khi ẩn.`;
    }
    return `Tủ còn ${formatGrams(product.stockGrams)} ${product.name}. Bán hết hoặc ghi hao hụt ở tab Tủ lạnh trước khi ẩn.`;
  }

  revalidateAll();
  return null;
}

export async function unarchiveProduct(id: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { archivedAt: null } });
  revalidateAll();
}

export async function addToTodayMenu(productId: string) {
  await requireAdmin();
  const date = vnToday();
  // Chỉ cần biết loại này có thật hay không; định lượng và giá không còn lấy
  // từ đây nữa (tồn kho nằm ở Product.stockGrams, giá theo cỡ hộp).
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { archivedAt: true },
  });
  if (!product || product.archivedAt) return;

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
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });

  revalidateAll();
}

export async function removeFromTodayMenu(entryId: string) {
  await requireAdmin();
  await prisma.dailyMenuEntry.delete({ where: { id: entryId } });
  revalidateAll();
}

/**
 * Ghi lại thứ tự sau khi kéo thả. Nhận nguyên mảng id theo đúng thứ tự mới
 * thay vì "đổi chỗ hai dòng" — kéo một dòng từ cuối lên đầu chỉ là một lần
 * gọi, và dữ liệu cũ có sortOrder trùng nhau cũng được ghi lại cho sạch.
 */
export async function reorderTodayMenu(orderedEntryIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedEntryIds.map((id, index) =>
      prisma.dailyMenuEntry.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  revalidateAll();
}
