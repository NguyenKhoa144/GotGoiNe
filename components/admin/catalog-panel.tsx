"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { addToTodayMenu, removeFromTodayMenu } from "@/app/admin/products/actions";
import { AddProductModal } from "./add-product-modal";

export type CatalogItem = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string | null;
};

type CatalogPanelProps = {
  products: CatalogItem[];
  /** productId -> id dòng thực đơn hôm nay (nếu đang có trong thực đơn). */
  menuEntryByProduct: Record<string, string>;
  categories: readonly string[];
};

export function CatalogPanel({ products, menuEntryByProduct, categories }: CatalogPanelProps) {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const toggle = (productId: string) => {
    const entryId = menuEntryByProduct[productId];
    startTransition(async () => {
      if (entryId) {
        await removeFromTodayMenu(entryId);
      } else {
        await addToTodayMenu(productId);
      }
    });
  };

  return (
    <section className="rounded-[14px] border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#152b1a]">
          Danh sách trái cây{" "}
          <span className="font-medium text-neutral-500">({products.length} loại)</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          aria-label="Thêm sản phẩm mới"
          className="h-7 w-7 rounded-full bg-[#1e5c2e] text-lg leading-none text-white transition-opacity hover:opacity-90"
        >
          +
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tên..."
        className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#1e5c2e]"
      />

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">
          {products.length === 0 ? "Chưa có sản phẩm nào." : "Không tìm thấy trái cây phù hợp."}
        </p>
      ) : (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
          {visible.map((product) => {
            const inMenu = Boolean(menuEntryByProduct[product.id]);
            return (
              <div
                key={product.id}
                className="flex flex-col rounded-[10px] border border-neutral-200 p-2.5"
              >
                <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-[#f0f9e1] text-4xl">
                  {product.emoji}
                </div>
                <div className="text-[12.5px] font-bold text-[#152b1a]">{product.name}</div>
                <div className="min-h-[28px] text-[10.5px] leading-tight text-neutral-500">
                  {product.description ?? product.category}
                </div>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  disabled={pending}
                  className={`mt-2 w-full rounded-lg py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                    inMenu
                      ? "border border-[#f5a800] bg-[#fde9a0] text-[#7a5400]"
                      : "bg-[#1e5c2e] text-white hover:opacity-90"
                  }`}
                >
                  {inMenu ? "✓ Trong menu" : "+ Thêm"}
                </button>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="mt-1 text-center text-[10.5px] text-neutral-500 hover:text-[#1e5c2e] hover:underline"
                >
                  Sửa thông tin
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {showModal ? (
        <AddProductModal categories={categories} onClose={() => setShowModal(false)} />
      ) : null}
    </section>
  );
}
