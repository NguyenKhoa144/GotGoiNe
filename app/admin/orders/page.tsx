import { prisma } from "@/lib/prisma";
import { formatVnDate, formatVnTime, vnStartOfTodayInstant, vnToday } from "@/lib/date-vn";
import { OPEN_ORDER_STATUSES, type OrderStatus } from "@/lib/order-rules";
import { OrdersBoard, type OrderView } from "@/components/admin/orders-board";
import { findBoxSize } from "@/data/fruit-box";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // Đơn còn mở thì luôn hiện, kể cả đơn từ hôm qua chưa xử lý — nó vẫn đang
  // giữ hàng trong tủ. Đơn đã xong/đã huỷ chỉ hiện của hôm nay.
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ status: { in: OPEN_ORDER_STATUSES } }, { createdAt: { gte: vnStartOfTodayInstant() } }],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const views: OrderView[] = orders.map((order) => ({
    id: order.id,
    code: order.code,
    status: order.status as OrderStatus,
    timeLabel: formatVnTime(order.createdAt),
    boxLabel: `${findBoxSize(order.boxSizeId)?.label ?? "Hộp"} ${order.boxGrams}g`,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    note: order.note,
    items: order.items.map((item) => ({ name: item.productName, grams: item.grams })),
  }));

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold text-[#152b1a]">Đơn hàng</h1>
      <p className="mb-4 text-sm text-neutral-500">
        {formatVnDate(vnToday())} · Kho đã được trừ ngay khi khách đặt. Huỷ đơn thì hàng tự quay
        về tủ lạnh. Trang tự làm mới mỗi 15 giây.
      </p>
      <OrdersBoard orders={views} />
    </div>
  );
}
