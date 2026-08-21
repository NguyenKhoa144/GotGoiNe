"use client";

import { useState, useTransition } from "react";
import { carryForwardNow } from "@/app/admin/products/carry-action";

/**
 * Chỉ hiện khi thực đơn hôm nay trống mà ngày bán gần nhất vẫn còn hàng tồn —
 * nghĩa là việc chốt ngày tự động đã không chạy. Cảnh báo cho admin thấy
 * trước khi khách vào trang chủ và không thấy sản phẩm nào.
 */
export function CarryForwardBanner({ pendingDateLabel }: { pendingDateLabel: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<number | null>(null);

  if (done !== null) {
    return (
      <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
        Đã chuyển {done} loại còn tồn sang thực đơn hôm nay.
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="text-sm text-amber-900">
        <strong>Chưa chốt ngày {pendingDateLabel}.</strong> Thực đơn hôm nay đang trống nên khách
        không thấy sản phẩm nào — bấm để chuyển hàng còn tồn sang hôm nay.
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setDone(await carryForwardNow());
          })
        }
        className="rounded-lg bg-[#1e5c2e] px-3 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Đang chuyển..." : "Chuyển hàng tồn"}
      </button>
    </div>
  );
}
