import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { formatVnDate, vnToday } from "@/lib/date-vn";
import { CatalogPanel } from "@/components/admin/catalog-panel";
import { CarryForwardBanner } from "@/components/admin/carry-forward-banner";
import { MenuPanel, type MenuEntryView } from "@/components/admin/menu-panel";
import { getPendingCarryDate } from "@/lib/close-day";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const date = vnToday();

  const [products, entries, pendingCarryDate] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.dailyMenuEntry.findMany({
      where: { date },
      include: { product: true },
      orderBy: { sortOrder: "asc" },
    }),
    getPendingCarryDate(),
  ]);

  const menuEntryByProduct: Record<string, string> = {};
  for (const entry of entries) {
    menuEntryByProduct[entry.productId] = entry.id;
  }

  const entryViews: MenuEntryView[] = entries.map((entry) => ({
    id: entry.id,
    productId: entry.productId,
    name: entry.product.name,
    emoji: entry.product.emoji,
    category: entry.product.category,
    unit: entry.product.unit,
    priceToday: entry.priceToday,
    qtyGrams: entry.qtyGrams,
    soldGrams: entry.soldGrams,
    spoiledGrams: entry.spoiledGrams,
  }));

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-[#152b1a]">Thực đơn theo ngày</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Chọn trái cây bên trái để đưa vào thực đơn hôm nay. Khách chỉ nhìn thấy những loại đang có
        trong thực đơn và còn hàng.
      </p>

      {pendingCarryDate ? (
        <CarryForwardBanner pendingDateLabel={formatVnDate(pendingCarryDate)} />
      ) : null}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
        <CatalogPanel
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            emoji: p.emoji,
            category: p.category,
            description: p.description,
          }))}
          menuEntryByProduct={menuEntryByProduct}
          categories={PRODUCT_CATEGORIES}
        />
        <MenuPanel entries={entryViews} todayLabel={formatVnDate(date)} />
      </div>
    </div>
  );
}
