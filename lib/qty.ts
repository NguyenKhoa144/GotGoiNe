/**
 * Đơn vị bán của một loại hàng.
 *
 * "kg" là hàng cân (ổi, xoài nguyên trái...) — định lượng nhập/bán/hư hỏng
 * đều tính bằng GRAM để tránh số lẻ kiểu 0.8kg hay 4kg2.
 *
 * Các đơn vị còn lại là hàng đếm được (hộp cắt sẵn, ly hoa quả dầm, set quà)
 * — định lượng là số nguyên đúng đơn vị đó, không quy ra gram.
 */
export const PRODUCT_UNITS = ["kg", "hộp", "ly", "set", "quả"] as const;

/** Nhãn hiển thị cạnh con số: hàng cân ghi "g", hàng đếm ghi đúng đơn vị. */
export function qtyUnitLabel(unit: string): string {
  return unit === "kg" ? "g" : unit;
}

/** "1000g" cho hàng cân, "10 hộp" cho hàng đếm (có dấu cách cho dễ đọc). */
export function formatQty(amount: number, unit: string): string {
  return unit === "kg" ? `${amount}g` : `${amount} ${unit}`;
}

/** Định lượng gợi ý khi mới đưa một loại vào thực đơn. */
export function defaultQty(unit: string): number {
  return unit === "kg" ? 1000 : 10;
}

/** Số đơn vị dùng để nhân với giá: hàng cân quy gram về kg, hàng đếm giữ nguyên. */
export function toPriceUnits(amount: number, unit: string): number {
  return unit === "kg" ? amount / 1000 : amount;
}
