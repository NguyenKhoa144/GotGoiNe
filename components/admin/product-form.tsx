"use client";

import { useActionState } from "react";

export type ProductFormValues = {
  category: string;
  emoji: string;
  name: string;
  weight: string;
  price: string;
  badge?: string;
  description?: string;
  featured: boolean;
};

type ProductFormAction = (
  prevState: string | undefined,
  formData: FormData
) => Promise<string | undefined>;

type ProductFormProps = {
  action: ProductFormAction;
  categories: readonly string[];
  initial: ProductFormValues;
  submitLabel: string;
};

export function ProductForm({ action, categories, initial, submitLabel }: ProductFormProps) {
  const [error, formAction, pending] = useActionState(action, undefined);

  const field = "rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]";
  const label = "flex flex-col gap-1 text-sm font-semibold text-neutral-700";

  return (
    <form action={formAction} className="mx-auto flex max-w-xl flex-col gap-4 p-4">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <label className={label}>
        Danh mục
        <select name="category" defaultValue={initial.category} className={field} required>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <label className={label}>
        Icon (emoji)
        <input name="emoji" defaultValue={initial.emoji} placeholder="🥭" className={field} required />
      </label>

      <label className={label}>
        Tên sản phẩm
        <input name="name" defaultValue={initial.name} className={field} required />
      </label>

      <label className={label}>
        Quy cách (hiển thị cho khách)
        <input
          name="weight"
          defaultValue={initial.weight}
          placeholder="Hộp 400g · Gọt sẵn · Chín tới"
          className={field}
        />
      </label>

      <label className={label}>
        Giá niêm yết (dùng làm giá gợi ý khi thêm vào thực đơn)
        <input name="price" defaultValue={initial.price} placeholder="45.000₫" className={field} />
      </label>

      <label className={label}>
        Nhãn (tuỳ chọn)
        <input
          name="badge"
          defaultValue={initial.badge}
          placeholder="🔥 Bán chạy #1"
          className={field}
        />
      </label>

      <label className={label}>
        Mô tả (tuỳ chọn)
        <textarea name="description" defaultValue={initial.description} rows={3} className={field} />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
        <input type="checkbox" name="featured" defaultChecked={initial.featured} />
        Sản phẩm nổi bật
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#1e5c2e] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
