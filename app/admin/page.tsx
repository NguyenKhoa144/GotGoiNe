import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [totalProducts, unavailableCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { available: false } }),
  ]);

  return (
    <div className="p-4">
      <h1 className="mb-1 text-lg font-bold text-neutral-900">Chào mừng trở lại 👋</h1>
      <p className="mb-6 text-sm text-neutral-500">Chọn chức năng bên dưới để bắt đầu.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-[#1E5C2D]"
        >
          <div className="mb-1 text-2xl">🍎</div>
          <div className="text-sm font-bold text-neutral-900">Sản phẩm</div>
          <div className="text-xs text-neutral-500">
            {totalProducts} sản phẩm · {unavailableCount} đang hết hàng
          </div>
        </Link>

        <Link
          href="/admin/poster"
          className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-[#1E5C2D]"
        >
          <div className="mb-1 text-2xl">🖼️</div>
          <div className="text-sm font-bold text-neutral-900">Tạo Poster</div>
          <div className="text-xs text-neutral-500">Tạo poster trái cây hôm nay để đăng bài</div>
        </Link>
      </div>
    </div>
  );
}
