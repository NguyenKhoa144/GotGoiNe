"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61577434833804",
    path: "M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.91h-2.4v7.04A10 10 0 0 0 22 12Z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@gotgoine.fruit",
    path: "M16.5 3c.3 1.9 1.5 3.5 3.5 3.9v3c-1.5 0-2.9-.5-4-1.3v6.9c0 3.6-3 6.5-6.6 6.3-3.3-.2-5.9-3-6-6.3-.1-3.6 2.8-6.6 6.4-6.6.4 0 .8 0 1.2.1v3.1c-.4-.1-.8-.2-1.2-.2-1.8 0-3.3 1.5-3.3 3.4 0 1.8 1.4 3.3 3.2 3.4 1.9.1 3.5-1.4 3.5-3.3V3h3.3Z",
  },
];

export function Footer() {
  const { lang } = useLanguage();
  const t = homeStrings[lang].footer;

  return (
    <footer className="home-footer">
      <div className="home-container home-footer-grid">
        <div className="home-footer-brand">
          <a href="#top" className="home-footer-logo">
            <Image
              src="/images/logo-mark.jpg"
              alt="GỌT GÒI NÈ"
              width={40}
              height={40}
              className="home-footer-logo-icon"
            />
            <strong>GỌT GÒI NÈ</strong>
          </a>
          <p className="home-footer-tagline">{t.tagline}</p>
          <p className="home-footer-address">
            <span>{t.addressLabel}:</span> Đường 30/4, phường Phú Lợi, thành phố Cần Thơ
          </p>
          <div className="home-footer-social">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="home-footer-social-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <nav className="home-footer-nav">
          <div className="home-footer-nav-heading">{t.navHeading}</div>
          <a href="#top">{t.navHome}</a>
          <a href="#menu">{t.navMenu}</a>
          <a href="#process">{t.navProcess}</a>
          <a href="#why">{t.navWhy}</a>
          <a href="#order">{t.navOrder}</a>
        </nav>
      </div>

      <div className="home-footer-bottom">
        <span>© {new Date().getFullYear()} {t.rights}</span>
        <span>{t.credit}</span>
      </div>
    </footer>
  );
}
