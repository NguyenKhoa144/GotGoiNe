"use client";

import { useMemo, useState } from "react";
import { formatGrams } from "@/lib/qty";
import { MOVEMENT_LABELS, type MovementKind } from "@/lib/stock";

export type MovementView = {
  id: string;
  productName: string;
  /** Ngày dạng "2026-08-21" — so sánh chuỗi cho gọn, khỏi lo múi giờ. */
  dateKey: string;
  dateLabel: string;
  kind: MovementKind;
  amountGrams: number;
  deltaGrams: number;
  reason: string | null;
  note: string | null;
};

type FridgeStatsProps = {
  movements: MovementView[];
  todayKey: string;
};

// Màu nhãn theo loại biến động — nhìn nhật ký là biết ngay hàng vào hay hàng ra.
const KIND_STYLES: Record<MovementKind, string> = {
  IMPORT: "bg-[#e6f4d8] text-[#1e5c2e]",
  SALE: "bg-blue-50 text-blue-700",
  LOSS: "bg-orange-50 text-orange-700",
  ADJUST: "bg-neutral-100 text-neutral-600",
};

/**
 * Số liệu kho gộp vào một nút bật/tắt thay vì bày sẵn bốn thẻ KPI và một nhật
 * ký dài. Việc chính ở tab Tủ lạnh là nhập liệu; số liệu chỉ cần khi muốn xem,
 * bày ra thường trực chỉ làm rối mắt và đẩy danh sách trái cây xuống dưới.
 */
export function FridgeStats({ movements, todayKey }: FridgeStatsProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<"day" | "week">("day");

  const rows = useMemo(
    () => (range === "day" ? movements.filter((m) => m.dateKey === todayKey) : movements),
    [movements, range, todayKey]
  );

  const sum = (kind: MovementKind) =>
    rows.filter((m) => m.kind === kind).reduce((total, m) => total + m.amountGrams, 0);

  const imported = sum("IMPORT");
  const sold = sum("SALE");
  const lost = sum("LOSS");
  const lossCount = rows.filter((m) => m.kind === "LOSS").length;

  // Hao hụt trên lượng nhập — con số này mới cho biết hao hụt là nhiều hay ít,
  // vì 500g hỏng trên 1kg khác hẳn 500g hỏng trên 20kg.
  const lossRate = imported > 0 ? `${((lost / imported) * 100).toFixed(1)}%` : "—";

  const stat = "rounded-[10px] border border-neutral-200 px-3 py-2";
  const tab = "rounded-md px-3 py-1 text-[12px] font-bold transition-colors";

  return (
    <section className="mb-4 rounded-[14px] border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="rounded-lg border border-[#1e5c2e] px-3 py-1.5 text-[12px] font-bold text-[#1e5c2e] transition-colors hover:bg-[#EAF0E3]"
        >
          📊 Thống kê {open ? "▲" : "▼"}
        </button>
      </div>

      {open ? (
        <div className="border-t border-neutral-200 px-5 py-4">
          <div className="mb-3 inline-flex gap-1 rounded-lg bg-neutral-100 p-1">
            <button
              type="button"
              onClick={() => setRange("day")}
              className={`${tab} ${range === "day" ? "bg-white text-[#1e5c2e] shadow-sm" : "text-neutral-500"}`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setRange("week")}
              className={`${tab} ${range === "week" ? "bg-white text-[#1e5c2e] shadow-sm" : "text-neutral-500"}`}
            >
              7 ngày qua
            </button>
          </div>

          <div className="mb-4 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
            <div className={stat}>
              <div className="text-[11px] text-neutral-500">Nhập vào</div>
              <div className="text-base font-bold text-[#1e5c2e]">+{formatGrams(imported)}</div>
            </div>
            <div className={stat}>
              <div className="text-[11px] text-neutral-500">Bán ra</div>
              <div className="text-base font-bold text-blue-700">−{formatGrams(sold)}</div>
            </div>
            <div className={stat}>
              <div className="text-[11px] text-neutral-500">Hao hụt</div>
              <div className="text-base font-bold text-orange-700">−{formatGrams(lost)}</div>
              <div className="text-[11px] text-neutral-500">{lossCount} lượt ghi nhận</div>
            </div>
            <div className={stat}>
              <div className="text-[11px] text-neutral-500">Hao hụt / lượng nhập</div>
              <div className="text-base font-bold text-[#152b1a]">{lossRate}</div>
            </div>
          </div>

          <h3 className="mb-2 text-[12px] font-bold text-[#152b1a]">
            Nhật ký kho{" "}
            <span className="font-medium text-neutral-500">
              ({rows.length} dòng · {range === "day" ? "hôm nay" : "7 ngày qua"})
            </span>
          </h3>

          {rows.length === 0 ? (
            <p className="py-5 text-center text-[12px] text-neutral-500">
              Chưa có biến động nào {range === "day" ? "hôm nay" : "trong 7 ngày qua"}.
            </p>
          ) : (
            <div className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto">
              {rows.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-100 px-3 py-1.5 text-[12px]"
                >
                  <span className="w-[42px] shrink-0 text-neutral-500">{m.dateLabel}</span>
                  <span className="min-w-[110px] flex-1 font-semibold text-[#152b1a]">
                    {m.productName}
                  </span>
                  <span
                    className={`w-[70px] text-right font-bold ${
                      m.deltaGrams > 0 ? "text-[#1e5c2e]" : "text-orange-700"
                    }`}
                  >
                    {m.deltaGrams > 0 ? "+" : "−"}
                    {formatGrams(Math.abs(m.deltaGrams))}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      KIND_STYLES[m.kind] ?? KIND_STYLES.ADJUST
                    }`}
                  >
                    {m.reason ?? MOVEMENT_LABELS[m.kind] ?? m.kind}
                  </span>
                  {m.note ? (
                    <span className="w-full text-[11px] text-neutral-500">{m.note}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
