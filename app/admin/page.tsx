import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnDate, vnToday } from "@/lib/date-vn";
import { formatGrams } from "@/lib/qty";
import { getPendingCarryDate } from "@/lib/close-day";
import { CarryForwardBanner } from "@/components/admin/carry-forward-banner";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const today = vnToday();

  const [totalProducts, entries, pendingCarryDate] = await Promise.all([
    prisma.product.count(),
    prisma.dailyMenuEntry.findMany({ where: { date: today }, include: { product: true } }),
    getPendingCarryDate(),
  ]);

  const onSale = entries.filter(
    (e) => e.qtyGrams - e.soldGrams - e.spoiledGrams > 0
  ).length;
  const soldOut = entries.length - onSale;
  // Đếm số loại có hao hụt thay vì cộng số lượng — các loại dùng đơn vị khác
  // nhau (gram, hộp, ly) nên cộng gộp lại không ra con số có nghĩa.
  const spoiledToday = entries.reduce((sum, e) => sum + e.spoiledGrams, 0);
  const soldToday = entries.reduce((sum, e) => sum + e.soldGrams, 0);

  const card =
    "rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-[#1e5c2e]";

  return (
    <div className="p-4">
      <h1 className="mb-1 text-lg font-bold text-[#152b1a]">Chào mừng trở lại 👋</h1>
      <p className="mb-4 text-sm text-neutral-500">{formatVnDate(today)}</p>

      {pendingCarryDate ? (
        <CarryForwardBanner pendingDateLabel={formatVnDate(pendingCarryDate)} />
      ) : null}

      <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Đang bán hôm nay</div>
          <div className="text-xl font-bold text-[#1e5c2e]">{onSale} loại</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Đã bán hết</div>
          <div className="text-xl font-bold text-[#152b1a]">{soldOut} loại</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Hao hụt hôm nay</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(spoiledToday)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Đã bán hôm nay</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(soldToday)}</div>
        </div>
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <Link href="/admin/products" className={card}>
          <div className="mb-1 text-2xl">🍎</div>
          <div className="text-sm font-bold text-[#152b1a]">Sản phẩm</div>
          <div className="text-xs text-neutral-500">
            Thực đơn hôm nay · {totalProducts} loại trong danh sách
          </div>
        </Link>

        <Link href="/admin/fridge" className={card}>
          <div className="mb-1 text-2xl">🧊</div>
          <div className="text-sm font-bold text-[#152b1a]">Tủ lạnh</div>
          <div className="text-xs text-neutral-500">Tồn kho và ghi nhận hàng hư hỏng</div>
        </Link>

        <Link href="/admin/stats" className={card}>
          <div className="mb-1 text-2xl">📊</div>
          <div className="text-sm font-bold text-[#152b1a]">Thống kê</div>
          <div className="text-xs text-neutral-500">Lượng bán, hao hụt và tỷ lệ theo tháng</div>
        </Link>

        <Link href="/admin/poster" className={card}>
          <div className="mb-1 text-2xl">🖼️</div>
          <div className="text-sm font-bold text-[#152b1a]">Tạo Poster</div>
          <div className="text-xs text-neutral-500">Tạo poster trái cây hôm nay để đăng bài</div>
        </Link>
      </div>
    </div>
  );
}
