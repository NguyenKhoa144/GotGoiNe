"use client";

import { useRef, useState } from "react";
import { lookupFruit, type Fruit } from "@/data/poster";
import styles from "./poster-generator.module.css";

const DEFAULT_FRUIT_INPUT = "mận, xoài, ổi, thanh long, dưa hấu, cam, bưởi";

const POSTER_WIDTH = 340;
const POSTER_HEIGHT = Math.round((POSTER_WIDTH * 1920) / 1080);
const EXPORT_WIDTH = 1080;
const EXPORT_SCALE = EXPORT_WIDTH / POSTER_WIDTH;

const DAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

type PosterData = {
  fruits: Fruit[];
  date: string;
};

function formatDate() {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, "0");
  const m = String(today.getMonth() + 1).padStart(2, "0");
  return `${DAY_NAMES[today.getDay()]}, ${d}/${m}`;
}

function getScales(n: number) {
  const t = Math.min(Math.max((n - 3) / 9, 0), 1);
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * t) * 10) / 10;
  return {
    iconSize: Math.max(20, lerp(28, 20)),
    fontSize: Math.max(7.5, lerp(11, 7.5)),
    descSize: Math.max(6, lerp(8, 6)),
    padding: Math.max(2.5, lerp(5, 2.5)),
    gap: Math.max(2, lerp(4, 2)),
    heroSize: Math.max(22, lerp(30, 22)),
  };
}

function buildPoster(raw: string): PosterData | null {
  const fruits = raw
    .split(/[,،\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(lookupFruit);
  if (fruits.length === 0) return null;
  return { fruits, date: formatDate() };
}

export function PosterGenerator() {
  const [fruitInput, setFruitInput] = useState(DEFAULT_FRUIT_INPUT);
  const [poster, setPoster] = useState<PosterData | null>(() => buildPoster(DEFAULT_FRUIT_INPUT));
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scales = poster ? getScales(poster.fruits.length) : null;
  const heroEmojis = poster ? [...new Set(poster.fruits.map((f) => f.emoji))].slice(0, 6) : [];

  function handleGenerate() {
    const next = buildPoster(fruitInput);
    if (!next) {
      alert("Vui lòng nhập danh sách trái cây!");
      return;
    }
    setPoster(next);
  }

  function handleHeroUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setHeroImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDownload() {
    if (!posterRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = await html2canvas(posterRef.current, {
        scale: EXPORT_SCALE,
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        useCORS: true,
        backgroundColor: "#EAF0E3",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `got-goi-ne-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      alert("Không thể tải xuống. Vui lòng thử lại!");
      console.error(error);
    }
    setIsDownloading(false);
  }

  return (
    <div className={styles.page}>
      <h1>🍈 Gọt Gòi Nè</h1>
      <p className={styles.subtitle}>Nhập danh sách trái cây hôm nay để tạo poster</p>

      <div className={styles.inputArea}>
        <label htmlFor="fruitInput">🍃 Trái cây hôm nay (phân cách bằng dấu phẩy):</label>
        <textarea
          id="fruitInput"
          value={fruitInput}
          onChange={(e) => setFruitInput(e.target.value)}
          placeholder="VD: mận, xoài, ổi, thanh long, dưa hấu..."
        />
        <button type="button" className={styles.genBtn} onClick={handleGenerate}>
          ✨ Tạo Poster
        </button>
      </div>

      {poster && scales ? (
        <div className={styles.posterWrap}>
          <div ref={posterRef} className={styles.poster}>
            <div className={styles.bgCircle1} />
            <div className={styles.bgCircle2} />

            <div className={styles.leftCol}>
              <div className={styles.headerSection}>
                <span className={styles.scriptLabel}>Thực đơn</span>
                <div className={styles.todayTitle}>HÔM NAY</div>
                <div className={styles.datePill}>{poster.date}</div>
                <div className={styles.greenBanner}>🌿 Nhà gọt hôm nay có: 🌿</div>
              </div>

              <div className={styles.menuSection} style={{ gap: `${scales.gap}px` }}>
                {poster.fruits.map((fruit, idx) => (
                  <div
                    key={`${fruit.name}-${idx}`}
                    className={styles.menuItem}
                    style={{ padding: `${scales.padding}px 0` }}
                  >
                    <div
                      className={styles.menuIcon}
                      style={{
                        width: `${scales.iconSize}px`,
                        height: `${scales.iconSize}px`,
                        fontSize: `${scales.iconSize * 0.5}px`,
                      }}
                    >
                      {fruit.emoji}
                    </div>
                    <div className={styles.menuText}>
                      <div className={styles.menuName} style={{ fontSize: `${scales.fontSize}px` }}>
                        {fruit.name.toUpperCase()}
                      </div>
                      <div className={styles.menuDesc} style={{ fontSize: `${scales.descSize}px` }}>
                        {fruit.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.footerSection}>
                <div className={styles.footerBadges}>
                  <div className={styles.badgeItem}>🍃 Trái cây tươi chọn lọc kỹ</div>
                  <div className={styles.badgeItem}>❤️ Tươi ngon mỗi ngày cho cả nhà</div>
                  <div className={styles.badgeItem}>🛵 Ship tận nơi tại Sóc Trăng</div>
                </div>
                <div className={styles.brandFooter}>GOT GOI NE</div>
                <div className={styles.brandSub}>FRESH FRUIT · SÓC TRĂNG</div>
              </div>
            </div>

            <div className={styles.rightCol}>
              <div className={styles.heroOval}>
                {heroImageUrl ? (
                  <div className={styles.heroImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- ảnh do người dùng tải lên qua data URL, next/image không hỗ trợ tốt trường hợp này */}
                    <img src={heroImageUrl} alt="" />
                  </div>
                ) : (
                  <div className={styles.heroInner}>
                    {heroEmojis.map((emoji, idx) => (
                      <div key={idx} className={styles.heroEmoji} style={{ fontSize: `${scales.heroSize}px` }}>
                        {emoji}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button type="button" className={styles.dlBtn} onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? "⏳ Đang xử lý..." : "📥 Tải về (1080×1920)"}
            </button>
            <div className={styles.uploadBtnWrap}>
              <button type="button" className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}>
                🖼️ Thêm ảnh hero
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                className={styles.heroFileInput}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
