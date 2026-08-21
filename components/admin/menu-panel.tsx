"use client";

import { useState, useTransition } from "react";
import {
  addToTodayMenu,
  removeFromTodayMenu,
  reorderTodayMenu,
} from "@/app/admin/menu/actions";
import { DRAG_TYPE } from "./catalog-panel";
import { formatGrams } from "@/lib/qty";

export type MenuEntryView = {
  id: string;
  productId: string;
  name: string;
  emoji: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  stockGrams: number;
};

type MenuPanelProps = {
  entries: MenuEntryView[];
  todayLabel: string;
  /** Thực đơn hôm nay được bê nguyên từ hôm qua, admin chưa xem lại. */
  carriedFromYesterday: boolean;
};

export function MenuPanel({ entries, todayLabel, carriedFromYesterday }: MenuPanelProps) {
  const [pending, startTransition] = useTransition();
  // Thứ tự đang hiển thị trong lúc kéo. `null` = dùng đúng thứ tự từ máy chủ.
  const [order, setOrder] = useState<MenuEntryView[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const rows = order ?? entries;
  const visibleCount = rows.filter((e) => e.stockGrams > 0).length;

  const addProduct = (productId: string) => {
    startTransition(async () => {
      await addToTodayMenu(productId);
    });
  };

  const remove = (entryId: string) => {
    startTransition(async () => {
      await removeFromTodayMenu(entryId);
    });
  };

  /** Kéo một thẻ từ bảng "Trái cây tổng" thả vào đây. */
  const onDropFromCatalog = (e: React.DragEvent) => {
    setDropActive(false);
    const productId = e.dataTransfer.getData(DRAG_TYPE);
    if (!productId) return;
    e.preventDefault();
    addProduct(productId);
  };

  /** Kéo đổi thứ tự trong chính bảng này. */
  const onRowDragOver = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setOrder(next);
    setDragIndex(index);
  };

  const commitOrder = () => {
    setDragIndex(null);
    if (!order) return;
    const ids = order.map((e) => e.id);
    startTransition(async () => {
      await reorderTodayMenu(ids);
      // Thả state cục bộ để lần vẽ sau lấy lại thứ tự từ máy chủ — nếu giữ
      // lại, mọi thay đổi từ máy khác sẽ bị thứ tự cũ trong đầu che mất.
      setOrder(null);
    });
  };

  return (
    <section
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_TYPE)) {
          e.preventDefault();
          setDropActive(true);
        }
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={onDropFromCatalog}
      className={`rounded-[14px] border bg-white p-5 transition-colors ${
        dropActive ? "border-[#1e5c2e] bg-[#f6fbf0]" : "border-neutral-200"
      }`}
    >
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#152b1a]">Thực đơn hôm nay</h2>
          <p className="text-[11px] text-neutral-500">{todayLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-neutral-500">Khách đang thấy</div>
          <div className="text-sm font-bold text-[#1e5c2e]">{visibleCount} loại</div>
        </div>
      </div>

      <p className="mb-3 text-[11px] text-neutral-500">
        {rows.length} loại trong thực đơn · loại nào hết hàng trong tủ lạnh sẽ tự ẩn khỏi trang
        khách
      </p>

      {carriedFromYesterday ? (
        <div className="mb-3 rounded-[10px] border border-[#f5a800] bg-[#fdf6e0] px-3 py-2 text-[12px] text-[#7a5400]">
          <strong>Thực đơn này đang y nguyên từ hôm qua.</strong> Xem lại xem hôm nay còn bán
          đúng những loại này không, gỡ bớt hoặc thêm loại mới nếu cần.
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div
          className={`rounded-[10px] border border-dashed px-4 py-10 text-center text-sm ${
            dropActive ? "border-[#1e5c2e] text-[#1e5c2e]" : "border-neutral-300 text-neutral-500"
          }`}
        >
          Chưa có trái cây nào trong thực đơn hôm nay.
          <br />
          Kéo một loại từ bảng bên trái thả vào đây, hoặc bấm <strong>“+ Thêm”</strong>.
        </div>
      ) : (
        <div className={`flex flex-col gap-2 ${pending ? "opacity-60" : ""}`}>
          {rows.map((entry, index) => {
            const empty = entry.stockGrams <= 0;
            return (
              <div
                key={entry.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  onRowDragOver(index);
                }}
                onDragEnd={commitOrder}
                className={`flex cursor-grab items-center gap-3 rounded-[10px] border px-2.5 py-2 active:cursor-grabbing ${
                  dragIndex === index ? "border-[#1e5c2e] bg-[#f6fbf0]" : "border-neutral-200"
                }`}
              >
                <span className="w-4 shrink-0 text-center text-[11px] text-neutral-400">
                  {index + 1}
                </span>

                <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f0f9e1] text-2xl">
                  {entry.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.imageUrl}
                      alt={entry.name}
                      className={`h-full w-full object-cover ${empty ? "grayscale" : ""}`}
                    />
                  ) : (
                    <span className={empty ? "opacity-35 grayscale" : ""}>{entry.emoji}</span>
                  )}
                </div>

                <div className="min-w-[120px] flex-1">
                  <div className="text-sm font-bold text-[#152b1a]">{entry.name}</div>
                  <div className="line-clamp-2 text-[11px] leading-tight text-neutral-500">
                    {entry.description ?? entry.category}
                  </div>
                </div>

                {empty ? (
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                    Hết hàng · khách không thấy
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-[#e6f4d8] px-2 py-0.5 text-[11px] font-semibold text-[#1e5c2e]">
                    Còn {formatGrams(entry.stockGrams)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  disabled={pending}
                  aria-label={`Gỡ ${entry.name} khỏi thực đơn hôm nay`}
                  className="rounded-md px-2 py-1 text-lg leading-none text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
