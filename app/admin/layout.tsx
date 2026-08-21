import Link from "next/link";
import { signOut } from "@/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fade-in-up_0.5s_ease-out]">
      <div className="flex items-center justify-between bg-[#d4e8c2] px-4 py-3">
        <nav className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#1E5C2D] hover:bg-[#EAF0E3]"
          >
            Tổng quan
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#1E5C2D] hover:bg-[#EAF0E3]"
          >
            Sản phẩm
          </Link>
          <Link
            href="/admin/fridge"
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#1E5C2D] hover:bg-[#EAF0E3]"
          >
            Tủ lạnh
          </Link>
          <Link
            href="/admin/stats"
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#1E5C2D] hover:bg-[#EAF0E3]"
          >
            Thống kê
          </Link>
          <Link
            href="/admin/poster"
            className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#1E5C2D] hover:bg-[#EAF0E3]"
          >
            Poster
          </Link>
        </nav>
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
      {children}
    </div>
  );
}
