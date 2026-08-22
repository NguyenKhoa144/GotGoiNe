import type { Lang } from "@/lib/language-context";

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
  /**
   * Giá của RIÊNG loại trái này. Từ 2026-08-21 khách không còn thấy con số
   * này nữa — giá bán tính theo cỡ hộp, không theo từng loại trái. Giữ lại
   * cho danh sách tiếng Anh tĩnh (`EN_PRODUCTS`) và cho phần tạo poster.
   */
  price: string;
  badge?: string;
  featured?: boolean;
  description?: string;
  /** Ảnh thật admin tải lên. Chưa có thì giao diện dùng `emoji` thay thế. */
  imageUrl?: string;
};

export type ProcessStep = {
  number: string;
  icon: string;
  title: string;
  description: string;
};

type HomeContent = {
  categories: string[];
  marqueeItems: string[];
  heroStats: HeroStat[];
  whyReasons: WhyReason[];
  processSteps: ProcessStep[];
};

const homeContent: Record<Lang, HomeContent> = {
  vi: {
    categories: ["🔥 Hộp cắt sẵn", "Box quà tặng nhà gọt", "Thức chấm nhà gọt", "Order"],

    marqueeItems: [
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
    ],

    heroStats: [
      { value: "500+", label: "Đơn / ngày" },
      { value: "4.9★", label: "Đánh giá" },
      { value: "30'", label: "Giao nhanh" },
    ],

    whyReasons: [
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
    ],

    processSteps: [
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
    ],
  },

  en: {
    categories: ["🔥 Ready-cut boxes", "Gift boxes by Gọt Gòi", "Dipping treats by Gọt Gòi", "Order"],

    marqueeItems: [
      "🍎 New Zealand Queen Apple Mt ERIN",
      "🍒 US Cherry CERASINA",
      "🍈 Fifteen Melon (honey-base cantaloupe)",
      "🍓 Japanese Sky Strawberry",
      "🍈 Queen Melon Cantaloupe",
      "🥝 New Zealand Gold Kiwi",
      "🥭 Thai Mango",
      "🍇 Australian Green Grape",
      "🍒 Chilean Cherry Grandezza",
      "🍈 Aladin Cantaloupe",
      "🍇 Ruby Grape",
      "🍒 Chilean Cherry Lucila",
      "🍒 Chilean Cherry",
    ],

    heroStats: [
      { value: "500+", label: "Orders/day" },
      { value: "4.9★", label: "Rating" },
      { value: "30'", label: "Fast delivery" },
    ],

    whyReasons: [
      {
        icon: "⏱️",
        title: "Fast delivery in Phú Lợi",
        description:
          "30-60 minutes within Phú Lợi ward and nearby areas. Delivered in insulated cold boxes so your fruit arrives perfectly fresh.",
      },
      {
        icon: "🛡️",
        title: "Clean - Fresh - Safe",
        description:
          "Hand-peeled every morning, no preservatives. Sourced from trusted farms, with a date stamp on every box.",
      },
      {
        icon: "🌿",
        title: "Great Value - Convenient",
        description:
          "Save time on peeling and washing. Reasonable prices, perfect for offices, families, and everyday snacking.",
      },
    ],

    processSteps: [
      {
        number: "1",
        icon: "🌿",
        title: "Selected at the farm",
        description: "Carefully harvested and selected from trusted farms.",
      },
      {
        number: "2",
        icon: "🔪",
        title: "Peeled & washed",
        description: "Hand-peeled and rinsed with clean, chemical-free water.",
      },
      {
        number: "3",
        icon: "📦",
        title: "Cold-packed",
        description: "Sealed right after peeling and kept chilled.",
      },
      {
        number: "4",
        icon: "🛵",
        title: "Delivered to your door",
        description: "Fast and on time - fruit arrives perfectly fresh.",
      },
    ],
  },
};

// Trang chủ bản tiếng Việt lấy sản phẩm từ thực đơn hôm nay trong CSDL (xem
// lib/products.ts). Bản tiếng Anh chưa được quản lý qua trang quản trị nên
// vẫn dùng danh sách tĩnh này — đây là bản dịch trưng bày, không phải hàng
// đang bán thật.
export const EN_PRODUCTS: Product[] = [
  {
    id: "p1",
    category: "🔥 Ready-cut boxes",
    emoji: "🥭",
    name: "Hòa Lộc Mango",
    weight: "400g box · Pre-cut · Perfectly ripe",
    price: "45.000₫",
    badge: "🔥 Best seller #1",
    featured: true,
    description:
      "Ripe golden Hòa Lộc mango, naturally sweet and fragrant. Peeled, sliced, and boxed fresh every morning - no preservatives.",
  },
  {
    id: "p2",
    category: "🔥 Ready-cut boxes",
    emoji: "🍉",
    name: "Seedless Watermelon",
    weight: "500g box · Cut pieces",
    price: "28.000₫",
  },
  {
    id: "p3",
    category: "Order",
    emoji: "🍈",
    name: "Japanese Cantaloupe",
    weight: "300g box · Premium",
    price: "65.000₫",
    badge: "New",
  },
  {
    id: "p4",
    category: "🔥 Ready-cut boxes",
    emoji: "🍍",
    name: "Ready-cut Honey Pineapple",
    weight: "300g box · Naturally sweet",
    price: "35.000₫",
  },
  {
    id: "p7",
    category: "Dipping treats by Gọt Gòi",
    emoji: "🍡",
    name: "Fruit & Salt Dip Set",
    weight: "500g box · Includes shrimp salt",
    price: "55.000₫",
  },
  {
    id: "p8",
    category: "Gift boxes by Gọt Gòi",
    emoji: "🎁",
    name: "Mini Fruit Gift Box",
    weight: "4-fruit set · Ribbon-wrapped · Small card",
    price: "129.000₫",
  },
];

export function getHomeContent(lang: Lang): HomeContent {
  return homeContent[lang];
}

// Danh mục sản phẩm dùng chung cho form quản trị (/admin/menu) — lấy từ
// bản VI duy nhất vì admin chỉ quản lý nội dung tiếng Việt, tránh khai báo
// trùng danh sách này ở hai nơi rồi lệch nhau.
export const PRODUCT_CATEGORIES = homeContent.vi.categories;
