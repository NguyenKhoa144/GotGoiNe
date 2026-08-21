/** 45000 -> "45.000₫" (định dạng giá quen thuộc đang dùng trên trang chủ). */
export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}₫`;
}

/**
 * Đọc ngược một chuỗi giá cũ ("45.000₫") thành số nguyên đồng — dùng khi lấy
 * giá catalog làm giá gợi ý mặc định cho thực đơn ngày. Không parse được thì
 * trả về 0 để admin tự điền.
 */
export function parseVnd(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
