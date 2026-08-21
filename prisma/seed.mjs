import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    category: "🔥 Hộp cắt sẵn",
    emoji: "🥭",
    name: "Xoài cát Hòa Lộc",
    weight: "Hộp 400g · Gọt sẵn · Chín tới",
    price: "45.000₫",
    badge: "🔥 Bán chạy #1",
    featured: true,
    description:
      "Xoài cát Hòa Lộc chín vàng, ngọt thơm tự nhiên. Gọt vỏ, thái miếng, đóng hộp ngay trong sáng - không chất bảo quản.",
    sortOrder: 0,
  },
  {
    category: "🔥 Hộp cắt sẵn",
    emoji: "🍉",
    name: "Dưa hấu không hạt",
    weight: "Hộp 500g · Cắt miếng",
    price: "28.000₫",
    sortOrder: 1,
  },
  {
    category: "Nhập khẩu",
    emoji: "🍈",
    name: "Dưa lưới Nhật Bản",
    weight: "Hộp 300g · Cao cấp",
    price: "65.000₫",
    badge: "Mới",
    sortOrder: 2,
  },
  {
    category: "🔥 Hộp cắt sẵn",
    emoji: "🍍",
    name: "Dứa mật gọt sẵn",
    weight: "Hộp 300g · Ngọt tự nhiên",
    price: "35.000₫",
    sortOrder: 3,
  },
  {
    category: "Hộp mix",
    emoji: "🍱",
    name: "Combo mix 5 loại",
    weight: "Hộp 600g · Tiết kiệm nhất",
    price: "89.000₫",
    sortOrder: 4,
  },
  {
    category: "Hoa quả dầm",
    emoji: "🥣",
    name: "Hoa quả dầm sữa chua",
    weight: "Ly 450g · Mát lạnh · Ít ngọt",
    price: "39.000₫",
    badge: "Mới",
    sortOrder: 5,
  },
  {
    category: "Set ăn vặt",
    emoji: "🍡",
    name: "Set trái cây chấm muối",
    weight: "Hộp 500g · Có muối tôm",
    price: "55.000₫",
    sortOrder: 6,
  },
  {
    category: "Hộp quà tặng",
    emoji: "🎁",
    name: "Hộp quà trái cây mini",
    weight: "Set 4 loại · Gói nơ · Thiệp nhỏ",
    price: "129.000₫",
    sortOrder: 7,
  },
];

async function main() {
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`Bảng Product đã có ${existing} dòng — bỏ qua seed để tránh trùng lặp.`);
    return;
  }
  await prisma.product.createMany({ data: products });
  console.log(`Đã seed ${products.length} sản phẩm.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
