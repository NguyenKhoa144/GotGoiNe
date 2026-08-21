/**
 * Nén ảnh ngay trong trình duyệt trước khi gửi lên máy chủ.
 *
 * Chạy được ở MỌI nguồn ảnh — iPhone, máy Mac, ảnh tải từ mạng về — nên chỉ
 * cần một đường đi duy nhất, không phải phân biệt thiết bị.
 *
 * Ba việc nó làm:
 * 1. Thu nhỏ về tối đa `MAX_SIZE` — ảnh chỉ hiển thị trong ô vuông cỡ 150px,
 *    tải lên 4MB để hiện ở 150px là lãng phí hàng chục lần.
 * 2. Cắt vuông từ giữa — mọi thẻ trái cây có cùng tỷ lệ, giao diện đều tăm tắp.
 * 3. Xuất ra JPEG — thoát luôn bẫy HEIC của iPhone, máy nào cũng xem được.
 *
 * Máy chủ Vercel chỉ nhận request tối đa 4.5MB; nén trước ở đây nên trần đó
 * không còn là vấn đề.
 */

const MAX_SIZE = 1200;
const QUALITY = 0.82;

export type CompressResult = {
  file: File;
  /** Kích thước gốc và sau khi nén, tính bằng byte — để hiện cho admin thấy. */
  beforeBytes: number;
  afterBytes: number;
  /** Không nén được (trình duyệt không giải mã nổi ảnh) thì giữ nguyên file gốc. */
  skipped: boolean;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Trình duyệt không đọc được ảnh này."));
    };
    img.src = url;
  });
}

export async function compressImage(file: File): Promise<CompressResult> {
  const beforeBytes = file.size;

  try {
    const img = await loadImage(file);

    // Cắt vuông từ giữa: lấy cạnh ngắn làm cạnh hình vuông.
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const target = Math.min(side, MAX_SIZE);

    const canvas = document.createElement("canvas");
    canvas.width = target;
    canvas.height = target;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Không dựng được canvas.");

    // Nền trắng: ảnh PNG trong suốt khi xuất sang JPEG sẽ thành nền đen nếu
    // không tô trước.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, target, target);
    ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob) throw new Error("Không xuất được ảnh đã nén.");

    // Nén xong mà lại to hơn bản gốc (ảnh vốn đã rất nhỏ) thì giữ bản gốc.
    if (blob.size >= beforeBytes) {
      return { file, beforeBytes, afterBytes: beforeBytes, skipped: true };
    }

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return {
      file: new File([blob], name, { type: "image/jpeg" }),
      beforeBytes,
      afterBytes: blob.size,
      skipped: false,
    };
  } catch {
    // Thường gặp nhất: file HEIC mở trên Chrome/Firefox máy tính — hai trình
    // duyệt này không giải mã được HEIC. Trả lại file gốc để máy chủ tự báo
    // lỗi có hướng dẫn, thay vì chặn im lặng ở đây.
    return { file, beforeBytes, afterBytes: beforeBytes, skipped: true };
  }
}

/** 153600 -> "150KB" */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}
