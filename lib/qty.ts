/**
 * Mọi định lượng trong hệ thống thực đơn/tủ lạnh đều tính bằng GRAM.
 *
 * Trái cây nhập về là hàng cân — dù bán ra dưới dạng hộp, ly hay set thì
 * lượng trong kho vẫn là trọng lượng. Dùng gram (thay vì kg) để tránh số lẻ
 * kiểu 0.8kg hay 4kg2, và để mọi phép cộng tồn kho/hao hụt đều cùng một đơn vị.
 */

/** Định lượng gợi ý khi mới đưa một loại vào thực đơn. */
export const DEFAULT_QTY_GRAMS = 1000;

/** 1000 -> "1000g". */
export function formatGrams(amount: number): string {
  return `${amount}g`;
}
