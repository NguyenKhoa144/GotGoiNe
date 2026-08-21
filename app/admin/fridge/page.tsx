import { prisma } from "@/lib/prisma";
import { addDays, formatShortDate, formatVnDate, vnToday } from "@/lib/date-vn";
import { formatVnd } from "@/lib/money";
import { SpoilageForm } from "@/components/admin/spoilage-form";
import { formatQty, qtyUnitLabel, toPriceUnits } from "@/lib/qty";

export const dynamic = "force-dynamic";

export default async function AdminFridgePage() {
  const today = vnToday();
  const weekAgo = addDays(today, -6);

  const [entries, weekLosses] = await Promise.all([
    prisma.dailyMenuEntry.findMany({
      where: { date: today },
      include: { product: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.inventoryLoss.findMany({
      where: { date: { gte: weekAgo } },
      include: { product: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  // Giá trị tổn thất lấy theo giá bán của đúng ngày xảy ra hao hụt; nếu ngày
  // đó không còn dòng thực đơn thì bỏ qua (không đoán giá).
  const priceByProductDate = new Map<string, number>();
  const weekEntries = await prisma.dailyMenuEntry.findMany({
    where: { date: { gte: weekAgo } },
    select: { productId: true, date: true, priceToday: true },
  });
  for (const entry of weekEntries) {
    priceByProductDate.set(`${entry.productId}:${entry.date.getTime()}`, entry.priceToday);
  }

  const lossValue = (loss: (typeof weekLosses)[number]) => {
    const price = priceByProductDate.get(`${loss.productId}:${loss.date.getTime()}`);
    if (price === undefined) return 0;
    return toPriceUnits(loss.amountGrams, loss.product.unit) * price;
  };

  // Không cộng gộp số lượng giữa các đơn vị khác nhau (500g xoài + 2 hộp quà
  // ra "502" là con số vô nghĩa) — chỉ tổng hợp theo số lượt và theo tiền.
  const todayLosses = weekLosses.filter((loss) => loss.date.getTime() === today.getTime());
  const todayLossValue = todayLosses.reduce((sum, loss) => sum + lossValue(loss), 0);
  const weekLossValue = weekLosses.reduce((sum, loss) => sum + lossValue(loss), 0);

  const kpi = "rounded-[14px] border border-neutral-200 bg-white p-4";

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-[#152b1a]">Tủ lạnh</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Hàng hư hỏng phải ghi rõ lý do và bị trừ khỏi lượng còn lại — không tự biến mất khi chốt
        ngày, để cuối tháng còn biết mất bao nhiêu và vì sao.
      </p>

      <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <div className={kpi}>
          <div className="text-[11px] text-neutral-500">Hao hụt hôm nay</div>
          <div className="text-xl font-bold text-[#152b1a]">{todayLosses.length} lượt</div>
          <div className="text-[11px] text-neutral-500">{formatVnd(todayLossValue)}</div>
        </div>
        <div className={kpi}>
          <div className="text-[11px] text-neutral-500">Hao hụt 7 ngày qua</div>
          <div className="text-xl font-bold text-[#152b1a]">{weekLosses.length} lượt</div>
        </div>
        <div className={kpi}>
          <div className="text-[11px] text-neutral-500">Giá trị tổn thất (7 ngày)</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatVnd(weekLossValue)}</div>
        </div>
      </div>

      <section className="mb-4 rounded-[14px] border border-neutral-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-bold text-[#152b1a]">Tồn kho hôm nay</h2>
        <p className="mb-3 text-[11px] text-neutral-500">{formatVnDate(today)}</p>

        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Hôm nay chưa có trái cây nào trong thực đơn.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => {
              const remaining = entry.qtyGrams - entry.soldGrams - entry.spoiledGrams;
              const unit = entry.product.unit;
              return (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center gap-3 rounded-[10px] border border-neutral-200 px-3 py-2"
                >
                  <span className="text-2xl">{entry.product.emoji}</span>
                  <div className="min-w-[110px] flex-1 text-sm font-bold text-[#152b1a]">
                    {entry.product.name}
                  </div>
                  <div className="flex gap-3 text-[11px] text-neutral-600">
                    <span>
                      Nhập <strong className="text-[#152b1a]">{formatQty(entry.qtyGrams, unit)}</strong>
                    </span>
                    <span>
                      Đã bán <strong className="text-[#152b1a]">{formatQty(entry.soldGrams, unit)}</strong>
                    </span>
                    <span>
                      Hư hỏng{" "}
                      <strong className={entry.spoiledGrams > 0 ? "text-orange-600" : "text-[#152b1a]"}>
                        {formatQty(entry.spoiledGrams, unit)}
                      </strong>
                    </span>
                    <span>
                      Còn lại{" "}
                      <strong className={remaining > 0 ? "text-[#1e5c2e]" : "text-neutral-400"}>
                        {formatQty(remaining, unit)}
                      </strong>
                    </span>
                  </div>
                  <SpoilageForm productId={entry.productId} unitLabel={qtyUnitLabel(unit)} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[14px] border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-[#152b1a]">Nhật ký hao hụt (7 ngày gần nhất)</h2>
        {weekLosses.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Chưa ghi nhận hao hụt nào trong 7 ngày qua.
          </p>
        ) : (
          <div className="flex max-h-[320px] flex-col gap-1.5 overflow-y-auto">
            {weekLosses.map((loss) => (
              <div
                key={loss.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-1.5 text-[12px]"
              >
                <span className="w-[42px] shrink-0 text-neutral-500">
                  {formatShortDate(loss.date)}
                </span>
                <span className="flex-1 font-semibold text-[#152b1a]">{loss.product.name}</span>
                <span className="text-neutral-600">
                  {formatQty(loss.amountGrams, loss.product.unit)}
                </span>
                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                  {loss.reason}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
