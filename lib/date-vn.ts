// Toàn bộ khái niệm "ngày" trong hệ thống thực đơn/tủ lạnh đều tính theo lịch
// Việt Nam, không theo giờ máy chủ: Vercel chạy UTC, nếu dùng thẳng new Date()
// thì từ 17:00 giờ VN trở đi máy chủ đã sang ngày mới trong khi quán vẫn đang
// bán hàng của hôm nay — menu sẽ lệch một ngày một cách âm thầm.
//
// Việt Nam cố định UTC+7, không có giờ mùa hè, nên cộng thẳng offset là đủ.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Ngày hôm nay theo lịch VN, trả về mốc 00:00 UTC của chính ngày đó. */
export function vnToday(): Date {
  const vnNow = new Date(Date.now() + VN_OFFSET_MS);
  return new Date(
    Date.UTC(vnNow.getUTCFullYear(), vnNow.getUTCMonth(), vnNow.getUTCDate())
  );
}

/** Cộng/trừ số ngày vào một mốc ngày (giữ nguyên quy ước 00:00 UTC). */
export function addDays(date: Date, days: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days)
  );
}

const DAY_NAMES = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

/** Ví dụ: "Thứ Năm, 21/08/2026" — dùng cho tiêu đề thực đơn hôm nay. */
export function formatVnDate(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${DAY_NAMES[date.getUTCDay()]}, ${d}/${m}/${date.getUTCFullYear()}`;
}

/**
 * Ví dụ: "21/08" — dùng cho nhật ký hao hụt. Nhận vào mốc ngày đã chuẩn hoá
 * theo quy ước 00:00 UTC (do vnToday sinh ra), nên đọc thẳng phần UTC.
 */
export function formatShortDate(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
}
