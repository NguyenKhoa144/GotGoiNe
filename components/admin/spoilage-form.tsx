"use client";

import { useState, useTransition } from "react";
import { reportSpoilage } from "@/app/admin/fridge/actions";
import { SPOILAGE_REASONS } from "@/app/admin/fridge/constants";

type SpoilageFormProps = {
  productId: string;
  unitLabel: string;
};

export function SpoilageForm({ productId, unitLabel }: SpoilageFormProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<string>(SPOILAGE_REASONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    const parsed = Number(amount);
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) {
      setError("Nhập số lượng lớn hơn 0.");
      return;
    }
    startTransition(async () => {
      const result = await reportSpoilage(productId, parsed, reason);
      if (result) {
        setError(result);
      } else {
        setAmount("");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={unitLabel}
        aria-label={`Số lượng hư hỏng (${unitLabel})`}
        className="w-[74px] rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-[#1e5c2e]"
      />
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="Lý do hao hụt"
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-[#1e5c2e]"
      >
        {SPOILAGE_REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-md bg-[#1e5c2e] px-3 py-1 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "..." : "Ghi nhận"}
      </button>
      {error ? <p className="w-full text-right text-[11px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
