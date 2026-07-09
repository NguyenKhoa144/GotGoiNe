"use client";

import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import type { WhyReason } from "@/data/home";

type WhySectionProps = {
  reasons: WhyReason[];
};

export function WhySection({ reasons }: WhySectionProps) {
  const { lang } = useLanguage();
  const t = homeStrings[lang].why;

  return (
    <section className="home-why-section" id="why">
      <div className="home-container">
        <div className="home-section-eyebrow">{t.eyebrow}</div>
        <h2 className="home-section-title">
          {t.titleLine1}
          <br />
          {t.titleLine2}
        </h2>
        <p className="home-section-sub">{t.subtitle}</p>
        <div className="home-why-grid">
          {reasons.map((reason) => (
            <div className="home-why-card" key={reason.title}>
              <div className="home-why-icon">{reason.icon}</div>
              <h4>{reason.title}</h4>
              <p>{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
