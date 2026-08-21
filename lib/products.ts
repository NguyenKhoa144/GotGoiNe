import { prisma } from "@/lib/prisma";
import type { Product } from "@/data/home";

export async function getActiveProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { available: true },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    emoji: row.emoji,
    name: row.name,
    weight: row.weight,
    price: row.price,
    badge: row.badge ?? undefined,
    featured: row.featured,
    description: row.description ?? undefined,
  }));
}
