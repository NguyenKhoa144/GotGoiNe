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
