"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";

type HeaderProps = {
  categories: string[];
  activeCategoryIndex: number;
  onCategoryChange: (index: number) => void;
};

export function Header({ categories, activeCategoryIndex, onCategoryChange }: HeaderProps) {
  const { lang, setLang } = useLanguage();
  const t = homeStrings[lang].header;

  return (
    <header className="home-site-header">
      <div className="home-nav-top">
        <a href="#top" className="home-nav-logo" aria-label={t.backToTop}>
          <Image
            src="/images/logo-main.jpg"
            alt="GỌT GÒI NÈ"
            width={48}
            height={48}
            className="home-nav-logo-icon"
            priority
          />
          <div className="home-nav-logo-text">
            <strong>GỌT GÒI NÈ</strong>
            <span>{t.logoTagline}</span>
          </div>
        </a>

        <div className="home-nav-search">
          <input type="text" placeholder={t.searchPlaceholder} />
          <button className="home-nav-search-btn" aria-label={t.searchAria}>
            🔍
          </button>
        </div>

        <div className="home-nav-actions">
          <a href="#menu" className="home-nav-link">
            {t.menuToday}
          </a>
          <div className="home-nav-lang">
            <button className={lang === "vi" ? "home-active" : ""} onClick={() => setLang("vi")}>
              VI
            </button>
            <span>|</span>
            <button className={lang === "en" ? "home-active" : ""} onClick={() => setLang("en")}>
              EN
            </button>
          </div>
          <Link href="/login?callbackUrl=/admin" className="home-nav-admin" aria-label={t.adminLogin}>
            <Lock size={16} />
          </Link>
        </div>
      </div>

      <nav className="home-nav-cats">
        {categories.map((cat, index) => (
          <button
            key={cat}
            className={`home-cat-pill${activeCategoryIndex === index ? " home-active" : ""}`}
            onClick={() => onCategoryChange(index)}
            aria-pressed={activeCategoryIndex === index}
          >
            {cat}
          </button>
        ))}
      </nav>
    </header>
  );
}
