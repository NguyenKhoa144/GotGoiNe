"use client";

import { useActionState } from "react";
import type { Product } from "@/data/home";

type ProductFormAction = (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;

type ProductFormProps = {
  action: ProductFormAction;
  categories: readonly string[];
  initial?: Product & { available: boolean; sortOrder: number };
  submitLabel: string;
};

export function ProductForm({ action, categories, initial, submitLabel }: ProductFormProps) {
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mx-auto flex max-w-xl flex-col gap-4 p-4">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Danh mục
        <select
          name="category"
          defaultValue={initial?.category ?? categories[0]}
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
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
          defaultValue={initial?.emoji}
          placeholder="🥭"
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Tên sản phẩm
        <input
          name="name"
          defaultValue={initial?.name}
          placeholder="Xoài cát Hòa Lộc"
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Quy cách
        <input
          name="weight"
          defaultValue={initial?.weight}
          placeholder="Hộp 400g · Gọt sẵn · Chín tới"
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Giá
        <input
          name="price"
          defaultValue={initial?.price}
          placeholder="45.000₫"
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Nhãn (tuỳ chọn)
        <input
          name="badge"
          defaultValue={initial?.badge}
          placeholder="🔥 Bán chạy #1"
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Mô tả (tuỳ chọn)
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={3}
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-700">
        Thứ tự hiển thị (số nhỏ hiện trước)
        <input
          name="sortOrder"
          type="number"
          defaultValue={initial?.sortOrder ?? 0}
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured} />
        Sản phẩm nổi bật
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
        <input type="checkbox" name="available" defaultChecked={initial?.available ?? true} />
        Còn hàng (hiện trên trang chủ)
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#1E5C2D] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#164522] disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
