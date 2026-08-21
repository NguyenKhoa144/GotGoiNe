"use client";

import { deleteProduct } from "@/app/admin/products/actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={async () => {
        if (!window.confirm(`Xoá sản phẩm "${name}"? Không thể hoàn tác.`)) return;
        await deleteProduct(id);
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Xoá
      </button>
    </form>
  );
}
