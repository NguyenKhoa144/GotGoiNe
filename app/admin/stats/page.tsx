import { MonthPicker } from "@/components/admin/month-picker";
import { formatGrams } from "@/lib/qty";
import {
  currentMonthKey,
  formatMonthLabel,
  getAvailableMonths,
  getMonthStats,
} from "@/lib/stats";

export const dynamic = "force-dynamic";

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ thang?: string }>;
}) {
  const { thang } = await searchParams;
  const months = await getAvailableMonths();
  const selected = thang && months.includes(thang) ? thang : currentMonthKey();
  const stats = await getMonthStats(selected);

  const maxWeek = Math.max(...stats.weeks.map((w) => w.soldGrams), 1);
  const maxProduct = Math.max(...stats.topProducts.map((p) => p.soldGrams), 1);
  const hasData = stats.stockedGrams > 0;

  const kpi = "rounded-[14px] border border-neutral-200 bg-white p-4";
  const card = "rounded-[14px] border border-neutral-200 bg-white p-5";

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#152b1a]">Thống kê theo tháng</h1>
          <p className="text-sm text-neutral-500">
            {stats.activeDays} ngày có bán trong {formatMonthLabel(selected).toLowerCase()}
          </p>
        </div>
        <MonthPicker
          months={months.map((key) => ({ key, label: formatMonthLabel(key) }))}
          selected={selected}
        />
      </div>

      {!hasData ? (
        <div className={`${card} text-center text-sm text-neutral-500`}>
          Chưa có dữ liệu bán hàng trong {formatMonthLabel(selected).toLowerCase()}.
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
            <div className={kpi}>
              <div className="text-[11px] text-neutral-500">Đã bán</div>
              <div className="text-xl font-bold text-[#1e5c2e]">
                {formatGrams(stats.soldGrams)}
              </div>
            </div>
            <div className={kpi}>
              <div className="text-[11px] text-neutral-500">Tổng bày bán</div>
              <div className="text-xl font-bold text-[#152b1a]">
                {formatGrams(stats.stockedGrams)}
              </div>
            </div>
            <div className={kpi}>
              <div className="text-[11px] text-neutral-500">Hao hụt</div>
              <div className="text-xl font-bold text-[#152b1a]">
                {formatGrams(stats.spoiledGrams)}
              </div>
              <div className="text-[11px] text-neutral-500">
                {percent(stats.spoilRate)} lượng bày bán
              </div>
            </div>
            <div className={kpi}>
              <div className="text-[11px] text-neutral-500">Tỷ lệ bán được</div>
              <div className="text-xl font-bold text-[#152b1a]">
                {percent(stats.sellThrough)}
              </div>
            </div>
          </div>

          <section className={`${card} mb-4`}>
            <h2 className="mb-3 text-sm font-bold text-[#152b1a]">Lượng bán theo tuần</h2>
            <div className="flex h-[160px] items-end gap-3">
              {stats.weeks.map((week) => (
                <div key={week.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="text-[11px] font-semibold text-neutral-600">
                    {week.soldGrams > 0 ? formatGrams(week.soldGrams) : ""}
                  </div>
                  <div
                    className="w-full rounded-t-md bg-[#1e5c2e]"
                    style={{
                      height: `${Math.max(2, (week.soldGrams / maxWeek) * 110)}px`,
                      opacity: week.soldGrams > 0 ? 1 : 0.15,
                    }}
                  />
                  <div className="text-[11px] text-neutral-500">{week.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-neutral-500">
              T1 = ngày 1-7, T2 = 8-14, T3 = 15-21, T4 = 22-28, T5 = 29 đến hết tháng.
            </p>
          </section>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            <section className={card}>
              <h2 className="mb-3 text-sm font-bold text-[#152b1a]">Bán chạy nhất</h2>
              {stats.topProducts.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">
                  Chưa ghi nhận lượt bán nào.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-2.5">
                      <span className="text-xl">{product.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-semibold text-[#152b1a]">
                          {product.name}
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100">
                          <div
                            className="h-1.5 rounded-full bg-[#1e5c2e]"
                            style={{ width: `${(product.soldGrams / maxProduct) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-bold text-[#1e5c2e]">
                          {formatGrams(product.soldGrams)}
                        </div>
                        {product.spoiledGrams > 0 ? (
                          <div className="text-[10.5px] text-orange-600">
                            hỏng {formatGrams(product.spoiledGrams)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={card}>
              <h2 className="mb-3 text-sm font-bold text-[#152b1a]">Hao hụt theo lý do</h2>
              {stats.reasons.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">
                  Tháng này chưa ghi nhận hao hụt nào.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.reasons.map((reason) => (
                    <div key={reason.reason} className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                        {reason.reason}
                      </span>
                      <span className="text-[12px] font-bold text-[#152b1a]">
                        {formatGrams(reason.amountGrams)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
            Hàng còn tồn được chuyển sang ngày hôm sau, nên cùng một lượng trái cây có thể được
            tính vào &quot;tổng bày bán&quot; của nhiều ngày. Vì vậy các tỷ lệ ở trên so với lượng
            bày bán mỗi ngày, không phải lượng nhập mới trong tháng.
          </p>
        </>
      )}
    </div>
  );
}
