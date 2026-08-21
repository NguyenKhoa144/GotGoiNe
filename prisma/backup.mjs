import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();
const [products, entries, losses, users] = await Promise.all([
  prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
  prisma.dailyMenuEntry.findMany({ orderBy: [{ date: "asc" }, { sortOrder: "asc" }] }),
  prisma.inventoryLoss.findMany({ orderBy: { date: "asc" } }),
  prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
]);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = `backups/neon-${stamp}.json`;
writeFileSync(file, JSON.stringify({ products, entries, losses, users }, null, 2));
console.log(`Đã lưu ${file}`);
console.log(`  Product: ${products.length} · DailyMenuEntry: ${entries.length} · InventoryLoss: ${losses.length} · User: ${users.length}`);
await prisma.$disconnect();
