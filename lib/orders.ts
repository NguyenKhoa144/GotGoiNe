import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { vnToday } from "@/lib/date-vn";
import { applyStockMovementsInTx, NotEnoughStock } from "@/lib/stock";
import { findBoxSize } from "@/data/fruit-box";
import {
  normalizePhone,
  OPEN_ORDER_STATUSES,
  ORDER_LIMITS,
  splitGrams,
  validateOrderInput,
  type OrderStatus,
  type PlaceOrderInput,
  type PlaceOrderResult,
  type UnavailableItem,
} from "@/lib/order-rules";

/**
 * Đơn đặt hộp — phương án A: TRỪ KHO NGAY LÚC ĐẶT.
 *
 * Ai được, ai không: đơn nào tới database trước thì được. Tạo dòng `Order` và
 * trừ kho nằm trong cùng một transaction; câu trừ kho có điều kiện "còn đủ"
 * (xem `takeFromStock` trong lib/stock.ts), nên hai khách cùng đặt phần cuối
 * cùng thì database bắt đơn sau xếp hàng, kiểm lại, rồi từ chối. Bằng chứng
 * là dòng SALE trong sổ cái, ghi kèm mã đơn và giờ tới từng mili giây.
 */

// Bỏ những ký tự dễ đọc nhầm qua điện thoại: 0/O, 1/I/L.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function newOrderCode(): string {
  let code = "GG-";
  for (let i = 0; i < 4; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

function isUniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;
  const target = error.meta?.target;
  return Array.isArray(target) ? target.includes(field) : String(target ?? "").includes(field);
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const invalid = validateOrderInput(input);
  if (invalid) return { ok: false, reason: "invalid", message: invalid };

  const box = findBoxSize(input.boxSizeId);
  if (!box) return { ok: false, reason: "invalid", message: "Cỡ hộp không hợp lệ, vui lòng chọn lại." };

  // Bấm hai lần, hoặc mạng chập chờn gửi lại: trả về đúng đơn đã tạo.
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return { ok: true, code: existing.code };

  const phone = normalizePhone(input.phone)!;
  const pending = await prisma.order.count({ where: { phone, status: "PENDING" } });
  if (pending >= ORDER_LIMITS.maxPendingPerPhone) {
    return {
      ok: false,
      reason: "invalid",
      message: `Số ${phone} đang có ${pending} đơn chờ xác nhận. Quán sẽ gọi bạn ngay — vui lòng chờ hoặc gọi trực tiếp cho quán.`,
    };
  }

  const gramsById = splitGrams(box.grams, input.items);
  const ids = input.items.map((item) => item.productId);

  // Chỉ đặt được loại đang nằm trong thực đơn hôm nay — đúng nguồn mà trang
  // chủ dùng để hiện cho khách (lib/products.ts).
  const onMenu = await prisma.dailyMenuEntry.findMany({
    where: { date: vnToday(), productId: { in: ids } },
    include: { product: true },
  });
  const productById = new Map(onMenu.map((entry) => [entry.productId, entry.product]));

  const notOnMenu = ids.filter((id) => {
    const product = productById.get(id);
    return !product || product.archivedAt;
  });
  if (notOnMenu.length > 0) {
    return { ok: false, reason: "unavailable", items: await describeShortages(input, gramsById) };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newOrderCode();
    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            code,
            idempotencyKey: input.idempotencyKey,
            boxSizeId: box.id,
            boxGrams: box.grams,
            customerName: input.customerName.trim(),
            phone,
            address: input.address.trim(),
            note: input.note?.trim() || null,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                productName: productById.get(item.productId)!.name,
                parts: item.parts,
                grams: gramsById.get(item.productId)!,
              })),
            },
          },
        });

        await applyStockMovementsInTx(
          tx,
          input.items.map((item) => ({
            productId: item.productId,
            kind: "SALE" as const,
            amountGrams: gramsById.get(item.productId)!,
            reason: `Đơn ${code}`,
            orderId: order.id,
          }))
        );
      });
      return { ok: true, code };
    } catch (error) {
      if (error instanceof NotEnoughStock) {
        const items = await describeShortages(input, gramsById);
        // Hiếm: lúc kiểm lại thì tủ đã có hàng lại (vừa nhập). Thử lại đơn.
        if (items.length === 0) continue;
        return { ok: false, reason: "unavailable", items };
      }
      // Cùng một lần bấm gửi tới hai lần gần như cùng lúc: lần sau đụng
      // khoá duy nhất của idempotencyKey -> trả về đơn của lần trước.
      if (isUniqueViolation(error, "idempotencyKey")) {
        const twin = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
        if (twin) return { ok: true, code: twin.code };
      }
      // Trùng mã đơn (1 trên ~900 nghìn) -> sinh mã khác, thử lại.
      if (isUniqueViolation(error, "code")) continue;
      throw error;
    }
  }

  return { ok: false, reason: "invalid", message: "Quán đang bận, bạn bấm đặt lại giúp nhé." };
}

