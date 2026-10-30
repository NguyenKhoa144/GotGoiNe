import { auth } from "@/auth";

/**
 * Gọi ở DÒNG ĐẦU của mọi server action dành cho admin.
 *
 * `proxy.ts` chỉ chặn theo đường dẫn `/admin/...` — nó bảo vệ việc MỞ TRANG,
 * không bảo vệ action. Mỗi server action là một đường vào riêng, gọi thẳng
 * được bằng một request POST từ bất kỳ đâu (xem tài liệu Next đi kèm:
 * node_modules/next/dist/docs/01-app/02-guides/data-security.md, mục
 * "Authentication and authorization"). Không kiểm tra ở đây thì người ngoài
 * biết cách vẫn nhập kho, xoá sản phẩm, huỷ đơn được.
 */
export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Không có quyền thực hiện thao tác này.");
  }
}
