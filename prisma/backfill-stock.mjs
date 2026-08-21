/**
 * Bước 2/7 — nạp dữ liệu cho mô hình tồn kho mới.
 *
 * 1. Product.stockGrams = phần còn lại của dòng thực đơn MỚI NHẤT của loại đó
 *    (nhập − đã bán − hư hỏng), tối thiểu 0.
 * 2. Sinh một dòng StockMovement kind="IMPORT" cho chính số tồn đó, để tổng
 *    các dòng nhật ký khớp với tồn kho ngay từ đầu — nếu bỏ qua, tồn kho sẽ
 *    "từ trên trời rơi xuống" và mọi phép đối chiếu sau này đều lệch.
 * 3. Chép InventoryLoss cũ sang StockMovement kind="LOSS" để giữ lịch sử.
 *
 * Chạy lại nhiều lần không nhân đôi: xoá sạch StockMovement trước khi ghi.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const VN = 7 * 60 * 60 * 1000;
const n = new Date(Date.now() + VN);
const today = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));

const products = await prisma.product.findMany();
const entries = await prisma.dailyMenuEntry.findMany({ orderBy: { date: "desc" } });
const losses = await prisma.inventoryLoss.findMany();

await prisma.stockMovement.deleteMany({});

for (const p of products) {
  const latest = entries.find((e) => e.productId === p.id);
  const stock = latest
    ? Math.max(0, latest.qtyGrams - latest.soldGrams - latest.spoiledGrams)
    : 0;

  await prisma.product.update({ where: { id: p.id }, data: { stockGrams: stock } });

  if (stock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: p.id,
        date: latest?.date ?? today,
        kind: "IMPORT",
        amountGrams: stock,
        deltaGrams: stock,
        note: "Tồn kho chuyển từ mô hình định lượng theo ngày (bước 2/7)",
      },
    });
  }
  console.log(`  ${p.name.padEnd(20)} stockGrams = ${stock}g`);
}

for (const l of losses) {
  await prisma.stockMovement.create({
    data: {
      productId: l.productId,
      date: l.date,
      kind: "LOSS",
      amountGrams: l.amountGrams,
      deltaGrams: -l.amountGrams,
      reason: l.reason,
      note: l.note,
      createdAt: l.createdAt,
    },
  });
}
console.log(`\nĐã chép ${losses.length} dòng hao hụt sang StockMovement.`);

const moves = await prisma.stockMovement.count();
console.log(`Tổng StockMovement: ${moves} dòng.`);
await prisma.$disconnect();
