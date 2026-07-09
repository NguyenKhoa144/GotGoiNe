import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/analytics";
import "./globals.css";
import "./home.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gotgoine.vercel.app"),
  title: "Gọt Gòi Nè | Trái cây gọt sẵn tại Cần Thơ",
  description:
    "Gọt Gòi Nè giao trái cây tươi gọt sẵn, đóng hộp ăn liền tại Phú Lợi, Cần Thơ.",
  openGraph: {
    title: "Gọt Gòi Nè | Trái cây gọt sẵn tại Cần Thơ",
    description:
      "Trái cây tươi gọt sẵn, đóng hộp ăn liền và giao nhanh tại Phú Lợi, Cần Thơ.",
    locale: "vi_VN",
    siteName: "Gọt Gòi Nè",
    type: "website",
    images: [
      {
        url: "/images/logo-main.jpg",
        width: 1103,
        height: 1103,
        alt: "Gọt Gòi Nè",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fdf7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased bg-[#f8fdf7]">
      <body className="min-h-dvh flex flex-col bg-[#f8fdf7] text-neutral-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
