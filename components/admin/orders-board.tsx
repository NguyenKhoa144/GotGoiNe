"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceOrder, cancelOrder } from "@/app/admin/orders/actions";
import { formatGrams } from "@/lib/qty";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-rules";

export type OrderView = {
  id: string;
  code: string;
  status: OrderStatus;
  timeLabel: string;
  boxLabel: string;
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  items: { name: string; grams: number }[];
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-[#fde9a0] text-[#7a5400]",
  CONFIRMED: "bg-blue-50 text-blue-700",
  DONE: "bg-[#e6f4d8] text-[#1e5c2e]",
  CANCELLED: "bg-neutral-100 text-neutral-500",
};

const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  PENDING: "Đã gọi xác nhận",
  CONFIRMED: "Đã giao",
};

/** Hỏi lại máy chủ mỗi 15 giây khi tab đang mở, để đơn mới tự hiện ra. */
const REFRESH_MS = 15_000;

export function OrdersBoard({ orders }: { orders: OrderView[] }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  const open = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED");
  const closed = orders.filter((o) => o.status === "DONE" || o.status === "CANCELLED");

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h2 className="mb-2 text-sm font-bold text-[#152b1a]">Cần xử lý ({open.length})</h2>
        {open.length === 0 ? (
          <p className="rounded-[14px] border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-500">
            Chưa có đơn nào đang chờ.
          </p>
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {open.map((order) => (
              <OrderCard key={`${order.id}:${order.status}`} order={order} />
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-neutral-500">Đã xong hôm nay ({closed.length})</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {closed.map((order) => (
              <OrderCard key={`${order.id}:${order.status}`} order={order} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function OrderCard({ order }: { order: OrderView }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isOpen = order.status === "PENDING" || order.status === "CONFIRMED";
  const advanceLabel = ADVANCE_LABELS[order.status];

  const run = (action: () => Promise<string | null>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result) setError(result);
    });
  };

  const handleCancel = () => {
    const ok = window.confirm(
      `Huỷ đơn ${order.code} của ${order.customerName}?\n\n` +
        "Toàn bộ trái cây trong đơn sẽ được hoàn về tủ lạnh."
    );
    if (ok) run(() => cancelOrder(order.id));
  };

  return (
    <article
      className={`flex flex-col gap-2 rounded-[14px] border bg-white p-4 ${
        order.status === "PENDING" ? "border-[#f5a800]" : "border-neutral-200"
      } ${isOpen ? "" : "opacity-70"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-base font-bold text-[#152b1a]">{order.code}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="text-[11px] text-neutral-500">
        {order.timeLabel} · {order.boxLabel}
      </div>

      <ul className="flex flex-col gap-0.5 text-sm">
        {order.items.map((item) => (
          <li key={item.name} className="flex justify-between">
            <span>{item.name}</span>
            <span className="tabular-nums text-neutral-600">{formatGrams(item.grams)}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-neutral-100 pt-2 text-sm">
        <div className="font-semibold text-[#152b1a]">{order.customerName}</div>
        <a href={`tel:${order.phone}`} className="text-[#1e5c2e] underline">
          {order.phone}
        </a>
        <div className="text-neutral-600">{order.address}</div>
        {order.note ? <div className="mt-1 text-xs italic text-neutral-500">“{order.note}”</div> : null}
      </div>

      {isOpen ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {advanceLabel ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => advanceOrder(order.id, order.status))}
              className="rounded-lg bg-[#1e5c2e] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Đang lưu..." : advanceLabel}
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={handleCancel}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Huỷ & hoàn kho
          </button>
        </div>
      ) : null}
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </article>
  );
}
