"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrderAction } from "@/app/order-actions";
import {
  splitGrams,
  validateOrderInput,
  type PlaceOrderInput,
  type UnavailableItem,
} from "@/lib/order-rules";
import type { FruitBoxItem, FruitBoxSize } from "@/data/fruit-box";

// Phần đặt hàng chỉ có ở bản tiếng Việt — bản tiếng Anh dùng danh sách tĩnh
// (EN_PRODUCTS) không nối với tủ lạnh, nên chữ ở đây viết thẳng tiếng Việt.

export type SelectedFruit = {
  id: string;
  name: string;
  emoji: string;
  parts: number;
  /** Còn nằm trong thực đơn khách đang thấy không. `false` = vừa biến mất. */
  present: boolean;
};

type BoxOrderPanelProps = {
  size: FruitBoxSize;
  selected: SelectedFruit[];
  /** Những loại đang bày bán, để gợi ý thay thế khi một loại vừa hết. */
  available: FruitBoxItem[];
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
  onReset: () => void;
};

/** Hỏi lại tủ lạnh mỗi 15 giây khi khách đang ghép dở một hộp. */
const REFRESH_MS = 15_000;

export function BoxOrderPanel({ size, selected, available, onRemove, onAdd, onReset }: BoxOrderPanelProps) {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "form">("pick");
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Loại bị máy chủ từ chối ở lần đặt vừa rồi, theo id. */
  const [shortages, setShortages] = useState<Record<string, UnavailableItem>>({});
  const [doneCode, setDoneCode] = useState<string | null>(null);
  const [donePhone, setDonePhone] = useState("");

  // Một mã cho mỗi "đơn" — gửi lại đúng nội dung cũ (mạng chập chờn, bấm hai
  // lần) thì dùng lại mã cũ để máy chủ nhận ra và không tạo đơn thứ hai.
  const keyRef = useRef<{ key: string; signature: string } | null>(null);

  const hasSelection = selected.length > 0;

  // Lớp "đỡ thất vọng": khi khách đang ghép dở, hỏi lại thực đơn định kỳ và
  // mỗi lần quay lại tab, để loại vừa hết tự xám đi trước khi khách bấm đặt.
  // Lớp bảo đảm thật sự vẫn là kiểm tra lúc đặt, ở máy chủ.
  useEffect(() => {
    if (!hasSelection || doneCode) return;
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [hasSelection, doneCode, router]);

  const grams = splitGrams(
    size.grams,
    selected.map((fruit) => ({ productId: fruit.id, parts: fruit.parts }))
  );

  // Suy ra từ dữ liệu, không lưu thêm state: khách bớt phần xuống dưới số
  // còn lại thì cảnh báo tự biến mất. Máy chủ vẫn kiểm lại lúc đặt.
  const problemOf = (fruit: SelectedFruit): string | null => {
    if (!fruit.present) return "Vừa hết";
    const shortage = shortages[fruit.id];
    if (!shortage || (grams.get(fruit.id) ?? 0) <= shortage.availableGrams) return null;
    return shortage.availableGrams === 0 ? "Vừa hết" : `Chỉ còn ${shortage.availableGrams}g — bớt phần`;
  };
  const problems = selected.filter((fruit) => problemOf(fruit));
  const goneNames = problems.map((fruit) => fruit.name);

  const selectedIds = new Set(selected.map((fruit) => fruit.id));
  const suggestions = available
    .filter((item) => !selectedIds.has(item.id) && !shortages[item.id])
    .slice(0, 3);

  const remove = (id: string) => {
    setShortages((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    onRemove(id);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const base = {
      boxSizeId: size.id,
      items: selected.map((fruit) => ({ productId: fruit.id, parts: fruit.parts })),
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      note: form.note,
    };
    const signature = JSON.stringify(base);
    if (!keyRef.current || keyRef.current.signature !== signature) {
      keyRef.current = { key: crypto.randomUUID(), signature };
    }
    const input: PlaceOrderInput = { ...base, idempotencyKey: keyRef.current.key };

    const invalid = validateOrderInput(input);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrderAction(input);
      if (result.ok) {
        setDoneCode(result.code);
        setDonePhone(form.phone);
        setShortages({});
        setStep("pick");
        keyRef.current = null;
        onReset();
        router.refresh();
      } else if (result.reason === "unavailable") {
        setShortages(Object.fromEntries(result.items.map((item) => [item.productId, item])));
        // Lấy lại thực đơn mới nhất để thẻ trái vừa hết biến khỏi danh sách
        // và gợi ý thay thế đúng với tủ lạnh lúc này.
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Mạng đang chập chờn. Bạn bấm “Đặt” lại giúp nhé — đơn sẽ không bị tạo hai lần.");
    } finally {
      setSubmitting(false);
    }
  };

  if (doneCode) {
    return (
      <div className="home-order-done" role="status">
        <div className="home-order-done-icon" aria-hidden="true">✓</div>
        <strong>Đã nhận đơn {doneCode}</strong>
        <p>
          Quán đã giữ phần trái cây cho bạn. Quán sẽ gọi số {donePhone} trong ít phút để xác nhận
          và báo giá.
        </p>
        <button type="button" className="home-order-link" onClick={() => setDoneCode(null)}>
          Ghép một hộp khác
        </button>
      </div>
    );
  }

  return (
    <div className="home-order-panel">
      <div className="home-fruitbox-stat home-fruitbox-stat-solo">
        <span className="home-fruitbox-stat-label">
          {size.label} · {size.grams}g
        </span>
        <span className="home-fruitbox-stat-value">
          {selected.length} loại quả
        </span>
      </div>

      {problems.length > 0 ? (
        <div className="home-order-alert" role="alert">
          <strong>😔 {goneNames.join(", ")} không còn đủ — vừa có khách đặt trước bạn vài giây.</strong>
          <p>Hộp của bạn chưa được đặt. Các loại khác vẫn giữ nguyên — bỏ loại đã hết hoặc đổi loại khác rồi đặt lại.</p>
        </div>
      ) : null}

      {hasSelection ? (
        <ul className="home-order-lines">
          {selected.map((fruit) => {
            const problem = problemOf(fruit);
            return (
              <li key={fruit.id} className={problem ? "home-order-line home-is-gone" : "home-order-line"}>
                <span className="home-order-line-name">
                  {fruit.emoji} {fruit.name}
                </span>
                {problem ? (
                  <>
                    <span className="home-order-line-problem">{problem}</span>
                    <button type="button" className="home-order-link" onClick={() => remove(fruit.id)}>
                      Bỏ ra
                    </button>
                  </>
                ) : (
                  <span className="home-order-line-grams">{grams.get(fruit.id)}g</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {problems.length > 0 && suggestions.length > 0 ? (
        <div className="home-order-suggest">
          <span>Đổi bằng:</span>
          {suggestions.map((item) => (
            <button key={item.id} type="button" className="home-order-chip" onClick={() => onAdd(item.id)}>
              {item.emoji} {item.name}
            </button>
          ))}
        </div>
      ) : null}

      {step === "pick" ? (
        <button
          type="button"
          className="home-fruitbox-cta"
          disabled={!hasSelection || problems.length > 0}
          onClick={() => setStep("form")}
        >
          {hasSelection ? "Đặt hộp này" : "Chọn ít nhất 1 loại quả"}
        </button>
      ) : (
        <form className="home-order-form" onSubmit={submit} noValidate>
          <label htmlFor="order-name">Tên người nhận</label>
          <input
            id="order-name"
            autoComplete="name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
          <label htmlFor="order-phone">Số điện thoại</label>
          <input
            id="order-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label htmlFor="order-address">Địa chỉ giao</label>
          <input
            id="order-address"
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <label htmlFor="order-note">Ghi chú (không bắt buộc)</label>
          <input
            id="order-note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />

          {error ? (
            <p className="home-order-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="home-fruitbox-cta"
            disabled={submitting || !hasSelection || problems.length > 0}
          >
            {submitting ? "Đang giữ hàng cho bạn..." : "Xác nhận đặt hộp"}
          </button>
          <p className="home-order-fineprint">
            Trái cây được giữ cho bạn ngay khi bấm đặt. Quán gọi lại để xác nhận và báo giá theo cỡ hộp.
          </p>
          <button type="button" className="home-order-link" onClick={() => setStep("pick")}>
            ← Chọn lại trái cây
          </button>
        </form>
      )}
    </div>
  );
}
