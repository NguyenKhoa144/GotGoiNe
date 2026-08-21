import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";

export type CarryResult = {
  carried: number;
  from: Date | null;
};

/**
 * Chuyển hàng còn tồn của ngày bán gần nhất sang thực đơn hôm nay.
 *
 * Quy tắc (theo đúng cách quán vận hành):
 * - Còn lại = nhập − đã bán − hư hỏng.
 * - Còn > 0 thì loại đó tiếp tục nằm trong thực đơn hôm nay với định lượng
 *   đúng bằng phần còn lại; số đã bán và hư hỏng bắt đầu lại từ 0.
 * - Còn <= 0 (bán hết hoặc hỏng hết) thì rời thực đơn, admin muốn bán tiếp
 *   phải chủ động thêm lại với lượng nhập mới.
 *
 * Dòng của ngày cũ được giữ nguyên làm lịch sử, không xoá.
 *
 * Chạy lại nhiều lần không nhân đôi: mỗi loại chỉ upsert đúng một dòng cho
 * hôm nay, và nếu dòng đã tồn tại thì không đụng vào số liệu đang chạy.
 */
export async function carryForwardToToday(): Promise<CarryResult> {
  const today = vnToday();

  const lastDay = await prisma.dailyMenuEntry.findFirst({
    where: { date: { lt: today } },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  if (!lastDay) return { carried: 0, from: null };

  const entries = await prisma.dailyMenuEntry.findMany({
    where: { date: lastDay.date },
    orderBy: { sortOrder: "asc" },
  });

  const survivors = entries
    .map((entry) => ({
      entry,
      remaining: entry.qtyGrams - entry.soldGrams - entry.spoiledGrams,
    }))
    .filter(({ remaining }) => remaining > 0);

  let carried = 0;
  for (const { entry, remaining } of survivors) {
    const result = await prisma.dailyMenuEntry.upsert({
      where: { productId_date: { productId: entry.productId, date: today } },
      update: {},
      create: {
        productId: entry.productId,
        date: today,
        priceToday: entry.priceToday,
        qtyGrams: remaining,
        sortOrder: entry.sortOrder,
      },
    });
    // upsert luôn trả về bản ghi; đếm những dòng thực sự vừa được tạo cho
    // hôm nay bằng cách so định lượng với phần còn lại chuyển sang.
    if (result.qtyGrams === remaining && result.soldGrams === 0) carried += 1;
  }

  return { carried, from: lastDay.date };
}

/**
 * Ngày bán gần nhất chưa được chuyển tiếp sang hôm nay — dùng để cảnh báo
 * trong trang quản trị khi cron lỡ không chạy (nếu không, hôm sau thực đơn
 * trống và khách vào trang chủ không thấy gì).
 */
export async function getPendingCarryDate(): Promise<Date | null> {
  const today = vnToday();

  const todayCount = await prisma.dailyMenuEntry.count({ where: { date: today } });
  if (todayCount > 0) return null;

  const lastDay = await prisma.dailyMenuEntry.findFirst({
    where: { date: { lt: today } },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  if (!lastDay) return null;

  const leftovers = await prisma.dailyMenuEntry.findMany({
    where: { date: lastDay.date },
    select: { qtyGrams: true, soldGrams: true, spoiledGrams: true },
  });
  const hasLeftover = leftovers.some(
    (e) => e.qtyGrams - e.soldGrams - e.spoiledGrams > 0
  );

  return hasLeftover ? lastDay.date : null;
}
