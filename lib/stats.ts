import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";

/**
 * Thống kê theo tháng, tính TỪ SỔ CÁI `StockMovement`.
 *
 * Trước 2026-09-13 file này cộng `DailyMenuEntry.qtyGrams/soldGrams/
 * spoiledGrams`. Từ đợt tách tồn kho ra khỏi thực đơn (21/08) bốn cột đó đã
 * nghỉ hưu và không còn ai ghi vào — nên mọi con số trên tab Thống kê đều
 * bằng 0 dù quán vẫn bán bình thường. Giờ mọi con số đều lấy từ các dòng
 * `StockMovement`, đúng nguyên tắc "sổ cái là nguồn sự thật" của dự án.
 */

export type WeekBucket = {
  label: string;
  soldGrams: number;
};

export type TopProduct = {
  id: string;
  name: string;
  emoji: string;
  soldGrams: number;
  lostGrams: number;
};

export type ReasonBucket = {
  reason: string;
  amountGrams: number;
};

export type MonthStats = {
  /** Tổng gram nhập vào tủ trong tháng (các dòng IMPORT). */
  importedGrams: number;
  /** Tổng gram bán ra trong tháng (các dòng SALE). */
  soldGrams: number;
  /** Tổng gram hao hụt trong tháng (các dòng LOSS). */
  lostGrams: number;
  /**
   * Tổng chênh lệch của các lần cân chỉnh tay (ADJUST), có thể âm. Tách
   * riêng vì đây không phải bán cũng không phải hao — nhập nhằng vào hai
   * nhóm kia là làm sai cả hai.
   */
  adjustedGrams: number;
  /** Hao hụt / lượng nhập trong tháng. `null` khi tháng chưa nhập gì. */
  lossRate: number | null;
  /** Bán ra / lượng nhập trong tháng. `null` khi tháng chưa nhập gì. */
  sellThrough: number | null;
  /** Số ngày khác nhau có ít nhất một lần bán. */
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

function monthKeyOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Các tháng đã từng có biến động kho, mới nhất trước.
 *
 * Lấy theo `StockMovement` chứ không theo `DailyMenuEntry`: những tháng chỉ
 * có thực đơn mà không có dòng sổ cái nào thì mọi số ở đây đều bằng 0, đưa
 * vào danh sách chỉ làm người xem tưởng tháng đó ế.
 */
export async function getAvailableMonths(): Promise<string[]> {
  const rows = await prisma.stockMovement.findMany({
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const keys = new Set(rows.map((row) => monthKeyOf(row.date)));
  // Luôn có tháng hiện tại trong danh sách, kể cả khi chưa phát sinh gì.
  keys.add(currentMonthKey());

  return [...keys].sort().reverse();
}

/** Chia tháng thành các tuần cố định 1-7, 8-14, 15-21, 22-28, 29-hết tháng. */
function weekIndexOf(day: number): number {
  return Math.min(4, Math.floor((day - 1) / 7));
}

export async function getMonthStats(monthKey: string): Promise<MonthStats> {
  const { start, end } = monthRange(monthKey);

  const movements = await prisma.stockMovement.findMany({
    where: { date: { gte: start, lt: end } },
    include: { product: true },
    orderBy: { date: "asc" },
  });

  let importedGrams = 0;
  let soldGrams = 0;
  let lostGrams = 0;
  let adjustedGrams = 0;

  const saleDays = new Set<number>();
  const weeks: WeekBucket[] = [
    { label: "T1", soldGrams: 0 },
    { label: "T2", soldGrams: 0 },
    { label: "T3", soldGrams: 0 },
    { label: "T4", soldGrams: 0 },
    { label: "T5", soldGrams: 0 },
  ];
  const byProduct = new Map<string, TopProduct>();
  const byReason = new Map<string, number>();

  for (const movement of movements) {
    switch (movement.kind) {
      case "IMPORT":
        importedGrams += movement.amountGrams;
        break;
      case "SALE":
        soldGrams += movement.amountGrams;
        saleDays.add(movement.date.getTime());
        weeks[weekIndexOf(movement.date.getUTCDate())].soldGrams += movement.amountGrams;
        break;
      case "LOSS":
        lostGrams += movement.amountGrams;
        // `reason` là bắt buộc với LOSS, nhưng dữ liệu cũ có thể thiếu.
        byReason.set(
          movement.reason ?? "Không ghi lý do",
          (byReason.get(movement.reason ?? "Không ghi lý do") ?? 0) + movement.amountGrams
        );
        break;
      case "ADJUST":
        // ADJUST dùng `deltaGrams` vì đây là loại duy nhất được mang dấu âm.
        adjustedGrams += movement.deltaGrams;
        break;
    }

    if (movement.kind !== "SALE" && movement.kind !== "LOSS") continue;

    const current = byProduct.get(movement.productId) ?? {
      id: movement.productId,
      name: movement.product.name,
      emoji: movement.product.emoji,
      soldGrams: 0,
      lostGrams: 0,
    };
    if (movement.kind === "SALE") current.soldGrams += movement.amountGrams;
    else current.lostGrams += movement.amountGrams;
    byProduct.set(movement.productId, current);
  }

  const topProducts = [...byProduct.values()].sort((a, b) => b.soldGrams - a.soldGrams);

  const reasons = [...byReason.entries()]
    .map(([reason, amountGrams]) => ({ reason, amountGrams }))
    .sort((a, b) => b.amountGrams - a.amountGrams);

  return {
    importedGrams,
    soldGrams,
    lostGrams,
    adjustedGrams,
    lossRate: importedGrams > 0 ? lostGrams / importedGrams : null,
    sellThrough: importedGrams > 0 ? soldGrams / importedGrams : null,
    activeDays: saleDays.size,
    weeks,
    topProducts,
    reasons,
  };
}
