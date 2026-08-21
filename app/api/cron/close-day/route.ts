import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { carryForwardToToday } from "@/lib/close-day";

export const dynamic = "force-dynamic";

/**
 * Chốt ngày tự động. Vercel Cron gọi lúc 00:00 giờ Việt Nam (= 17:00 UTC,
 * xem vercel.json) và gửi kèm header Authorization: Bearer $CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET chưa được cấu hình." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Không có quyền." }, { status: 401 });
  }

  const result = await carryForwardToToday();

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/fridge");
  revalidatePath("/admin");

  return NextResponse.json({
    ok: true,
    carried: result.carried,
    from: result.from?.toISOString().slice(0, 10) ?? null,
  });
}
