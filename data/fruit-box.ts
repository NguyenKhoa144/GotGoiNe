import type { Lang } from "@/lib/language-context";

export type FruitBoxSize = {
  id: string;
  label: string;
  capacity: number;
  fee: number;
};

export type FruitBoxItem = {
  id: string;
  emoji: string;
  // Màu nền khung ảnh (giống Miami Fruit/Tropical Fruit Box) — dùng tạm
  // trong lúc chưa có ảnh chụp thật. Khi có ảnh, set thêm `image` bên dưới.
  color: string;
  image?: string;
  name: string;
  pricePerPart: number;
};

type FruitBoxContent = {
  sizes: FruitBoxSize[];
  items: FruitBoxItem[];
};

// Giá tạm để demo giao diện — chưa phải giá bán thật, cần chỉnh lại
// trước khi tính năng đặt hộp thật được bật (xem docs/refactor-notes.md).
const fruitBoxContent: Record<Lang, FruitBoxContent> = {
  vi: {
    sizes: [
      { id: "small", label: "Hộp nhỏ", capacity: 3, fee: 10000 },
      { id: "medium", label: "Hộp vừa", capacity: 5, fee: 15000 },
      { id: "large", label: "Hộp lớn", capacity: 8, fee: 20000 },
    ],
    items: [
      { id: "xoai", emoji: "🥭", color: "#ffd98a", name: "Xoài", pricePerPart: 25000 },
      { id: "dua-hau", emoji: "🍉", color: "#ff9e96", name: "Dưa hấu", pricePerPart: 18000 },
      { id: "dua", emoji: "🍍", color: "#ffe58a", name: "Dứa", pricePerPart: 20000 },
      { id: "cam", emoji: "🍊", color: "#ffc48a", name: "Cam", pricePerPart: 20000 },
      { id: "dau-tay", emoji: "🍓", color: "#ffb0c4", name: "Dâu tây", pricePerPart: 35000 },
      { id: "nho", emoji: "🍇", color: "#d6b3f0", name: "Nho", pricePerPart: 30000 },
      { id: "kiwi", emoji: "🥝", color: "#c6e6a0", name: "Kiwi", pricePerPart: 28000 },
      { id: "tao", emoji: "🍎", color: "#ff8a80", name: "Táo", pricePerPart: 22000 },
    ],
  },
  en: {
    sizes: [
      { id: "small", label: "Small box", capacity: 3, fee: 10000 },
      { id: "medium", label: "Medium box", capacity: 5, fee: 15000 },
      { id: "large", label: "Large box", capacity: 8, fee: 20000 },
    ],
    items: [
      { id: "xoai", emoji: "🥭", color: "#ffd98a", name: "Mango", pricePerPart: 25000 },
      { id: "dua-hau", emoji: "🍉", color: "#ff9e96", name: "Watermelon", pricePerPart: 18000 },
      { id: "dua", emoji: "🍍", color: "#ffe58a", name: "Pineapple", pricePerPart: 20000 },
      { id: "cam", emoji: "🍊", color: "#ffc48a", name: "Orange", pricePerPart: 20000 },
      { id: "dau-tay", emoji: "🍓", color: "#ffb0c4", name: "Strawberry", pricePerPart: 35000 },
      { id: "nho", emoji: "🍇", color: "#d6b3f0", name: "Grapes", pricePerPart: 30000 },
      { id: "kiwi", emoji: "🥝", color: "#c6e6a0", name: "Kiwi", pricePerPart: 28000 },
      { id: "tao", emoji: "🍎", color: "#ff8a80", name: "Apple", pricePerPart: 22000 },
    ],
  },
};

export function getFruitBoxContent(lang: Lang): FruitBoxContent {
  return fruitBoxContent[lang];
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
 * Danh sách trái cây cho phần "Tự tay ghép hộp", dựng từ chính thực đơn hôm
 * nay thay vì danh sách cứng — khách chỉ ghép được những loại quán thật sự
 * đang có, không chọn nhầm loại đã hết hoặc chưa từng bán.
 */
export function fruitBoxItemsFromProducts(
  products: { id: string; emoji: string; name: string }[]
): FruitBoxItem[] {
  return products.map((product) => ({
    id: product.id,
    emoji: product.emoji,
    color: swatchFor(product.id),
    name: product.name,
    // Giá từng phần chưa dùng tới trong giao diện hiện tại (nút đặt hộp mới
    // chỉ hiện thông báo "sắp ra mắt"); để 0 cho tới khi tính năng đặt thật.
    pricePerPart: 0,
  }));
}
