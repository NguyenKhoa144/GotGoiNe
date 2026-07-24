export type FruitInfo = {
  emoji: string;
  desc: string;
};

export type Fruit = FruitInfo & {
  name: string;
  matchType: "exact" | "guess" | "unknown";
  matchedKey?: string;
};

const FRUIT_DB: Record<string, FruitInfo> = {
  "kiwi": { emoji: "🥝", desc: "Giàu vitamin C, tốt cho hệ miễn dịch" },
  "xoài": { emoji: "🥭", desc: "Ngọt mát, giàu vitamin A và C" },
  "mận": { emoji: "🍑", desc: "Thanh nhiệt, hỗ trợ tiêu hóa" },
  "ổi": { emoji: "🍏", desc: "Giàu vitamin C, tốt cho làn da" },
  "ổi ruby": { emoji: "🍏", desc: "Giàu vitamin C, tốt cho làn da" },
  "thanh long": { emoji: "🌵", desc: "Giàu chất xơ, tốt cho đường ruột" },
  "dưa hấu": { emoji: "🍉", desc: "Mát lạnh, giải nhiệt ngày hè" },
  "dưa lưới": { emoji: "🍈", desc: "Ngọt mát, thơm dịu" },
  "cam": { emoji: "🍊", desc: "Bổ sung vitamin C, tăng đề kháng" },
  "bưởi": { emoji: "🟡", desc: "Ít calo, hỗ trợ giảm cân" },
  "bưởi hồng": { emoji: "🟡", desc: "Ít calo, hỗ trợ giảm cân" },
  "nho": { emoji: "🍇", desc: "Chống oxy hóa, tốt cho tim mạch" },
  "dâu tây": { emoji: "🍓", desc: "Giàu antioxidant, làm đẹp da" },
  "cherry": { emoji: "🍒", desc: "Giòn ngọt, giàu dinh dưỡng" },
  "cherry mỹ": { emoji: "🍒", desc: "Giòn ngọt, giàu dinh dưỡng" },
  "chuối": { emoji: "🍌", desc: "Giàu kali, cung cấp năng lượng" },
  "lê": { emoji: "🍐", desc: "Mát lành, hỗ trợ tiêu hóa" },
  "măng cụt": { emoji: "🟤", desc: "Thanh nhiệt, chống oxy hóa" },
  "mãng cụt": { emoji: "🟤", desc: "Thanh nhiệt, chống oxy hóa" },
  "đu đủ": { emoji: "🧡", desc: "Giàu vitamin A, tốt cho mắt và làn da" },
  "chôm chôm": { emoji: "🔴", desc: "Giàu nước, giúp giải nhiệt" },
  "chôm thái": { emoji: "🔴", desc: "Giàu nước, giúp giải nhiệt" },
  "khóm": { emoji: "🍍", desc: "Giàu enzyme, hỗ trợ tiêu hóa" },
  "dứa": { emoji: "🍍", desc: "Giàu enzyme, hỗ trợ tiêu hóa" },
  "cốc": { emoji: "🥥", desc: "Giàu điện giải, thanh mát cơ thể" },
  "cốc non": { emoji: "🥥", desc: "Giàu điện giải, thanh mát cơ thể" },
  "củ sắn": { emoji: "🤍", desc: "Bổ sung tinh bột, năng lượng lành mạnh" },
  "sắn": { emoji: "🤍", desc: "Bổ sung tinh bột, năng lượng lành mạnh" },
  "bơ": { emoji: "🥑", desc: "Giàu chất béo lành mạnh, tốt cho da" },
  "nhãn": { emoji: "⚪", desc: "Ngọt mát, bổ máu tăng năng lượng" },
  "vải": { emoji: "🩷", desc: "Ngọt thơm, giàu vitamin C" },
  "táo": { emoji: "🍎", desc: "Giàu chất xơ, hỗ trợ tiêu hóa" },
  "táo bom": { emoji: "🍎", desc: "Giàu chất xơ, hỗ trợ tiêu hóa" },
};

const FALLBACK: FruitInfo = { emoji: "🍀", desc: "Tươi ngon, giàu dưỡng chất tự nhiên" };

export function lookupFruit(name: string): Fruit {
  const key = name.trim().toLowerCase();
  if (FRUIT_DB[key]) return { name, ...FRUIT_DB[key], matchType: "exact" };

  for (const [k, v] of Object.entries(FRUIT_DB)) {
    if (key.includes(k) || k.includes(key)) return { name, ...v, matchType: "guess", matchedKey: k };
  }

  return { name, ...FALLBACK, matchType: "unknown" };
}
