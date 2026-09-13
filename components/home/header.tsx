"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Search, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";

type HeaderProps = {
  categories: string[];
  activeCategoryIndex: number;
  onCategoryChange: (index: number) => void;
  query: string;
  onQueryChange: (value: string) => void;
};

export function Header({
  categories,
  activeCategoryIndex,
  onCategoryChange,
  query,
  onQueryChange,
}: HeaderProps) {
  const { lang, setLang } = useLanguage();
  const t = homeStrings[lang].header;

  // Trên điện thoại ô tìm kiếm nằm ẩn sau một nút, để header vẫn gọn một hàng.
  // Trên desktop nó luôn hiện, state này không có tác dụng gì.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Dải danh mục cuộn ngang trên màn hẹp: kéo nút đang chọn vào giữa tầm nhìn,
  // nếu không nút đầu/cuối sẽ nằm ngoài mép và trông như bị cắt mất chữ.
  useEffect(() => {
    const activePill = pillRefs.current[activeCategoryIndex];
    activePill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeCategoryIndex]);

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

        <div className={`home-nav-search${searchOpen ? " home-is-open" : ""}`}>
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAria}
          />
          {query ? (
            <button
              type="button"
              className="home-nav-search-btn"
              aria-label={t.searchClear}
              onClick={() => {
                onQueryChange("");
                searchInputRef.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <span className="home-nav-search-btn" aria-hidden="true">
              <Search size={16} />
            </span>
          )}
        </div>

        <div className="home-nav-actions">
          <button
            type="button"
            className="home-nav-search-toggle"
            aria-label={searchOpen ? t.searchClose : t.searchOpen}
            aria-expanded={searchOpen}
            onClick={() => {
              const next = !searchOpen;
              setSearchOpen(next);
              if (next) requestAnimationFrame(() => searchInputRef.current?.focus());
              else onQueryChange("");
            }}
          >
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>
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
