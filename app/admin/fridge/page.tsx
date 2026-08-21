import { prisma } from "@/lib/prisma";
import { addDays, formatShortDate, formatVnDate, vnToday } from "@/lib/date-vn";
import { FridgeRow, type FridgeItem } from "@/components/admin/fridge-row";
import { FridgeStats, type MovementView } from "@/components/admin/fridge-stats";
import type { MovementKind } from "@/lib/stock";

export const dynamic = "force-dynamic";

/** "2026-08-21" — khoá ngày để so sánh ở phía trình duyệt mà không lo múi giờ. */
function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function AdminFridgePage() {
  const today = vnToday();
  const weekAgo = addDays(today, -6);

  const [products, todayEntries, movements] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.dailyMenuEntry.findMany({ where: { date: today }, select: { productId: true } }),
    prisma.stockMovement.findMany({
      where: { date: { gte: weekAgo } },
      include: { product: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const onMenu = new Set(todayEntries.map((e) => e.productId));

  const items: FridgeItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    category: p.category,
    stockGrams: p.stockGrams,
    onMenuToday: onMenu.has(p.id),
  }));

  const movementViews: MovementView[] = movements.map((m) => ({
    id: m.id,
    productName: m.product.name,
    dateKey: dateKey(m.date),
    dateLabel: formatShortDate(m.date),
    kind: m.kind as MovementKind,
    amountGrams: m.amountGrams,
    deltaGrams: m.deltaGrams,
    reason: m.reason,
    note: m.note,
  }));

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-[#152b1a]">Tủ lạnh</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Đây là số liệu thật của kho — nhập vào bao nhiêu, bán ra bao nhiêu, mất bao nhiêu và vì
        sao. Loại nào về 0 sẽ tự biến mất khỏi thực đơn khách nhìn thấy, nhập lại thì tự hiện
        lại.
      </p>

      <FridgeStats movements={movementViews} todayKey={dateKey(today)} />

      <section className="rounded-[14px] border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-bold text-[#152b1a]">Đang có trong tủ lạnh</h2>
        <p className="mb-3 text-[11px] text-neutral-500">{formatVnDate(today)}</p>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Chưa có loại trái cây nào. Thêm ở tab Daily menu trước.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              // Key gộp cả số tồn: kho đổi thì dòng được dựng lại và ô nhập tự
              // xoá trắng, không phải đồng bộ state bằng useEffect.
              <FridgeRow key={`${item.id}:${item.stockGrams}`} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
