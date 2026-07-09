"use client";

import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import type { ProcessStep } from "@/data/home";

type HowSectionProps = {
  steps: ProcessStep[];
};

export function HowSection({ steps }: HowSectionProps) {
  const { lang } = useLanguage();
  const t = homeStrings[lang].how;

  return (
    <section className="home-how-section" id="process">
      <div className="home-container home-how-inner">
        <div className="home-section-eyebrow">{t.eyebrow}</div>
        <h2 className="home-section-title">
          {t.titleLine1}
          <br />
          {t.titleLine2}
        </h2>
        <p className="home-section-sub">{t.subtitle}</p>
        <div className="home-steps-grid">
          {steps.map((step) => (
            <div className="home-step-card" key={step.number}>
              <div className="home-step-num">{step.number}</div>
              <span className="home-step-icon">{step.icon}</span>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
