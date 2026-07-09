"use client";

import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import type { HeroStat } from "@/data/home";

type HeroProps = {
  stats: HeroStat[];
  flash: string | null;
  onAdd: (key: string) => void;
};

export function Hero({ stats, flash, onAdd }: HeroProps) {
  const { lang } = useLanguage();
  const t = homeStrings[lang].hero;

  return (
    <section className="home-hero" id="top">
      <div className="home-hero-left">
        <div className="home-hero-badge">{t.badge}</div>
        <h1 className="home-hero-title">
          {t.titleLine1}
          <br />
          {t.titleLine2}
        </h1>
        <p className="home-hero-desc">
          {t.descLine1}
          <br />
          {t.descLine2}
        </p>
        <div className="home-hero-ctas">
          <a href="#menu" className="home-btn-primary">
            {t.ctaPrimary}
          </a>
          <a href="#why" className="home-btn-ghost">
            {t.ctaGhost}
          </a>
        </div>
        <div className="home-hero-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="home-stat-num">{stat.value}</div>
              <div className="home-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-hero-right">
        <div className="home-hero-card">
          <span className="home-hero-card-emoji">🍍</span>
          <div className="home-hero-card-name">{t.cardName}</div>
          <div className="home-hero-card-sub">{t.cardSub}</div>
          <div className="home-hero-card-price-row">
            <div>
              <div className="home-hero-card-price">35.000₫</div>
              <div className="home-hero-card-unit">{t.cardUnit}</div>
            </div>
            <button
              className={`home-hero-add-btn${flash === "hero" ? " home-is-done" : ""}`}
              onClick={() => onAdd("hero")}
              aria-label={t.addAria}
            >
              {flash === "hero" ? "✓" : "＋"}
            </button>
          </div>
        </div>
        <div className="home-float-tag home-float-tag-1">
          <strong>{t.tag1Title}</strong>
          <span>{t.tag1Sub}</span>
        </div>
        <div className="home-float-tag home-float-tag-2">
          <div className="home-live-dot" />
          <span>{t.tag2Text}</span>
        </div>
      </div>
    </section>
  );
}
