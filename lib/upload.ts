import { put } from "@vercel/blob";

/**
 * Lưu ảnh trái cây.
 *
 * Ảnh được đẩy lên Vercel Blob chứ không ghi vào thư mục `public/` của dự án:
 * máy chủ Vercel có ổ đĩa CHỈ ĐỌC, file ghi lúc chạy sẽ biến mất ở lần deploy
 * kế tiếp. Blob là kho file riêng, tồn tại độc lập với code.
 *
 * Nếu chưa bật Blob (chưa có `BLOB_READ_WRITE_TOKEN`), hàm trả về lỗi có
 * hướng dẫn thay vì ném exception — admin vẫn dùng được cách dán link ảnh.
 */

/** Bật/tắt phần tải ảnh trong giao diện tuỳ theo đã cấu hình Blob hay chưa. */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadResult = { url: string } | { error: string };

export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!isBlobConfigured()) {
    return {
      error:
        "Chưa bật kho ảnh Vercel Blob. Tạm thời dán link ảnh vào ô bên dưới, " +
        "hoặc tạo Blob store trên Vercel rồi thêm BLOB_READ_WRITE_TOKEN.",
    };
  }
  if (!ALLOWED.includes(file.type)) {
    return { error: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF." };
  }
  if (file.size > MAX_BYTES) {
    return { error: `Ảnh nặng quá (tối đa ${MAX_BYTES / 1024 / 1024}MB).` };
  }

  try {
    // `addRandomSuffix` để hai lần tải cùng tên file không đè lên nhau — ảnh cũ
    // có thể vẫn đang được dùng ở chỗ khác.
    const blob = await put(`products/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { url: blob.url };
  } catch (e) {
    return { error: `Tải ảnh thất bại: ${e instanceof Error ? e.message : "lỗi không rõ"}` };
  }
}
