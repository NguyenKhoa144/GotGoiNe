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
        width: 1254,
        height: 1254,
        alt: "Gọt Gòi Nè",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fdf7",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Gọt Gòi Nè",
  image: "https://gotgoine.vercel.app/images/logo-main.jpg",
  description:
    "Trái cây tươi gọt sẵn, đóng hộp ăn liền, đặt online và giao tận nơi. Đặt trước 30-60 phút.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Đường 30/4",
    addressLocality: "Phú Lợi",
    addressRegion: "Sóc Trăng",
    addressCountry: "VN",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "10:00",
    closes: "20:00",
  },
  url: "https://gotgoine.vercel.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased bg-[#f8fdf7]">
      <body className="min-h-dvh flex flex-col bg-[#f8fdf7] text-neutral-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
