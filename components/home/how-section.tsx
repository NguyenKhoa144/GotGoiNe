"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import type { ProcessStep } from "@/data/home";

type HowSectionProps = {
  steps: ProcessStep[];
};

const BREAK_PHOTOS = [
  "home-process-break-1",
  "home-process-break-2",
  "home-process-break-3",
];

export function HowSection({ steps }: HowSectionProps) {
  const { lang } = useLanguage();
  const t = homeStrings[lang].how;
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepEls = Array.from(root.querySelectorAll<HTMLElement>("[data-step-index]"));

    if (reduceMotion) {
      setVisibleSteps(new Set(stepEls.map((_, i) => i)));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step-index"));
            setVisibleSteps((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.2 },
    );

    stepEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const bar = document.getElementById("home-process-progress-bar");
    if (!bar) return;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      if (bar) bar.style.width = `${pct}%`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-parallax]"),
    )
      .map((el) => ({
        el,
        img: el.querySelector<HTMLElement>(".home-process-break-img"),
      }))
      .filter((item): item is { el: HTMLElement; img: HTMLElement } => item.img !== null);

    let rafId = 0;

    function update() {
      rafId = 0;
      const vh = window.innerHeight;
      for (const { el, img } of items) {
        const rect = el.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(0, (vh - rect.top) / (vh + rect.height)),
        );
        const travel = img.getBoundingClientRect().height - rect.height;
        const offset = (progress - 0.5) * travel;
        img.style.transform = `translateY(${offset}px)`;
      }
    }

    function onScroll() {
      if (!rafId) rafId = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <section className="home-how-section" id="process">
        <div className="home-container">
          <div className="home-section-eyebrow">{t.eyebrow}</div>
          <h2 className="home-section-title">
            {t.titleLine1}
            <br />
            {t.titleLine2}
          </h2>
          <p className="home-section-sub">{t.subtitle}</p>
        </div>
      </section>

      <div className="home-process-progress-track">
        <div className="home-process-progress-bar" id="home-process-progress-bar" />
      </div>

      {steps.map((step, index) => (
        <div key={step.number}>
          <div
            className={`home-process-step${visibleSteps.has(index) ? " home-is-visible" : ""}`}
            data-step-index={index}
          >
            <span className="home-process-step-badge">{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>

          {index < BREAK_PHOTOS.length ? (
            <div className="home-process-break" data-parallax>
              <div className={`home-process-break-img ${BREAK_PHOTOS[index]}`} />
              <div className="home-process-break-scrim" />
              <div className="home-process-break-caption">
                <span className="home-process-break-eyebrow">
                  {t.stepPrefix} {step.number}
                </span>
                <h3>{step.title}</h3>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
