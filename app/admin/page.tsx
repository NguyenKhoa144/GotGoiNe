import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnDate, vnToday } from "@/lib/date-vn";
import { formatGrams } from "@/lib/qty";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const today = vnToday();

  const [totalProducts, entries, movesToday, stock] = await Promise.all([
    prisma.product.count(),
    prisma.dailyMenuEntry.findMany({ where: { date: today }, include: { product: true } }),
    prisma.stockMovement.findMany({ where: { date: today } }),
    prisma.product.aggregate({ _sum: { stockGrams: true } }),
  ]);

  // Khách chỉ thấy loại vừa nằm trong thực đơn hôm nay, vừa còn hàng trong tủ.
  const onSale = entries.filter((e) => e.product.stockGrams > 0).length;
  const soldOut = entries.length - onSale;

  // Mọi định lượng đều là gram nên cộng gộp được trực tiếp.
  const sumKind = (kind: string) =>
    movesToday.filter((m) => m.kind === kind).reduce((total, m) => total + m.amountGrams, 0);
  const soldToday = sumKind("SALE");
  const lostToday = sumKind("LOSS");
  const totalStock = stock._sum.stockGrams ?? 0;

  const card =
    "rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-[#1e5c2e]";

  return (
    <div className="p-4">
      <h1 className="mb-1 text-lg font-bold text-[#152b1a]">Chào mừng trở lại 👋</h1>
      <p className="mb-4 text-sm text-neutral-500">{formatVnDate(today)}</p>

      <div className="mb-4 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Đang bán hôm nay</div>
          <div className="text-xl font-bold text-[#1e5c2e]">{onSale} loại</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Trong menu nhưng hết hàng</div>
          <div className="text-xl font-bold text-[#152b1a]">{soldOut} loại</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Hao hụt hôm nay</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(lostToday)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Đã bán hôm nay</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(soldToday)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] text-neutral-500">Tổng đang có trong tủ</div>
          <div className="text-xl font-bold text-[#152b1a]">{formatGrams(totalStock)}</div>
        </div>
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <Link href="/admin/menu" className={card}>
          <div className="mb-1 text-2xl">🍎</div>
          <div className="text-sm font-bold text-[#152b1a]">Daily menu</div>
          <div className="text-xs text-neutral-500">
            Thực đơn hôm nay · {totalProducts} loại trong danh sách
          </div>
        </Link>

        <Link href="/admin/fridge" className={card}>
          <div className="mb-1 text-2xl">🧊</div>
          <div className="text-sm font-bold text-[#152b1a]">Tủ lạnh</div>
          <div className="text-xs text-neutral-500">Nhập hàng, trừ hao hụt và nhật ký kho</div>
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
