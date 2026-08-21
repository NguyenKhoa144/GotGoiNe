// Chạy một lần khi chuyển trang chủ sang mô hình "thực đơn theo ngày":
// đưa toàn bộ sản phẩm đang bật available vào thực đơn của hôm nay, để trang
// chủ không bị trống trong lúc chuyển đổi.
//
//   set -a && source .env.local && set +a && node prisma/backfill-today-menu.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function vnToday() {
  const vnNow = new Date(Date.now() + VN_OFFSET_MS);
  return new Date(Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate()));
}

function parseVnd(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

async function main() {
  const date = vnToday();
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: { sortOrder: "asc" },
  });

  let created = 0;
  for (const product of products) {
    // upsert: chạy lại script không tạo trùng, cũng không ghi đè số liệu
    // bán/hao hụt nếu dòng đã tồn tại.
    const existing = await prisma.dailyMenuEntry.findUnique({
      where: { productId_date: { productId: product.id, date } },
    });
    if (existing) continue;

    await prisma.dailyMenuEntry.create({
      data: {
        productId: product.id,
        date,
        priceToday: parseVnd(product.price),
        qtyGrams: product.unit === "kg" ? 1000 : 10,
        sortOrder: product.sortOrder,
      },
    });
    created += 1;
  }

  console.log(
    `Thực đơn ngày ${date.toISOString().slice(0, 10)}: tạo mới ${created} dòng / ${products.length} sản phẩm.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
