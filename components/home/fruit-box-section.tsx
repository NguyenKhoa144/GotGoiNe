"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import { getFruitBoxContent } from "@/data/fruit-box";

export function FruitBoxSection() {
  const { lang } = useLanguage();
  const t = homeStrings[lang].fruitBox;
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
  const totalParts = content.items.reduce(
    (sum, item) => sum + (qty[item.id] ?? 0),
    0,
  );
  const isFull = totalParts >= size.capacity;
  const progressPct =
    size.capacity > 0 ? Math.min(100, (totalParts / size.capacity) * 100) : 0;

  // Đổi size nhỏ hơn khi đang chọn nhiều phần hơn sức chứa mới — bớt dần từ
  // phần cuối cùng còn số lượng > 0 cho tới khi vừa sức chứa.
  const handleSizeChange = (nextId: string) => {
    const nextSize = content.sizes.find((s) => s.id === nextId);
    if (!nextSize) return;
    setSizeId(nextId);
    setQty((prev) => {
      let parts = Object.values(prev).reduce((sum, n) => sum + n, 0);
      if (parts <= nextSize.capacity) return prev;
      const next = { ...prev };
      const keys = Object.keys(next);
      let i = keys.length - 1;
      while (parts > nextSize.capacity && i >= 0) {
        const key = keys[i];
        if (next[key] > 0) {
          next[key]--;
          parts--;
        } else {
          i--;
        }
      }
      return next;
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    setQty((prev) => {
      const current = prev[itemId] ?? 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (delta > 0 && totalParts >= size.capacity) return prev;
      return { ...prev, [itemId]: next };
    });
  };

  return (
    <section className="home-fruitbox-section" id="tu-chon-hop">
      <div className="home-container">
        <div className="home-section-eyebrow">{t.eyebrow}</div>
        <h2 className="home-section-title">
          {t.titleLine1}
          <br />
          {t.titleLine2}
        </h2>
        <p className="home-section-sub">{t.subtitle}</p>

        <div className="home-fruitbox-panel">
          <div className="home-fruitbox-main">
            <div className="home-fruitbox-sizes">
              {content.sizes.map((s, index) => (
                <button
                  key={s.id}
                  type="button"
                  className={`home-fruitbox-size${s.id === sizeId ? " home-active" : ""}`}
                  onClick={() => handleSizeChange(s.id)}
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
                  <span className="home-fruitbox-size-meta">
                    {t.capacityPrefix} {s.capacity} {t.partsUnit}
                  </span>
                </button>
              ))}
            </div>

            <p className="home-fruitbox-hint">{t.pickInstructions}</p>

            <div className="home-fruitbox-items">
              {content.items.map((item) => {
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
                        disabled={isFull}
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
            <div className="home-fruitbox-progress">
              <div
                className="home-fruitbox-progress-bar"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="home-fruitbox-stats">
              <div className="home-fruitbox-stat home-fruitbox-stat-solo">
                <span className="home-fruitbox-stat-label">
                  {t.partsSelectedLabel}
                </span>
                <span className="home-fruitbox-stat-value">
                  {totalParts}/{size.capacity}
                </span>
              </div>
            </div>

            {isFull ? (
              <p className="home-fruitbox-warning">{t.fullWarning}</p>
            ) : null}

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
