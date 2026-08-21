import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/data/home";
import { formatVnDate, vnToday } from "@/lib/date-vn";
import { CatalogPanel } from "@/components/admin/catalog-panel";
import { MenuPanel, type MenuEntryView } from "@/components/admin/menu-panel";
import { wasCarriedFromYesterday } from "@/lib/close-day";
import { isBlobConfigured } from "@/lib/upload";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const date = vnToday();

  const [products, entries, carriedFromYesterday] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.dailyMenuEntry.findMany({
      where: { date },
      include: { product: true },
      orderBy: { sortOrder: "asc" },
    }),
    wasCarriedFromYesterday(),
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
    description: entry.product.description,
    imageUrl: entry.product.imageUrl,
    stockGrams: entry.product.stockGrams,
  }));

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-[#152b1a]">Daily menu</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Bên trái là toàn bộ trái cây quán từng bán. Bên phải là thực đơn hôm nay — khách chỉ
        nhìn thấy những loại nằm ở đây <strong>và</strong> tủ lạnh còn hàng.
      </p>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
        <CatalogPanel
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            emoji: p.emoji,
            category: p.category,
            description: p.description,
            imageUrl: p.imageUrl,
            stockGrams: p.stockGrams,
          }))}
          menuEntryByProduct={menuEntryByProduct}
          categories={PRODUCT_CATEGORIES}
          blobEnabled={isBlobConfigured()}
        />
        <MenuPanel
          entries={entryViews}
          todayLabel={formatVnDate(date)}
          carriedFromYesterday={carriedFromYesterday}
        />
      </div>
    </div>
  );
}
