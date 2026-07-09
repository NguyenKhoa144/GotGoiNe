export type HeroStat = {
  value: string;
  label: string;
};

export type WhyReason = {
  icon: string;
  title: string;
  description: string;
};

export type Product = {
  id: string;
  category: string;
  emoji: string;
  name: string;
  weight: string;
  price: string;
  badge?: string;
  featured?: boolean;
  description?: string;
};

export type ProcessStep = {
  number: string;
  icon: string;
  title: string;
  description: string;
};

export const categories = [
  "🔥 Hộp cắt sẵn",
  "Hoa quả dầm",
  "Hộp mix",
  "Set ăn vặt",
  "Hộp quà tặng",
  "Nhập khẩu",
];

export const marqueeItems = [
  "🍎 Táo Queen New Zealand Mt ERIN",
  "🍒 Cherry Mỹ CERASINA",
  "🍈 Dưa lưới Fifteen (Dưa lưới đế mật)",
  "🍓 Dâu Nhật Sky",
  "🍈 Dưa lưới Queen Melon",
  "🥝 Kiwi vàng New Zealand",
  "🥭 Xoài Thái",
  "🍇 Nho xanh Úc",
  "🍒 Cherry Chile Grandezza",
  "🍈 Dưa lưới Aladin",
  "🍇 Nho Ruby",
  "🍒 Cherry Chile Lucila",
  "🍒 Cherry Chile",
];

export const heroStats = [
  {
    value: "500+",
    label: "Đơn / ngày",
  },
  {
    value: "4.9★",
    label: "Đánh giá",
  },
  {
    value: "30'",
    label: "Giao nhanh",
  },
];

export const whyReasons = [
  {
    icon: "⏱️",
    title: "Giao nhanh tại Phú Lợi",
    description:
      "30-60 phút nội phường Phú Lợi và các quận lân cận. Có thùng bảo ôn lạnh, trái cây tươi nguyên khi đến tay bạn.",
  },
  {
    icon: "🛡️",
    title: "Sạch - Tươi - An toàn",
    description:
      "Gọt tay mỗi sáng, không chất bảo quản. Nguyên liệu nhập từ vườn uy tín, tem ngày trên mỗi hộp.",
  },
  {
    icon: "🌿",
    title: "Giá tốt - Tiện lợi",
    description:
      "Tiết kiệm thời gian gọt rửa. Giá hợp lý, phù hợp văn phòng, gia đình và bữa ăn vặt hàng ngày.",
  },
];

export const products = [
  {
    id: "p1",
    category: "🔥 Hộp cắt sẵn",
    emoji: "🥭",
    name: "Xoài cát Hòa Lộc",
    weight: "Hộp 400g · Gọt sẵn · Chín tới",
    price: "45.000₫",
    badge: "🔥 Bán chạy #1",
    featured: true,
    description:
      "Xoài cát Hòa Lộc chín vàng, ngọt thơm tự nhiên. Gọt vỏ, thái miếng, đóng hộp ngay trong sáng - không chất bảo quản.",
  },
  {
    id: "p2",
    category: "🔥 Hộp cắt sẵn",
    emoji: "🍉",
    name: "Dưa hấu không hạt",
    weight: "Hộp 500g · Cắt miếng",
    price: "28.000₫",
  },
  {
    id: "p3",
    category: "Nhập khẩu",
    emoji: "🍈",
    name: "Dưa lưới Nhật Bản",
    weight: "Hộp 300g · Cao cấp",
    price: "65.000₫",
    badge: "Mới",
  },
  {
    id: "p4",
    category: "🔥 Hộp cắt sẵn",
    emoji: "🍍",
    name: "Dứa mật gọt sẵn",
    weight: "Hộp 300g · Ngọt tự nhiên",
    price: "35.000₫",
  },
  {
    id: "p5",
    category: "Hộp mix",
    emoji: "🍱",
    name: "Combo mix 5 loại",
    weight: "Hộp 600g · Tiết kiệm nhất",
    price: "89.000₫",
  },
  {
    id: "p6",
    category: "Hoa quả dầm",
    emoji: "🥣",
    name: "Hoa quả dầm sữa chua",
    weight: "Ly 450g · Mát lạnh · Ít ngọt",
    price: "39.000₫",
    badge: "Mới",
  },
  {
    id: "p7",
    category: "Set ăn vặt",
    emoji: "🍡",
    name: "Set trái cây chấm muối",
    weight: "Hộp 500g · Có muối tôm",
    price: "55.000₫",
  },
  {
    id: "p8",
    category: "Hộp quà tặng",
    emoji: "🎁",
    name: "Hộp quà trái cây mini",
    weight: "Set 4 loại · Gói nơ · Thiệp nhỏ",
    price: "129.000₫",
  },
];

export const processSteps = [
  {
    number: "1",
    icon: "🌿",
    title: "Chọn lọc tại vườn",
    description: "Thu hái và chọn lọc kỹ càng từ các vườn uy tín.",
  },
  {
    number: "2",
    icon: "🔪",
    title: "Gọt & rửa sạch",
    description: "Gọt vỏ bằng tay, rửa bằng nước sạch không hóa chất.",
  },
  {
    number: "3",
    icon: "📦",
    title: "Đóng gói lạnh",
    description: "Đóng hộp kín ngay sau khi gọt, bảo quản lạnh.",
  },
  {
    number: "4",
    icon: "🛵",
    title: "Giao tận tay",
    description: "Nhanh, đúng giờ - trái cây tươi nguyên khi đến tay.",
  },
];
