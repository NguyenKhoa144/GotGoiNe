"use client";

import { useState, useTransition } from "react";
import {
  moveMenuEntry,
  removeFromTodayMenu,
  updateMenuEntry,
} from "@/app/admin/products/actions";
import { formatVnd } from "@/lib/money";

export type MenuEntryView = {
  id: string;
  productId: string;
  name: string;
  emoji: string;
  category: string;
  unit: string;
  priceToday: number;
  qtyGrams: number;
  soldGrams: number;
  spoiledGrams: number;
};

/** Nhãn đơn vị định lượng: hàng cân bán theo gram, còn lại giữ đơn vị gốc. */
function qtyUnit(unit: string) {
  return unit === "kg" ? "g" : unit;
}

function MenuRow({ entry, isFirst, isLast }: { entry: MenuEntryView; isFirst: boolean; isLast: boolean }) {
  const [price, setPrice] = useState(entry.priceToday);
  const [qty, setQty] = useState(entry.qtyGrams);
  const [sold, setSold] = useState(entry.soldGrams);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remaining = qty - sold - entry.spoiledGrams;

  const save = (patch: { priceToday?: number; qtyGrams?: number; soldGrams?: number }) => {
    startTransition(async () => {
      const result = await updateMenuEntry(entry.id, patch);
      setError(result ?? null);
    });
  };

  const remove = () => {
    startTransition(async () => {
      await removeFromTodayMenu(entry.id);
    });
  };

  const move = (direction: "up" | "down") => {
    startTransition(async () => {
      await moveMenuEntry(entry.id, direction);
    });
  };

  const numberInput =
    "w-full rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-[#1e5c2e]";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-[10px] border px-2.5 py-2 ${
        error ? "border-red-300 bg-red-50" : "border-neutral-200"
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => move("up")}
          disabled={isFirst || pending}
          aria-label="Chuyển lên trên"
          className="px-1 text-[10px] leading-tight text-neutral-500 hover:text-[#1e5c2e] disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => move("down")}
          disabled={isLast || pending}
          aria-label="Chuyển xuống dưới"
          className="px-1 text-[10px] leading-tight text-neutral-500 hover:text-[#1e5c2e] disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-[#f0f9e1] text-2xl">
        {entry.emoji}
      </div>

      <div className="min-w-[120px] flex-1">
        <div className="text-sm font-bold text-[#152b1a]">{entry.name}</div>
        <div className="text-[11px] text-neutral-500">{entry.category}</div>
      </div>

      <label className="w-[110px] text-[11px] font-semibold text-neutral-600">
        Giá / {entry.unit}
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onBlur={() => price !== entry.priceToday && save({ priceToday: price })}
          className={numberInput}
        />
      </label>

      <label className="w-[100px] text-[11px] font-semibold text-neutral-600">
        Nhập ({qtyUnit(entry.unit)})
        <input
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          onBlur={() => qty !== entry.qtyGrams && save({ qtyGrams: qty })}
          className={numberInput}
        />
      </label>

      <label className="w-[100px] text-[11px] font-semibold text-neutral-600">
        Đã bán ({qtyUnit(entry.unit)})
        <input
          type="number"
          min={0}
          value={sold}
          onChange={(e) => setSold(Number(e.target.value))}
          onBlur={() => sold !== entry.soldGrams && save({ soldGrams: sold })}
          className={numberInput}
        />
      </label>

      <div className="w-[92px] text-[11px] font-semibold text-neutral-600">
        Còn lại
        <div
          className={`text-sm font-bold ${remaining > 0 ? "text-[#1e5c2e]" : "text-neutral-400"}`}
        >
          {remaining}
          {qtyUnit(entry.unit)}
        </div>
      </div>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label={`Gỡ ${entry.name} khỏi thực đơn hôm nay`}
        className="rounded-md px-2 py-1 text-lg leading-none text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        ×
      </button>

      {error ? <p className="w-full text-[11px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

type MenuPanelProps = {
  entries: MenuEntryView[];
  todayLabel: string;
};

export function MenuPanel({ entries, todayLabel }: MenuPanelProps) {
  const revenueSoFar = entries.reduce((sum, e) => {
    const factor = e.unit === "kg" ? e.soldGrams / 1000 : e.soldGrams;
    return sum + factor * e.priceToday;
  }, 0);

  return (
    <section className="rounded-[14px] border border-neutral-200 bg-white p-5">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#152b1a]">Thực đơn hôm nay</h2>
          <p className="text-[11px] text-neutral-500">{todayLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-neutral-500">Doanh thu tạm tính</div>
          <div className="text-sm font-bold text-[#1e5c2e]">{formatVnd(revenueSoFar)}</div>
        </div>
      </div>

      <p className="mb-3 text-[11px] text-neutral-500">
        {entries.length} loại đang bán · hàng còn tồn sẽ tự chuyển sang thực đơn ngày mai
      </p>

      {entries.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
          Chưa có trái cây nào trong thực đơn hôm nay.
          <br />
          Bấm <strong>&quot;+ Thêm&quot;</strong> ở danh sách bên trái để đưa vào bán.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            // Key gộp cả số liệu máy chủ: khi dữ liệu đổi (do chính mình lưu,
            // hoặc do máy khác sửa) dòng được dựng lại và ô nhập lấy lại giá
            // trị mới — tránh phải đồng bộ state bằng useEffect.
            <MenuRow
              key={`${entry.id}:${entry.priceToday}:${entry.qtyGrams}:${entry.soldGrams}:${entry.spoiledGrams}`}
              entry={entry}
              isFirst={i === 0}
              isLast={i === entries.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
