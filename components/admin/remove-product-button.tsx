"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveProduct, deleteProduct, unarchiveProduct } from "@/app/admin/menu/actions";

type RemoveProductButtonProps = {
  id: string;
  name: string;
  /** Đã có dòng sổ cái nào chưa. Có rồi thì chỉ được ẩn, không được xoá. */
  hasHistory: boolean;
  archived: boolean;
};

/**
 * Một nút duy nhất, tự chọn đúng việc:
 * - đã ẩn            -> Bỏ ẩn
 * - đã có lịch sử     -> Ẩn (giữ sổ cái và thống kê)
 * - tạo nhầm, chưa dùng -> Xoá hẳn
 */
export function RemoveProductButton({ id, name, hasHistory, archived }: RemoveProductButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<string | null | void>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result) {
        setError(result);
        return;
      }
      router.push("/admin/menu");
    });
  };

  const handleClick = () => {
    if (archived) {
      run(() => unarchiveProduct(id));
      return;
    }

    if (hasHistory) {
      const ok = window.confirm(
        `Ẩn "${name}"?\n\n` +
          "Loại này sẽ biến khỏi danh mục, thực đơn và trang chủ. Lịch sử nhập/bán " +
          "và thống kê các tháng cũ giữ nguyên. Bỏ ẩn lúc nào cũng được."
      );
      if (ok) run(() => archiveProduct(id));
      return;
    }

    const ok = window.confirm(
      `Xoá hẳn "${name}"?\n\n` +
        "Loại này chưa từng nhập hay bán nên không mất lịch sử nào. Không thể hoàn tác."
    );
    if (ok) run(() => deleteProduct(id));
  };

  const label = archived ? "Bỏ ẩn" : hasHistory ? "Ẩn" : "Xoá";
  const busyLabel = archived ? "Đang bỏ ẩn..." : hasHistory ? "Đang ẩn..." : "Đang xoá...";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-60 ${
          archived
            ? "border-neutral-300 text-[#1e5c2e] hover:border-[#1e5c2e]"
            : "border-red-300 text-red-600 hover:bg-red-50"
        }`}
      >
        {pending ? busyLabel : label}
      </button>
      {error ? <p className="max-w-[240px] text-right text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
