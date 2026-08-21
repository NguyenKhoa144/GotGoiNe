import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Ảnh trái cây admin tải lên được lưu ở Vercel Blob. Next.js chặn ảnh
        // từ tên miền lạ theo mặc định (tránh bị lợi dụng làm proxy ảnh), nên
        // phải khai báo tên miền này thì <Image> mới chịu hiển thị.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
