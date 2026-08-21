"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { compressImage, formatBytes } from "@/lib/compress-image";

type ProductImageFieldProps = {
  /** Đã bật kho ảnh Vercel Blob chưa — chưa bật thì chỉ cho dán link. */
  blobEnabled: boolean;
  /** Ảnh hiện tại khi đang sửa một loại đã có. */
  defaultUrl?: string | null;
};

/**
 * Ô chọn ảnh dùng chung cho cả form thêm mới và form sửa.
 *
 * Có hai đường vào: tải file lên (đẩy sang Vercel Blob) hoặc dán link ảnh có
 * sẵn. Đường thứ hai luôn mở, kể cả khi chưa bật Blob — nhờ vậy tính năng ảnh
 * dùng được ngay, không phải chờ dựng hạ tầng.
 */
export function ProductImageField({ blobEnabled, defaultUrl }: ProductImageFieldProps) {
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sizeNote, setSizeNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /**
   * Nén ảnh ngay khi admin vừa chọn, rồi ĐẶT NGƯỢC file đã nén vào chính ô
   * chọn file — nhờ vậy form gửi đi bản nhẹ mà không cần thêm ô ẩn nào, và
   * ảnh xem trước chính là ảnh sẽ được lưu, không phải bản khác.
   */
  const onPick = async (input: HTMLInputElement) => {
    const original = input.files?.[0];
    if (!original) return;

    setBusy(true);
    setFileName(original.name);
    try {
      const result = await compressImage(original);

      if (!result.skipped) {
        const transfer = new DataTransfer();
        transfer.items.add(result.file);
        input.files = transfer.files;
        setSizeNote(
          `Đã nén ${formatBytes(result.beforeBytes)} → ${formatBytes(result.afterBytes)} · cắt vuông`
        );
      } else {
        setSizeNote(
          `Không nén được ảnh này (${formatBytes(result.beforeBytes)}). Nếu là ảnh HEIC từ iPhone, hãy mở bằng Safari hoặc xuất sang JPG.`
        );
      }

      setPreview(URL.createObjectURL(input.files![0]));
    } finally {
      setBusy(false);
    }
  };

  const box =
    "rounded-lg border border-neutral-300 px-3 py-2 font-normal outline-none focus:border-[#1e5c2e]";

  return (
    <div className="flex flex-col gap-2 text-sm font-semibold text-neutral-700">
      Ảnh trái cây (tuỳ chọn)

      <div className="flex items-start gap-3">
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-[#f0f9e1]">
          {preview ? (
            // Ảnh xem trước có thể là blob: URL của trình duyệt hoặc link ngoài
            // bất kỳ, nên dùng <img> thường thay vì <Image> để khỏi vướng khai
            // báo tên miền. Ảnh thật hiển thị cho khách vẫn đi qua <Image>.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] text-neutral-400">Chưa có</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            name="imageFile"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={!blobEnabled}
            onChange={(e) => void onPick(e.currentTarget)}
            className="text-[12px] font-normal file:mr-2 file:rounded-md file:border-0 file:bg-[#1e5c2e] file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white disabled:opacity-40"
          />

          {busy ? (
            <p className="text-[11px] font-normal text-neutral-500">Đang xử lý ảnh...</p>
          ) : sizeNote ? (
            <p className="text-[11px] font-normal text-[#1e5c2e]">{sizeNote}</p>
          ) : null}

          {!blobEnabled ? (
            <p className="text-[11px] font-normal text-orange-700">
              Chưa bật kho ảnh Vercel Blob nên chưa tải file lên được — tạm thời dán link ảnh
              vào ô dưới.
            </p>
          ) : null}

          <input
            name="imageUrl"
            defaultValue={defaultUrl ?? ""}
            placeholder="…hoặc dán link ảnh (https://...)"
            onChange={(e) => {
              if (fileName) return;
              const value = e.target.value.trim();
              setPreview(/^https?:\/\//i.test(value) ? value : null);
            }}
            className={`${box} text-[12px]`}
          />
        </div>
      </div>
    </div>
  );
}

/** Dùng ở trang khách — giữ <Image> để Next tối ưu kích thước ảnh. */
export function ProductThumb({
  url,
  emoji,
  alt,
  size = 64,
}: {
  url: string | null;
  emoji: string;
  alt: string;
  size?: number;
}) {
  if (!url) {
    return <span style={{ fontSize: size * 0.55 }}>{emoji}</span>;
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="h-full w-full object-cover"
    />
  );
}
