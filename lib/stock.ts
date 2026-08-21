import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";
import { formatGrams } from "@/lib/qty";

/**
 * Tủ lạnh — nguồn sự thật duy nhất về việc quán còn bao nhiêu của mỗi loại.
 *
 * Nguyên tắc: KHÔNG nơi nào được ghi thẳng vào `Product.stockGrams`. Mọi thay
 * đổi phải đi qua `applyStockMovement` để luôn có một dòng nhật ký giải thích
 * vì sao kho đổi. Nếu cho phép sửa trần, chỉ cần một lần lỡ tay là con số tồn
 * sai mà không ai truy được nguyên nhân — đúng cái bệnh mà tab Tủ lạnh sinh
 * ra để chữa.
 */

/** Các loại biến động kho. Hướng cộng/trừ do đây quyết định. */
export const MOVEMENT_KINDS = ["IMPORT", "SALE", "LOSS", "ADJUST"] as const;
export type MovementKind = (typeof MOVEMENT_KINDS)[number];

/** Nhãn tiếng Việt để hiển thị trong nhật ký. */
export const MOVEMENT_LABELS: Record<MovementKind, string> = {
  IMPORT: "Nhập hàng",
  SALE: "Bán ra",
  LOSS: "Hao hụt",
  ADJUST: "Cân chỉnh",
};

/** IMPORT cộng vào kho, SALE và LOSS trừ đi. ADJUST tự mang dấu riêng. */
function signFor(kind: MovementKind, amountGrams: number): number {
  if (kind === "IMPORT") return amountGrams;
  if (kind === "ADJUST") return amountGrams;
  return -amountGrams;
}

export type StockChange = {
  productId: string;
  kind: MovementKind;
  /**
   * Số gram. Với IMPORT/SALE/LOSS phải là số dương — hướng đã nằm ở `kind`.
   * Riêng ADJUST được phép âm (sửa giảm cho khớp thực tế).
   */
  amountGrams: number;
  reason?: string;
  note?: string;
  /** Ngày ghi sổ theo lịch VN. Mặc định là hôm nay. */
  date?: Date;
};

/**
 * Áp một biến động vào kho: cập nhật `stockGrams` và ghi nhật ký trong cùng
 * một transaction. Tách rời hai việc này là sai — lỗi giữa chừng sẽ để lại
 * kho đã trừ mà không dòng nào giải thích, hoặc ngược lại.
 *
 * Trả về `null` nếu thành công, hoặc chuỗi lỗi tiếng Việt để hiển thị cho admin.
 */
export async function applyStockMovement(change: StockChange): Promise<string | null> {
  const { productId, kind, reason, note } = change;
  const amountGrams = Math.trunc(change.amountGrams);

  if (!Number.isFinite(amountGrams) || amountGrams === 0) {
    return "Số gram phải khác 0.";
  }
  if (kind !== "ADJUST" && amountGrams < 0) {
    return "Số gram phải là số dương.";
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return "Không tìm thấy loại trái cây này.";

  const delta = signFor(kind, amountGrams);
  const next = product.stockGrams + delta;

  // Chặn ở đây thay vì để tồn kho âm: tồn âm là con số vô nghĩa, và một khi
  // đã lọt vào database thì mọi thống kê phía sau đều sai theo.
  if (next < 0) {
    return `Tủ lạnh chỉ còn ${formatGrams(product.stockGrams)}, không thể trừ ${formatGrams(Math.abs(delta))}.`;
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stockGrams: next },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        date: change.date ?? vnToday(),
        kind,
        amountGrams: Math.abs(amountGrams),
        deltaGrams: delta,
        reason: reason?.trim() || null,
        note: note?.trim() || null,
      },
    }),
  ]);

  return null;
}

/**
 * Áp nhiều biến động cùng lúc — dùng khi chốt một đơn hàng có nhiều loại trái.
 * Kiểm tra đủ hàng cho TẤT CẢ các loại trước, rồi mới ghi: một hộp thiếu mất
 * một loại thì cả đơn không chốt được, chứ không trừ được nửa chừng rồi kẹt.
 */
export async function applyStockMovements(changes: StockChange[]): Promise<string | null> {
  if (changes.length === 0) return "Chưa có loại trái cây nào để trừ kho.";

  const products = await prisma.product.findMany({
    where: { id: { in: changes.map((c) => c.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Gộp trước theo loại, phòng khi cùng một loại xuất hiện hai lần trong đơn.
  const totalDelta = new Map<string, number>();
  for (const change of changes) {
    const amount = Math.trunc(change.amountGrams);
    if (!Number.isFinite(amount) || amount === 0) return "Số gram phải khác 0.";
    if (change.kind !== "ADJUST" && amount < 0) return "Số gram phải là số dương.";

    const product = byId.get(change.productId);
    if (!product) return "Không tìm thấy loại trái cây này.";

    totalDelta.set(
      change.productId,
      (totalDelta.get(change.productId) ?? 0) + signFor(change.kind, amount)
    );
  }

  for (const [productId, delta] of totalDelta) {
    const product = byId.get(productId)!;
    if (product.stockGrams + delta < 0) {
      return `${product.name}: tủ lạnh chỉ còn ${formatGrams(product.stockGrams)}, không đủ để trừ ${formatGrams(Math.abs(delta))}.`;
    }
  }

  const date = vnToday();
  await prisma.$transaction([
    ...Array.from(totalDelta, ([productId, delta]) =>
      prisma.product.update({
        where: { id: productId },
        data: { stockGrams: { increment: delta } },
      })
    ),
    ...changes.map((change) =>
      prisma.stockMovement.create({
        data: {
          productId: change.productId,
          date: change.date ?? date,
          kind: change.kind,
          amountGrams: Math.abs(Math.trunc(change.amountGrams)),
          deltaGrams: signFor(change.kind, Math.trunc(change.amountGrams)),
          reason: change.reason?.trim() || null,
          note: change.note?.trim() || null,
        },
      })
    ),
  ]);

  return null;
}
