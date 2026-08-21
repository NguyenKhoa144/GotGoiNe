import { prisma } from "@/lib/prisma";
import { addDays, vnToday } from "@/lib/date-vn";

export type CarryResult = {
  carried: number;
  from: Date | null;
};

/**
 * Sang ngày mới, bê DANH SÁCH thực đơn của ngày bán gần nhất sang hôm nay.
 *
 * Từ bước 2 trở đi, dòng thực đơn không còn giữ định lượng nữa — tồn kho nằm
 * ở `Product.stockGrams` và tự chạy dài qua ngày. Nên việc duy nhất còn lại
 * khi qua ngày là: hôm qua bày bán loại nào thì hôm nay bày tiếp loại đó,
 * miễn là tủ lạnh còn hàng.
 *
 * - Loại nào admin đã chủ động gỡ khỏi thực đơn thì không có dòng của hôm qua,
 *   nên tự nhiên không quay lại — đúng ý "gỡ rồi thì thôi".
 * - Loại nào hết sạch hàng thì không bê sang; nhập hàng lại thì admin tự thêm.
 *
 * Dòng của ngày cũ được giữ nguyên làm lịch sử, không xoá. Chạy lại nhiều lần
 * không nhân đôi vì mỗi loại chỉ upsert đúng một dòng cho hôm nay.
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
    include: { product: true },
    orderBy: { sortOrder: "asc" },
  });

  let carried = 0;
  for (const entry of entries) {
    if (entry.product.stockGrams <= 0) continue;

    const existing = await prisma.dailyMenuEntry.findUnique({
      where: { productId_date: { productId: entry.productId, date: today } },
    });
    if (existing) continue;

    await prisma.dailyMenuEntry.create({
      data: {
        productId: entry.productId,
        date: today,
        priceToday: entry.priceToday,
        qtyGrams: entry.product.stockGrams,
        sortOrder: entry.sortOrder,
      },
    });
    carried += 1;
  }

  return { carried, from: lastDay.date };
}

/**
 * Thực đơn hôm nay có phải vừa được bê nguyên từ hôm qua sang không — dùng để
 * nhắc admin xem lại menu đầu ngày thay vì cứ để nguyên như hôm trước.
 */
export async function wasCarriedFromYesterday(): Promise<boolean> {
  const today = vnToday();
  const yesterday = addDays(today, -1);

  const [todayCount, yesterdayCount] = await Promise.all([
    prisma.dailyMenuEntry.count({ where: { date: today } }),
    prisma.dailyMenuEntry.count({ where: { date: yesterday } }),
  ]);
  if (todayCount === 0 || yesterdayCount === 0) return false;

  // Nếu chưa có dòng nào của hôm nay được tạo sau nửa đêm bởi thao tác tay thì
  // coi như menu vẫn y nguyên bản bê sang.
  const touchedToday = await prisma.dailyMenuEntry.count({
    where: { date: today, createdAt: { gt: today } },
  });

  return touchedToday === 0;
}
