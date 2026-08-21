import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";
import { formatVnd } from "@/lib/money";
import type { Product } from "@/data/home";

/**
 * Danh sách trái cây khách nhìn thấy trên trang chủ = thực đơn của hôm nay,
 * đã bỏ những loại bán hết (còn lại <= 0). Sản phẩm nằm trong danh sách trái
 * cây nhưng chưa được đưa vào thực đơn hôm nay thì khách không thấy.
 */
export async function getTodayMenu(): Promise<Product[]> {
  const entries = await prisma.dailyMenuEntry.findMany({
    where: { date: vnToday() },
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  });

  return entries
    .filter((entry) => entry.qtyGrams - entry.soldGrams - entry.spoiledGrams > 0)
    .map((entry) => ({
      id: entry.product.id,
      category: entry.product.category,
      emoji: entry.product.emoji,
      name: entry.product.name,
      weight: entry.product.weight,
      price: formatVnd(entry.priceToday),
      badge: entry.product.badge ?? undefined,
      featured: entry.product.featured,
      description: entry.product.description ?? undefined,
    }));
}
