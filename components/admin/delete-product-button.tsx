"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/products/actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    const ok = window.confirm(
      `Xoá hẳn "${name}" khỏi danh sách trái cây?\n\n` +
        "Toàn bộ lịch sử thực đơn và nhật ký hao hụt của loại này cũng bị xoá theo. " +
        "Không thể hoàn tác.\n\n" +
        "Nếu chỉ muốn tạm ngừng bán, hãy gỡ khỏi thực đơn hôm nay thay vì xoá."
    );
    if (!ok) return;

    startTransition(async () => {
      await deleteProduct(id);
      router.push("/admin/products");
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