/**
 * Đọc lại tủ lạnh SAU khi đơn bị từ chối, để nói đúng cho khách loại nào
 * thiếu và còn bao nhiêu — không đoán, không dùng số cũ trên màn hình khách.
 */
async function describeShortages(
  input: PlaceOrderInput,
  gramsById: Map<string, number>
): Promise<UnavailableItem[]> {
  const ids = input.items.map((item) => item.productId);
  const [products, onMenu] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: ids } } }),
    prisma.dailyMenuEntry.findMany({ where: { date: vnToday(), productId: { in: ids } }, select: { productId: true } }),
  ]);
  const menuIds = new Set(onMenu.map((entry) => entry.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  const shortages: UnavailableItem[] = [];
  for (const id of ids) {
    const product = byId.get(id);
    const wanted = gramsById.get(id) ?? 0;
    const available = product && !product.archivedAt && menuIds.has(id) ? product.stockGrams : 0;
    if (available < wanted) {
      shortages.push({ productId: id, name: product?.name ?? "Loại này", wantedGrams: wanted, availableGrams: available });
    }
  }
  return shortages;
}

/**
 * Huỷ đơn và hoàn hàng về tủ. Đổi trạng thái có điều kiện "đang mở" nằm
 * chung câu lệnh, nên bấm huỷ hai lần (hai máy) cũng chỉ hoàn kho MỘT lần.
 * Không xoá dòng SALE nào — ghi thêm dòng RETURN, sổ cái vẫn kể đủ chuyện.
 */
export async function cancelOrder(orderId: string): Promise<string | null> {
  try {
    const done = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id: orderId, status: { in: OPEN_ORDER_STATUSES } },
        data: { status: "CANCELLED" },
      });
      if (updated.count === 0) return false;

      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
      await applyStockMovementsInTx(
        tx,
        order.items.map((item) => ({
          productId: item.productId,
          kind: "RETURN" as const,
          amountGrams: item.grams,
          reason: `Huỷ đơn ${order.code}`,
          orderId: order.id,
        }))
      );
      return true;
    });
    return done ? null : "Đơn này đã giao hoặc đã huỷ rồi.";
  } catch (error) {
    // Không xảy ra được nếu archiveProduct làm đúng (không cho ẩn loại đang
    // có đơn mở), nhưng nếu xảy ra thì báo rõ thay vì làm hỏng tủ lạnh.
    if (error instanceof NotEnoughStock) {
      return "Không hoàn được hàng: một loại trong đơn đã bị ẩn. Bỏ ẩn loại đó rồi huỷ lại.";
    }
    throw error;
  }
}

/** Các bước tiến của đơn: chờ -> đã xác nhận -> đã giao. */
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "DONE",
};

export async function advanceOrder(orderId: string, from: OrderStatus): Promise<string | null> {
  const to = NEXT_STATUS[from];
  if (!to) return "Đơn này không chuyển tiếp được nữa.";
  const updated = await prisma.order.updateMany({ where: { id: orderId, status: from }, data: { status: to } });
  return updated.count === 1 ? null : "Đơn vừa được cập nhật ở máy khác — tải lại để xem trạng thái mới.";
}
