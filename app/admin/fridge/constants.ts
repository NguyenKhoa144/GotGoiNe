// Tách riêng khỏi actions.ts vì file "use server" chỉ được export async
// function, không được export hằng số.

import type { MovementKind } from "@/lib/stock";

/**
 * Những thao tác admin có thể làm với tủ lạnh, gộp chung vào một danh sách
 * duy nhất thay vì mỗi loại một nút riêng — thực tế lúc đứng bán chỉ cần
 * chọn "vì sao" rồi gõ số gram, không cần nhớ nút nào nằm đâu.
 *
 * `kind` quyết định cộng hay trừ kho; `reason` là lý do lưu vào nhật ký.
 */
export const FRIDGE_ACTIONS = [
  { id: "import", label: "Nhập thêm hàng", kind: "IMPORT", reason: null },
  { id: "sale", label: "Bán tại chỗ", kind: "SALE", reason: null },
  { id: "thao", label: "Thảo ăn", kind: "LOSS", reason: "Thảo ăn" },
  { id: "damaged", label: "Hư / dập", kind: "LOSS", reason: "Hư/dập" },
  { id: "expired", label: "Hết hạn", kind: "LOSS", reason: "Hết hạn" },
  { id: "other", label: "Lý do khác", kind: "LOSS", reason: "Khác" },
  // Không cộng/trừ mà ĐẶT LẠI tồn kho bằng đúng số vừa đếm được. Chênh lệch
  // do máy tự tính. Có thao tác này thì admin không bao giờ phải sửa trần
  // database khi số trên máy lệch với số thật trong tủ.
  { id: "recount", label: "Đếm lại, sửa tồn thành", kind: "ADJUST", reason: "Đếm lại tủ lạnh" },
] as const satisfies readonly {
  id: string;
  label: string;
  kind: MovementKind;
  reason: string | null;
}[];

export type FridgeActionId = (typeof FRIDGE_ACTIONS)[number]["id"];
