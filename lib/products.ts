import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";
import { formatVnd } from "@/lib/money";
import type { Product } from "@/data/home";

/**
 * Danh sách trái cây khách nhìn thấy trên trang chủ = thực đơn của hôm nay,
 * đã bỏ những loại tủ lạnh không còn hàng.
 *
 * Hai điều kiện phải cùng đúng: admin đã đưa loại đó vào thực đơn hôm nay
 * (chủ ý bày bán) VÀ tủ lạnh còn hàng (thực tế có mà bán). Nhờ vế thứ hai mà
 * quy tắc "hết ổi thì ổi tự biến mất khỏi trang khách" không cần job nền nào
 * — và nhập ổi mới thì ổi tự hiện lại.
 */
export async function getTodayMenu(): Promise<Product[]> {
  const entries = await prisma.dailyMenuEntry.findMany({
    where: { date: vnToday() },
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  });

  return entries
    .filter((entry) => entry.product.stockGrams > 0)
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
      imageUrl: entry.product.imageUrl ?? undefined,
    }));
}
