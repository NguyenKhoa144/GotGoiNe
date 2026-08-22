"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

  const navRef = useRef<HTMLElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0 });

  // Đo lại vị trí pill đang chọn để khung nền trượt mượt qua lại giữa các
  // nút thay vì tô màu bật/tắt riêng lẻ trên từng nút.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const activePill = pillRefs.current[activeCategoryIndex];
    if (!nav || !activePill) return;

    const measure = () => {
      setIndicator({
        left: activePill.offsetLeft,
        top: activePill.offsetTop,
        width: activePill.offsetWidth,
        height: activePill.offsetHeight,
      });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeCategoryIndex, categories]);

  return (
    <header className="home-site-header">
      <div className="home-nav-top">
        <a href="#top" className="home-nav-logo" aria-label={t.backToTop}>
          <Image
            src="/images/logo-mark.jpg"
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

      <nav className="home-nav-cats" ref={navRef}>
        <span
          className="home-cat-indicator"
          style={{
            left: `${indicator.left}px`,
            top: `${indicator.top}px`,
            width: `${indicator.width}px`,
            height: `${indicator.height}px`,
          }}
          aria-hidden="true"
        />
        {categories.map((cat, index) => (
          <button
            key={cat}
            ref={(el) => {
              pillRefs.current[index] = el;
            }}
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
