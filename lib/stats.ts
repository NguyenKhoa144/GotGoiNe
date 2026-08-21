import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";

export type WeekBucket = {
  label: string;
  soldGrams: number;
};

export type TopProduct = {
  id: string;
  name: string;
  emoji: string;
  soldGrams: number;
  spoiledGrams: number;
};

export type ReasonBucket = {
  reason: string;
  amountGrams: number;
};

export type MonthStats = {
  stockedGrams: number;
  soldGrams: number;
  spoiledGrams: number;
  spoilRate: number | null;
  sellThrough: number | null;
  activeDays: number;
  weeks: WeekBucket[];
  topProducts: TopProduct[];
  reasons: ReasonBucket[];
};

/** "2026-08" -> mốc đầu và đầu tháng kế, theo quy ước ngày 00:00 UTC. */
export function monthRange(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function currentMonthKey(): string {
  const today = vnToday();
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `Tháng ${Number(month)}/${year}`;
}

/** Các tháng đã từng có thực đơn, mới nhất trước. */
export async function getAvailableMonths(): Promise<string[]> {
  const rows = await prisma.dailyMenuEntry.findMany({
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const keys = new Set<string>();
  for (const row of rows) {
    keys.add(
      `${row.date.getUTCFullYear()}-${String(row.date.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }
  // Luôn có tháng hiện tại trong danh sách, kể cả khi chưa bán ngày nào.
  keys.add(currentMonthKey());

  return [...keys].sort().reverse();
}

/** Chia tháng thành các tuần cố định 1-7, 8-14, 15-21, 22-28, 29-hết tháng. */
function weekIndexOf(day: number): number {
  return Math.min(4, Math.floor((day - 1) / 7));
}

export async function getMonthStats(monthKey: string): Promise<MonthStats> {
  const { start, end } = monthRange(monthKey);

  const [entries, losses] = await Promise.all([
    prisma.dailyMenuEntry.findMany({
      where: { date: { gte: start, lt: end } },
      include: { product: true },
    }),
    prisma.inventoryLoss.findMany({
      where: { date: { gte: start, lt: end } },
    }),
  ]);

  const stockedGrams = entries.reduce((sum, e) => sum + e.qtyGrams, 0);
  const soldGrams = entries.reduce((sum, e) => sum + e.soldGrams, 0);
  const spoiledGrams = entries.reduce((sum, e) => sum + e.spoiledGrams, 0);

  // Lưu ý: hàng tồn được chuyển tiếp sang hôm sau nên cùng một ký trái cây có
  // thể được đếm vào "đã nhập" của nhiều ngày. Vì vậy tỷ lệ dưới đây là so
  // với lượng bày bán mỗi ngày, không phải lượng nhập mới trong tháng.
  const spoilRate = stockedGrams > 0 ? spoiledGrams / stockedGrams : null;
  const sellThrough = stockedGrams > 0 ? soldGrams / stockedGrams : null;

  const activeDays = new Set(entries.map((e) => e.date.getTime())).size;

  const weeks: WeekBucket[] = [
    { label: "T1", soldGrams: 0 },
    { label: "T2", soldGrams: 0 },
    { label: "T3", soldGrams: 0 },
    { label: "T4", soldGrams: 0 },
    { label: "T5", soldGrams: 0 },
  ];
  for (const entry of entries) {
    weeks[weekIndexOf(entry.date.getUTCDate())].soldGrams += entry.soldGrams;
  }

  const byProduct = new Map<string, TopProduct>();
  for (const entry of entries) {
    const current = byProduct.get(entry.productId) ?? {
      id: entry.productId,
      name: entry.product.name,
      emoji: entry.product.emoji,
      soldGrams: 0,
      spoiledGrams: 0,
    };
    current.soldGrams += entry.soldGrams;
    current.spoiledGrams += entry.spoiledGrams;
    byProduct.set(entry.productId, current);
  }
  const topProducts = [...byProduct.values()]
    .filter((p) => p.soldGrams > 0 || p.spoiledGrams > 0)
    .sort((a, b) => b.soldGrams - a.soldGrams);

  const byReason = new Map<string, number>();
  for (const loss of losses) {
    byReason.set(loss.reason, (byReason.get(loss.reason) ?? 0) + loss.amountGrams);
  }
  const reasons = [...byReason.entries()]
    .map(([reason, amountGrams]) => ({ reason, amountGrams }))
    .sort((a, b) => b.amountGrams - a.amountGrams);

  return {
    stockedGrams,
    soldGrams,
    spoiledGrams,
    spoilRate,
    sellThrough,
    activeDays,
    weeks,
    topProducts,
    reasons,
  };
}
