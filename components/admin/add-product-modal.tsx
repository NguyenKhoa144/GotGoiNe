"use client";

import { useActionState, useEffect, useState } from "react";
import { createProduct } from "@/app/admin/menu/actions";
import { ProductImageField } from "./product-image-field";

type AddProductModalProps = {
  categories: readonly string[];
  blobEnabled: boolean;
  onClose: () => void;
};

export function AddProductModal({ categories, blobEnabled, onClose }: AddProductModalProps) {
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

  const field =
    "rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-[440px] rounded-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-base font-bold text-[#152b1a]">Thêm trái cây mới</h3>
        <p className="mb-4 text-[12px] text-neutral-500">
          Thêm vào cơ sở dữ liệu trái cây tổng. Khách chỉ nhìn thấy khi loại này được đưa vào
          thực đơn hôm nay và tủ lạnh còn hàng.
        </p>

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
            <input name="name" required autoFocus placeholder="Ổi ruột hồng" className={field} />
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
            Mô tả
            <textarea
              name="description"
              rows={3}
              placeholder="Ổi giòn, ngọt thanh, gọt sẵn cắt miếng vừa ăn."
              className={`${field} min-h-[70px] resize-y`}
            />
            <span className="text-[11px] font-normal text-neutral-500">
              Đây là dòng chữ khách đọc dưới tên trái cây ngoài trang chủ.
            </span>
          </label>

          <ProductImageField blobEnabled={blobEnabled} />

          <div className="grid grid-cols-[1fr_100px] gap-3">
            <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
              Danh mục
              <select name="category" defaultValue={categories[0]} required className={field}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
              Icon
              <input name="emoji" placeholder="🍐" className={field} />
            </label>
          </div>

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
