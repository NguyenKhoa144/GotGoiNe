import type { Lang } from "@/lib/language-context";

export type FruitBoxSize = {
  id: string;
  label: string;
  weightLabel: string;
  /**
   * Trọng lượng hộp tính bằng gram. Máy chủ dùng con số này để chia gram cho
   * từng loại trái khi khách đặt — không bao giờ tin số gram trình duyệt gửi.
   * Giá bán vẫn do quán báo khi gọi xác nhận đơn.
   */
  grams: number;
};

export type FruitBoxItem = {
  id: string;
  emoji: string;
  // Màu nền khung ảnh (giống Miami Fruit/Tropical Fruit Box) — dùng tạm
  // trong lúc chưa có ảnh chụp thật. Khi có ảnh, set thêm `image` bên dưới.
  color: string;
  image?: string;
  name: string;
};

type FruitBoxContent = {
  sizes: FruitBoxSize[];
  items: FruitBoxItem[];
};

const fruitBoxContent: Record<Lang, FruitBoxContent> = {
  vi: {
    sizes: [
      { id: "small", label: "Hộp nhỏ", weightLabel: "500g", grams: 500 },
      { id: "medium", label: "Hộp vừa", weightLabel: "700g", grams: 700 },
      { id: "large", label: "Hộp lớn", weightLabel: "1000g", grams: 1000 },
    ],
    items: [
      { id: "xoai", emoji: "🥭", color: "#ffd98a", name: "Xoài" },
      { id: "dua-hau", emoji: "🍉", color: "#ff9e96", name: "Dưa hấu" },
      { id: "dua", emoji: "🍍", color: "#ffe58a", name: "Dứa" },
      { id: "cam", emoji: "🍊", color: "#ffc48a", name: "Cam" },
      { id: "dau-tay", emoji: "🍓", color: "#ffb0c4", name: "Dâu tây" },
      { id: "nho", emoji: "🍇", color: "#d6b3f0", name: "Nho" },
      { id: "kiwi", emoji: "🥝", color: "#c6e6a0", name: "Kiwi" },
      { id: "tao", emoji: "🍎", color: "#ff8a80", name: "Táo" },
    ],
  },
  en: {
    sizes: [
      { id: "small", label: "Small box", weightLabel: "500g", grams: 500 },
      { id: "medium", label: "Medium box", weightLabel: "700g", grams: 700 },
      { id: "large", label: "Large box", weightLabel: "1000g", grams: 1000 },
    ],
    items: [
      { id: "xoai", emoji: "🥭", color: "#ffd98a", name: "Mango" },
      { id: "dua-hau", emoji: "🍉", color: "#ff9e96", name: "Watermelon" },
      { id: "dua", emoji: "🍍", color: "#ffe58a", name: "Pineapple" },
      { id: "cam", emoji: "🍊", color: "#ffc48a", name: "Orange" },
      { id: "dau-tay", emoji: "🍓", color: "#ffb0c4", name: "Strawberry" },
      { id: "nho", emoji: "🍇", color: "#d6b3f0", name: "Grapes" },
      { id: "kiwi", emoji: "🥝", color: "#c6e6a0", name: "Kiwi" },
      { id: "tao", emoji: "🍎", color: "#ff8a80", name: "Apple" },
    ],
  },
};

export function getFruitBoxContent(lang: Lang): FruitBoxContent {
  return fruitBoxContent[lang];
}

/** Cỡ hộp theo id, dùng phía máy chủ khi nhận đơn. `undefined` nếu id lạ. */
export function findBoxSize(sizeId: string): FruitBoxSize | undefined {
  return fruitBoxContent.vi.sizes.find((size) => size.id === sizeId);
}

// Màu nền khung ảnh, chọn theo id sản phẩm để một loại trái luôn giữ đúng một
// màu dù thứ tự trong thực đơn thay đổi.
const SWATCHES = [
  "#ffd98a",
  "#ff9e96",
  "#ffe58a",
  "#ffc48a",
  "#ffb0c4",
  "#d6b3f0",
  "#c6e6a0",
  "#ff8a80",
];

function swatchFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  }
  return SWATCHES[hash % SWATCHES.length];
}

/**
 * Danh sách trái cây để ghép hộp, dựng từ chính thực đơn hôm nay (đã lọc
 * theo danh mục "Hộp cắt sẵn") thay vì danh sách cứng — khách chỉ ghép được
 * những loại quả thật sự đang có, không chọn nhầm loại đã hết hoặc chưa
 * từng bán.
 */
export function fruitBoxItemsFromProducts(
  products: { id: string; emoji: string; name: string; imageUrl?: string }[]
): FruitBoxItem[] {
  return products.map((product) => ({
    id: product.id,
    emoji: product.emoji,
    // Màu nền chỉ còn thấy khi loại đó chưa có ảnh thật.
    color: swatchFor(product.id),
    image: product.imageUrl,
    name: product.name,
  }));
}
