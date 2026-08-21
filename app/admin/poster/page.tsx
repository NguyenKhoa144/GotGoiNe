import { PosterGenerator } from "@/components/admin/poster-generator";

export default function AdminPosterPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- font chỉ cần cho trang poster này, không phải toàn site; App Router tự hoist link này vào <head> */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Dancing+Script:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <PosterGenerator />
    </>
  );
}
