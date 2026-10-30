import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();
const [products, entries, movements, losses, users, orders] = await Promise.all([
  prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
  prisma.dailyMenuEntry.findMany({ orderBy: [{ date: "asc" }, { sortOrder: "asc" }] }),
  // Sổ cái tủ lạnh là nguồn sự thật về tồn kho — thiếu nó thì bản sao lưu
  // không dựng lại được số tồn của bất kỳ loại nào.
  prisma.stockMovement.findMany({ orderBy: [{ date: "asc" }, { createdAt: "asc" }] }),
  prisma.inventoryLoss.findMany({ orderBy: { date: "asc" } }),
  prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  // Đơn hàng sinh ra dòng SALE/RETURN trong sổ cái — thiếu đơn thì không
  // biết mỗi gram bán qua web là của khách nào.
  prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "asc" } }),
]);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = `backups/neon-${stamp}.json`;
writeFileSync(file, JSON.stringify({ products, entries, movements, losses, users, orders }, null, 2));
console.log(`Đã lưu ${file}`);
console.log(`  Product: ${products.length} · DailyMenuEntry: ${entries.length} · StockMovement: ${movements.length} · InventoryLoss: ${losses.length} · User: ${users.length} · Order: ${orders.length}`);
await prisma.$disconnect();
