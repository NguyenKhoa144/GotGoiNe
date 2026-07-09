import { signOut } from "@/auth";
import { PosterGenerator } from "@/components/admin/poster-generator";

export default function AdminPosterPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- font chỉ cần cho trang poster này, không phải toàn site; App Router tự hoist link này vào <head> */}
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Dancing+Script:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <div className="animate-[fade-in-up_0.5s_ease-out]">
        <div className="flex justify-end bg-[#d4e8c2] px-4 pt-4">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border-2 border-[#1E5C2D] px-4 py-1.5 text-sm font-bold text-[#1E5C2D] transition-colors hover:bg-[#EAF0E3]"
            >
              Đăng xuất
            </button>
          </form>
        </div>
        <PosterGenerator />
      </div>
    </>
  );
}
