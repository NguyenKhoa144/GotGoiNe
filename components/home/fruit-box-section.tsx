"use client";

import { Package } from "lucide-react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isOptimizableImage } from "@/lib/image-url";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import { getFruitBoxContent, type FruitBoxItem } from "@/data/fruit-box";
import { BoxOrderPanel, type SelectedFruit } from "./box-order-panel";

type FruitBoxSectionProps = {
  activeCategory: string;
  items: FruitBoxItem[];
  /** Khách đang gõ từ khoá — danh sách rỗng nghĩa là không khớp, không phải hết hàng. */
  isSearching: boolean;
};

export function FruitBoxSection({ activeCategory, items, isSearching }: FruitBoxSectionProps) {
  const { lang } = useLanguage();
  const t = homeStrings[lang].fruitBox;
  const tProducts = homeStrings[lang].products;
  const content = getFruitBoxContent(lang);

  const [sizeId, setSizeId] = useState(content.sizes[0].id);
  // Lưu kèm thông tin trái lúc khách chọn: loại nào vừa biến khỏi thực đơn
  // (hết hàng) thì khung tóm tắt vẫn gọi đúng tên để báo "vừa hết".
  const [picks, setPicks] = useState<Record<string, { item: FruitBoxItem; parts: number }>>({});
  const [showToast, setShowToast] = useState(false);
  const size = content.sizes.find((s) => s.id === sizeId) ?? content.sizes[0];

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const selectedTypes = Object.keys(picks).length;

  const changeQty = (item: FruitBoxItem, delta: number) => {
    setPicks((prev) => {
      const next = (prev[item.id]?.parts ?? 0) + delta;
      if (next < 0) return prev;
      const copy = { ...prev };
      if (next === 0) delete copy[item.id];
      else copy[item.id] = { item, parts: next };
      return copy;
    });
  };

  const presentIds = new Set(items.map((item) => item.id));
  const selected: SelectedFruit[] = Object.values(picks).map(({ item, parts }) => ({
    id: item.id,
    name: item.name,
    emoji: item.emoji,
    parts,
    present: presentIds.has(item.id),
  }));

  return (
    <section className="home-fruitbox-section" id="menu">
      <div className="home-container">
        <div className="home-section-eyebrow">{tProducts.eyebrow}</div>
        <h2 className="home-section-title">{activeCategory}</h2>
        <p className="home-section-sub">{t.subtitle}</p>

        <div className="home-fruitbox-panel">
          <div className="home-fruitbox-main">
            <div className="home-fruitbox-sizes">
              {content.sizes.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  className={`home-fruitbox-size${s.id === sizeId ? " home-active" : ""}`}
                  onClick={() => setSizeId(s.id)}
                  aria-pressed={s.id === sizeId}
                >
                  <span className="home-fruitbox-size-icon" aria-hidden="true">
                    <Package size={20 + index * 5} strokeWidth={1.8} />
                  </span>
                  <span className="home-fruitbox-size-name">{s.label}</span>
                  <span className="home-fruitbox-size-meta">{s.weightLabel}</span>
                </button>
              ))}
            </div>

            {items.length === 0 ? (
              <div className="home-fruitbox-empty">
                <Package size={30} strokeWidth={1.6} aria-hidden="true" />
                <strong>{isSearching ? t.noResultToday : t.emptyToday}</strong>
                <p>{isSearching ? t.noResultHint : t.emptyHint}</p>
              </div>
            ) : (
              <p className="home-fruitbox-hint">{t.pickInstructions}</p>
            )}

            <div className="home-fruitbox-items">
              {items.map((item, index) => {
                const current = picks[item.id]?.parts ?? 0;
                return (
                  <div
                    className={`home-fruitbox-item${current > 0 ? " home-is-selected" : ""}${
                      index === 0 ? " home-is-wide" : ""
                    }`}
                    key={item.id}
                  >
                    {current > 0 ? (
                      <span className="home-fruitbox-item-badge">
                        {current}
                      </span>
                    ) : null}
                    <span
                      className="home-fruitbox-item-photo"
                      style={{ background: item.color }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes={index === 0 ? "(max-width: 700px) 100vw, 380px" : "(max-width: 700px) 50vw, 190px"}
                          className="home-fruitbox-item-img"
                          unoptimized={!isOptimizableImage(item.image)}
                        />
                      ) : (
                        <span className="home-fruitbox-item-emoji" aria-hidden="true">
                          {item.emoji}
                        </span>
                      )}
                    </span>
                    <div className="home-fruitbox-item-body">
                    <span className="home-fruitbox-item-name">{item.name}</span>
                    <div className="home-fruitbox-stepper">
                      <button
                        type="button"
                        className="home-fruitbox-step"
                        onClick={() => changeQty(item, -1)}
                        disabled={current === 0}
                        aria-label={`${t.decreaseAriaPrefix}${item.name}`}
                      >
                        −
                      </button>
                      <span className="home-fruitbox-qty">{current}</span>
                      <button
                        type="button"
                        className="home-fruitbox-step"
                        onClick={() => changeQty(item, 1)}
                        aria-label={`${t.increaseAriaPrefix}${item.name}`}
                      >
                        ＋
                      </button>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="home-fruitbox-summary">
            {lang === "vi" ? (
              <BoxOrderPanel
                size={size}
                selected={selected}
                available={items}
                onRemove={(id) =>
                  setPicks((prev) => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                  })
                }
                onAdd={(id) => {
                  const item = items.find((candidate) => candidate.id === id);
                  if (item) changeQty(item, 1);
                }}
                onReset={() => setPicks({})}
              />
            ) : (
              // Bản tiếng Anh dùng danh sách tĩnh, không nối với tủ lạnh, nên
              // chưa đặt được — giữ thông báo "sắp ra mắt" như trước.
              <>
                <div className="home-fruitbox-stats">
                  <div className="home-fruitbox-stat home-fruitbox-stat-solo">
                    <span className="home-fruitbox-stat-label">{t.selectedTypesLabel}</span>
                    <span className="home-fruitbox-stat-value">
                      {selectedTypes} {t.selectedTypesUnit}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="home-fruitbox-cta"
                  onClick={() => setShowToast(true)}
                >
                  {t.ctaButton}
                </button>

                {showToast ? (
                  <div className="home-fruitbox-toast" role="status">
                    <strong>{t.comingSoonTitle}</strong>
                    <p>{t.comingSoonDesc}</p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
