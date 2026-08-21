// Chạy một lần: sửa lại đơn vị cho các sản phẩm đã có.
//
// Lúc thêm cột `unit`, mọi sản phẩm đều nhận mặc định "kg" nên định lượng bị
// tính bằng gram — vô nghĩa với hàng đóng sẵn ("Hộp quà trái cây mini: nhập
// 1000g"). Catalog hiện tại toàn hàng đếm được, nên gán lại đúng đơn vị và
// đưa định lượng của thực đơn hôm nay về số nguyên đơn vị.
//
//   set -a && source .env.local && set +a && node prisma/fix-units.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Suy ra đơn vị từ phần quy cách đang hiển thị cho khách.
function inferUnit(product) {
  const text = `${product.weight} ${product.name}`.toLowerCase();
  if (text.includes("ly")) return "ly";
  if (text.includes("set")) return "set";
  if (text.includes("hộp")) return "hộp";
  return "hộp";
}

const DEFAULT_QTY = { kg: 1000 };

async function main() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    const unit = inferUnit(product);
    if (unit === product.unit) continue;

    await prisma.product.update({ where: { id: product.id }, data: { unit } });

    // Đưa các dòng thực đơn CHƯA phát sinh mua bán về định lượng hợp lý của
    // đơn vị mới. Dòng đã có bán hoặc hao hụt thì giữ nguyên, không tự sửa
    // số liệu thật của quán.
    const updated = await prisma.dailyMenuEntry.updateMany({
      where: { productId: product.id, soldGrams: 0, spoiledGrams: 0 },
      data: { qtyGrams: DEFAULT_QTY[unit] ?? 10 },
    });

    console.log(
      `${product.name}: ${product.unit} -> ${unit} (cập nhật ${updated.count} dòng thực đơn)`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
