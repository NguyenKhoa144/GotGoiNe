import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AvailableToggle } from "@/components/admin/available-toggle";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Sản phẩm ({products.length})</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-[#1E5C2D] px-3 py-1.5 text-sm font-bold text-white hover:bg-[#164522]"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-neutral-500">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3"
            >
              <span className="text-2xl">{product.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">
                  {product.name}
                  {product.featured ? " ⭐" : ""}
                </div>
                <div className="truncate text-xs text-neutral-500">
                  {product.category} · {product.weight}
                </div>
              </div>
              <div className="text-sm font-bold text-[#1E5C2D]">{product.price}</div>
              <AvailableToggle id={product.id} available={product.available} />
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Sửa
              </Link>
              <DeleteProductButton id={product.id} name={product.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
