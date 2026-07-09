declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (...args: unknown[]) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

type AddToCartInfo = {
  id: string;
  name?: string;
  price?: number;
};

/**
 * Gửi sự kiện "thêm sản phẩm" tới các nền tảng đã gắn Pixel/Analytics.
 * Mỗi nền tảng chỉ nhận event nếu script tương ứng đã load (script chỉ load
 * khi có ID trong .env), nên hàm này an toàn khi gọi kể cả lúc chưa gắn ID nào.
 */
export function trackAddToCart({ id, name, price }: AddToCartInfo) {
  if (typeof window === "undefined") return;

  window.fbq?.("track", "AddToCart", {
    content_ids: [id],
    content_name: name,
    value: price,
    currency: "VND",
  });

  window.ttq?.track("AddToCart", {
    content_id: id,
    content_name: name,
    value: price,
    currency: "VND",
  });

  window.gtag?.("event", "add_to_cart", {
    items: [{ item_id: id, item_name: name, price }],
  });
}
