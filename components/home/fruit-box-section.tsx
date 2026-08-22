"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isOptimizableImage } from "@/lib/image-url";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import { getFruitBoxContent, type FruitBoxItem } from "@/data/fruit-box";

type FruitBoxSectionProps = {
  activeCategory: string;
  items: FruitBoxItem[];
};

export function FruitBoxSection({ activeCategory, items }: FruitBoxSectionProps) {
  const { lang } = useLanguage();
  const t = homeStrings[lang].fruitBox;
  const tProducts = homeStrings[lang].products;
  const content = getFruitBoxContent(lang);

  const [sizeId, setSizeId] = useState(content.sizes[0].id);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const size = content.sizes.find((s) => s.id === sizeId) ?? content.sizes[0];
  const selectedTypes = Object.values(qty).filter((n) => n > 0).length;

  const changeQty = (itemId: string, delta: number) => {
    setQty((prev) => {
      const current = prev[itemId] ?? 0;
      const next = current + delta;
      if (next < 0) return prev;
      return { ...prev, [itemId]: next };
    });
  };

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
                  <span
                    className="home-fruitbox-size-icon"
                    style={{ fontSize: `${18 + index * 8}px` }}
                    aria-hidden="true"
                  >
                    📦
                  </span>
                  <span className="home-fruitbox-size-name">{s.label}</span>
                  <span className="home-fruitbox-size-meta">{s.weightLabel}</span>
                </button>
              ))}
            </div>

            <p className="home-fruitbox-hint">
              {items.length === 0 ? t.emptyToday : t.pickInstructions}
            </p>

            <div className="home-fruitbox-items">
              {items.map((item) => {
                const current = qty[item.id] ?? 0;
                return (
                  <div
                    className={`home-fruitbox-item${current > 0 ? " home-is-selected" : ""}`}
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
                          sizes="72px"
                          className="home-fruitbox-item-img"
                          unoptimized={!isOptimizableImage(item.image)}
                        />
                      ) : (
                        <span aria-hidden="true">{item.emoji}</span>
                      )}
                    </span>
                    <span className="home-fruitbox-item-name">{item.name}</span>
                    <div className="home-fruitbox-stepper">
                      <button
                        type="button"
                        className="home-fruitbox-step"
                        onClick={() => changeQty(item.id, -1)}
                        disabled={current === 0}
                        aria-label={`${t.decreaseAriaPrefix}${item.name}`}
                      >
                        −
                      </button>
                      <span className="home-fruitbox-qty">{current}</span>
                      <button
                        type="button"
                        className="home-fruitbox-step"
                        onClick={() => changeQty(item.id, 1)}
                        aria-label={`${t.increaseAriaPrefix}${item.name}`}
                      >
                        ＋
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="home-fruitbox-summary">
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
          </div>
        </div>
      </div>
    </section>
  );
}
