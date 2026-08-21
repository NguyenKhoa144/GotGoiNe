/**
 * `next/image` chỉ tối ưu ảnh từ những tên miền đã khai báo trong
 * `next.config.ts`. Ảnh admin dán link vào có thể ở bất kỳ đâu, nên nếu ép hết
 * qua bộ tối ưu thì ảnh dán link sẽ hỏng im lặng — chỉ hiện ô trống.
 *
 * Cách xử lý: ảnh trong kho Blob của mình thì tối ưu bình thường; ảnh ngoài
 * thì đặt `unoptimized` để Next tải thẳng, bỏ qua bộ tối ưu và bỏ qua luôn
 * việc kiểm tra tên miền. Đổi lại ảnh ngoài không được thu nhỏ tự động — chấp
 * nhận được, vì đó chỉ là đường tạm trong lúc chưa bật Blob.
 */
const BLOB_HOST = ".public.blob.vercel-storage.com";

export function isOptimizableImage(url: string): boolean {
  // Ảnh nằm trong thư mục public của chính dự án — luôn tối ưu được.
  if (url.startsWith("/")) return true;
  try {
    return new URL(url).hostname.endsWith(BLOB_HOST);
  } catch {
    return false;
  }
}
