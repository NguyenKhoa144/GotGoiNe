/**
 * Quy tắc đặt hộp — thuần tính toán, không đụng database, nên dùng chung được
 * cho cả trình duyệt (xem trước) lẫn máy chủ (quyết định thật). Máy chủ luôn
 * tính lại từ đầu, không tin con số nào trình duyệt gửi lên.
 */

export const ORDER_LIMITS = {
  maxKinds: 10,
  maxPartsPerKind: 20,
  maxTotalParts: 40,
  /** Số đơn đang chờ xác nhận tối đa cho một số điện thoại — chặn giữ hàng ảo. */
  maxPendingPerPhone: 3,
} as const;

export type OrderPart = { productId: string; parts: number };

export type PlaceOrderInput = {
  idempotencyKey: string;
  boxSizeId: string;
  items: OrderPart[];
  customerName: string;
  phone: string;
  address: string;
  note?: string;
};

/** Một loại không đủ hàng, kèm số gram khách cần và số gram tủ còn thật. */
export type UnavailableItem = {
  productId: string;
  name: string;
  wantedGrams: number;
  availableGrams: number;
};

export type PlaceOrderResult =
  | { ok: true; code: string }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "unavailable"; items: UnavailableItem[] };

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "DONE", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  DONE: "Đã giao",
  CANCELLED: "Đã huỷ",
};

/** Đơn ở hai trạng thái này vẫn đang giữ hàng trong tủ. */
export const OPEN_ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED"];

/**
 * Chia trọng lượng hộp cho từng loại theo số "phần" khách chọn.
 *
 * Hộp 500g, xoài 2 phần + dứa 1 phần -> xoài 333g, dứa 167g. Phần lẻ do làm
 * tròn được chia cho loại có phần dư lớn nhất, nên tổng LUÔN đúng bằng trọng
 * lượng hộp — không bao giờ trừ kho nhiều hay ít hơn cái hộp thật.
 */
export function splitGrams(boxGrams: number, items: OrderPart[]): Map<string, number> {
  const totalParts = items.reduce((sum, item) => sum + item.parts, 0);
  const result = new Map<string, number>();
  if (totalParts <= 0) return result;

  const shares = items.map((item, index) => {
    const exact = (boxGrams * item.parts) / totalParts;
    return { id: item.productId, index, base: Math.floor(exact), rest: exact - Math.floor(exact) };
  });

  let leftover = boxGrams - shares.reduce((sum, share) => sum + share.base, 0);
  const byRest = [...shares].sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const share of byRest) {
    if (leftover <= 0) break;
    share.base += 1;
    leftover -= 1;
  }

  for (const share of shares) result.set(share.id, share.base);
  return result;
}

/**
 * Chuẩn hoá số điện thoại Việt Nam: bỏ khoảng trắng, dấu chấm, gạch; đổi
 * "+84"/"84" đầu thành "0". Trả về `null` nếu không phải số hợp lệ (10 số di
 * động hoặc 11 số bàn, bắt đầu bằng 0).
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+84")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("84") && digits.length === 11) digits = "0" + digits.slice(2);
  return /^0\d{9,10}$/.test(digits) ? digits : null;
}

/**
 * Kiểm tra toàn bộ đầu vào. Trả về câu lỗi tiếng Việt cho khách, hoặc `null`.
 * Chạy ở trình duyệt để báo sớm, và chạy LẠI ở máy chủ vì đầu vào từ trình
 * duyệt sửa được tuỳ ý.
 */
export function validateOrderInput(input: PlaceOrderInput): string | null {
  if (typeof input.idempotencyKey !== "string" || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 100) {
    return "Phiên đặt hàng không hợp lệ, vui lòng tải lại trang.";
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return "Bạn chưa chọn loại trái nào.";
  }
  if (input.items.length > ORDER_LIMITS.maxKinds) {
    return `Mỗi hộp tối đa ${ORDER_LIMITS.maxKinds} loại.`;
  }
  const seen = new Set<string>();
  let totalParts = 0;
  for (const item of input.items) {
    if (typeof item.productId !== "string" || !item.productId || seen.has(item.productId)) {
      return "Danh sách trái cây không hợp lệ, vui lòng tải lại trang.";
    }
    seen.add(item.productId);
    if (!Number.isInteger(item.parts) || item.parts < 1 || item.parts > ORDER_LIMITS.maxPartsPerKind) {
      return "Số phần của mỗi loại không hợp lệ.";
    }
    totalParts += item.parts;
  }
  if (totalParts > ORDER_LIMITS.maxTotalParts) {
    return `Tổng số phần tối đa là ${ORDER_LIMITS.maxTotalParts}.`;
  }

  const name = String(input.customerName ?? "").trim();
  if (name.length < 2 || name.length > 60) return "Vui lòng nhập tên (2–60 ký tự).";
  if (!normalizePhone(String(input.phone ?? ""))) {
    return "Số điện thoại chưa đúng — cần 10 số, bắt đầu bằng 0.";
  }
  const address = String(input.address ?? "").trim();
  if (address.length < 5 || address.length > 200) return "Vui lòng nhập địa chỉ giao hàng.";
  if (input.note && String(input.note).length > 300) return "Ghi chú tối đa 300 ký tự.";

  return null;
}
