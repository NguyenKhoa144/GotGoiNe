"use client";

import { useState, useTransition } from "react";
import { recordFridgeChange } from "@/app/admin/fridge/actions";
import { FRIDGE_ACTIONS, type FridgeActionId } from "@/app/admin/fridge/constants";
import { formatGrams } from "@/lib/qty";

export type FridgeItem = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  stockGrams: number;
  /** Có nằm trong thực đơn hôm nay không — để biết khách có đang thấy loại này. */
  onMenuToday: boolean;
};

export function FridgeRow({ item }: { item: FridgeItem }) {
  const [actionId, setActionId] = useState<FridgeActionId>("import");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const action = FRIDGE_ACTIONS.find((a) => a.id === actionId)!;
  const needsNote = actionId === "other";
  const isRecount = actionId === "recount";
  const empty = item.stockGrams <= 0;

  const submit = () => {
    const grams = Number(amount);
    if (!Number.isFinite(grams) || amount.trim() === "") {
      setError("Vui lòng nhập số gram.");
      return;
    }
    if (needsNote && !note.trim()) {
      setError("Chọn “Lý do khác” thì phải ghi rõ lý do.");
      return;
    }
    startTransition(async () => {
      const result = await recordFridgeChange(item.id, actionId, grams, note);
      setError(result);
      if (!result) {
        setAmount("");
        setNote("");
      }
    });
  };

  return (
    <div
      className={`rounded-[10px] border px-3 py-2.5 ${
        error ? "border-red-300 bg-red-50" : "border-neutral-200"
      } ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-2xl ${empty ? "opacity-35 grayscale" : ""}`}>{item.emoji}</span>

        <div className="min-w-[130px] flex-1">
          <div className="text-sm font-bold text-[#152b1a]">{item.name}</div>
          <div className="text-[11px] text-neutral-500">{item.category}</div>
        </div>

        <div className="w-[110px]">
          <div className="text-[11px] text-neutral-500">Còn trong tủ</div>
          <div
            className={`text-base font-bold ${empty ? "text-neutral-400" : "text-[#1e5c2e]"}`}
          >
            {formatGrams(item.stockGrams)}
          </div>
        </div>

        <div className="w-[104px]">
          {empty ? (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
              Hết hàng
            </span>
          ) : item.onMenuToday ? (
            <span className="rounded-full bg-[#e6f4d8] px-2 py-0.5 text-[11px] font-semibold text-[#1e5c2e]">
              Khách đang thấy
            </span>
          ) : (
            <span className="rounded-full bg-[#fdf3d3] px-2 py-0.5 text-[11px] font-semibold text-[#7a5400]">
              Chưa lên menu
            </span>
          )}
        </div>

        <select
          value={actionId}
          onChange={(e) => {
            setActionId(e.target.value as FridgeActionId);
            setError(null);
          }}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-[12px] outline-none focus:border-[#1e5c2e]"
        >
          {FRIDGE_ACTIONS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={isRecount ? String(item.stockGrams) : "0"}
            aria-label={`${action.label} — số gram`}
            className="w-[86px] rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-[#1e5c2e]"
          />
          <span className="text-[12px] text-neutral-500">g</span>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-[#1e5c2e] px-3 py-1.5 text-[12px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "..." : "Ghi"}
        </button>
      </div>

      {needsNote ? (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi rõ lý do (bắt buộc)..."
          className="mt-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-[12px] outline-none focus:border-[#1e5c2e]"
        />
      ) : null}

      {isRecount ? (
        <p className="mt-1.5 text-[11px] text-neutral-500">
          Nhập số gram <strong>thật sự còn trong tủ</strong> sau khi đếm lại — máy tự tính phần
          chênh lệch và ghi vào nhật ký.
        </p>
      ) : null}

      {error ? <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
