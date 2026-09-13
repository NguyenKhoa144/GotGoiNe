import { Bike, Clock, Leaf, Package, ShieldCheck, Slice } from "lucide-react";

/**
 * Icon dùng cho các thẻ ở phần "Tại sao chọn chúng tôi" và "Quy trình".
 *
 * Trước đây các thẻ này để thẳng emoji (⏱️ 🛡️ 🌿 🔪 📦 🛵) trong dữ liệu.
 * Emoji do hệ điều hành vẽ nên mỗi máy một kiểu — iPhone, Android và Windows
 * ra ba hình khác nhau, nhiều màu, không ăn nhập với tông xanh của thương
 * hiệu. Dùng icon SVG thì hình giống nhau trên mọi máy và ăn theo màu chữ.
 */
const ICONS = {
  clock: Clock,
  shield: ShieldCheck,
  leaf: Leaf,
  knife: Slice,
  box: Package,
  scooter: Bike,
} as const;

export type SectionIconName = keyof typeof ICONS;

type SectionIconProps = {
  name: SectionIconName;
  size?: number;
};

export function SectionIcon({ name, size = 26 }: SectionIconProps) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={1.9} aria-hidden="true" />;
}
