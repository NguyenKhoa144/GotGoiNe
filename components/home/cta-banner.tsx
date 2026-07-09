"use client";

import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";

export function CtaBanner() {
  const { lang } = useLanguage();
  const t = homeStrings[lang].cta;

  return (
    <div className="home-cta-wrap" id="order">
      <div className="home-cta-banner">
        <div>
          <h2>{t.heading}</h2>
          <p>{t.subtext}</p>
        </div>
        <a href="#menu" className="home-btn-dark">
          {t.button}
        </a>
      </div>
    </div>
  );
}
