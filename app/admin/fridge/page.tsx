import { prisma } from "@/lib/prisma";
import { addDays, formatShortDate, formatVnDate, vnToday } from "@/lib/date-vn";
import { SpoilageForm } from "@/components/admin/spoilage-form";
import { formatGrams } from "@/lib/qty";

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

  // Mọi định lượng đều là gram nên cộng gộp được trực tiếp.
  const todayLosses = weekLosses.filter((loss) => loss.date.getTime() === today.getTime());
  const todayLossGrams = todayLosses.reduce((sum, loss) => sum + loss.amountGrams, 0);
  const weekLossGrams = weekLosses.reduce((sum, loss) => sum + loss.amountGrams, 0);

  // Hư hỏng trên tổng lượng nhập của hôm nay — con số này mới cho biết hao hụt
  // là nhiều hay ít, vì 500g hỏng trên 1kg khác hẳn 500g hỏng trên 20kg.
  const stockedToday = entries.reduce((sum, e) => sum + e.qtyGrams, 0);
  const spoiledToday = entries.reduce((sum, e) => sum + e.spoiledGrams, 0);
  const spoilRateToday =
    stockedToday > 0 ? `${((spoiledToday / stockedToday) * 100).toFixed(1)}%` : "—";

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
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(todayLossGrams)}</div>
          <div className="text-[11px] text-neutral-500">{todayLosses.length} lượt ghi nhận</div>
        </div>
        <div className={kpi}>
          <div className="text-[11px] text-neutral-500">Hao hụt 7 ngày qua</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(weekLossGrams)}</div>
          <div className="text-[11px] text-neutral-500">{weekLosses.length} lượt ghi nhận</div>
        </div>
        <div className={kpi}>
          <div className="text-[11px] text-neutral-500">Tỷ lệ hao hụt hôm nay</div>
          <div className="text-xl font-bold text-[#152b1a]">{spoilRateToday}</div>
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
                      Nhập <strong className="text-[#152b1a]">{formatGrams(entry.qtyGrams)}</strong>
                    </span>
                    <span>
                      Đã bán <strong className="text-[#152b1a]">{formatGrams(entry.soldGrams)}</strong>
                    </span>
                    <span>
                      Hư hỏng{" "}
                      <strong className={entry.spoiledGrams > 0 ? "text-orange-600" : "text-[#152b1a]"}>
                        {formatGrams(entry.spoiledGrams)}
                      </strong>
                    </span>
                    <span>
                      Còn lại{" "}
                      <strong className={remaining > 0 ? "text-[#1e5c2e]" : "text-neutral-400"}>
                        {formatGrams(remaining)}
                      </strong>
                    </span>
                  </div>
                  <SpoilageForm productId={entry.productId} />
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
                  {formatGrams(loss.amountGrams)}
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
