"use client";

import { useActionState, useEffect, useState } from "react";
import { createProduct } from "@/app/admin/products/actions";

type AddProductModalProps = {
  categories: readonly string[];
  onClose: () => void;
};

export function AddProductModal({ categories, onClose }: AddProductModalProps) {
  const [error, formAction, pending] = useActionState(createProduct, undefined);
  const [submitted, setSubmitted] = useState(false);

  // Chỉ đóng modal khi đã gửi xong và không có lỗi — nếu đóng ngay lúc gửi thì
  // thông báo lỗi (thiếu tên, chưa chọn danh mục) sẽ biến mất trước khi kịp đọc.
  useEffect(() => {
    if (submitted && !pending && !error) onClose();
  }, [submitted, pending, error, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-base font-bold text-[#152b1a]">Thêm trái cây mới</h3>

        <form
          action={(formData) => {
            setSubmitted(true);
            formAction(formData);
          }}
          className="flex flex-col gap-3"
        >
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Tên trái cây
            <input
              name="name"
              required
              autoFocus
              placeholder="Ổi ruột hồng"
              className="rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Danh mục
            <select
              name="category"
              defaultValue={categories[0]}
              required
              className="rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Icon (emoji)
            <input
              name="emoji"
              placeholder="🍐"
              className="rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Mô tả (tuỳ chọn)
            <textarea
              name="description"
              rows={3}
              className="min-h-[70px] resize-y rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]"
            />
          </label>

          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[#1e5c2e] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Đang thêm..." : "Thêm trái cây"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
