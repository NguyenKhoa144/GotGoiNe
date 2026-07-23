"use client";

import { useRef, useState } from "react";
import { Leaf } from "lucide-react";
import { lookupFruit, type Fruit } from "@/data/poster";
import styles from "./poster-generator.module.css";

const DEFAULT_HERO_POSITION = { x: 50, y: 50 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

const DEFAULT_FRUIT_INPUT = "mận, xoài, ổi, thanh long, dưa hấu, cam, bưởi";

const POSTER_WIDTH = 340;
const POSTER_HEIGHT = Math.round((POSTER_WIDTH * 1920) / 1080);
const EXPORT_WIDTH = 1080;
const EXPORT_SCALE = EXPORT_WIDTH / POSTER_WIDTH;
// .rightCol is a straight 50/50 split of the card (see poster-generator.module.css) —
// used to compute how far the hero photo must scale to cover it.
const HERO_WIDTH = POSTER_WIDTH / 2;
const HERO_HEIGHT = POSTER_HEIGHT;

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
    iconSize: Math.max(28, lerp(40, 28)),
    fontSize: Math.max(7.5, lerp(11, 7.5)),
    descSize: Math.max(6, lerp(8, 6)),
    padding: Math.max(2.5, lerp(5, 2.5)),
    gap: Math.max(2, lerp(4, 2)),
    heroSize: Math.max(26, lerp(36, 26)),
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
  const [heroImageSize, setHeroImageSize] = useState<{ width: number; height: number } | null>(null);
  const [heroPosition, setHeroPosition] = useState(DEFAULT_HERO_POSITION);
  const [heroZoom, setHeroZoom] = useState(MIN_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);

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
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setHeroImageUrl(url);
      setHeroPosition(DEFAULT_HERO_POSITION);
      setHeroZoom(MIN_ZOOM);
      setHeroImageSize(null);
      const img = new Image();
      img.onload = () => setHeroImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  // Scale needed so the photo covers the (fixed-size) hero column, times the
  // user's zoom — larger than 1 gives the photo room to pan on both axes
  // instead of just whichever axis "cover" alone leaves slack on.
  const heroCoverScale = heroImageSize
    ? Math.max(HERO_WIDTH / heroImageSize.width, HERO_HEIGHT / heroImageSize.height)
    : null;
  const heroBackgroundSize =
    heroCoverScale && heroImageSize
      ? `${heroImageSize.width * heroCoverScale * heroZoom}px ${heroImageSize.height * heroCoverScale * heroZoom}px`
      : "cover";

  function handleHeroPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const el = heroImgRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startPosition = heroPosition;
    setIsDragging(true);

    function handlePointerMove(moveEvent: PointerEvent) {
      const dxPercent = ((moveEvent.clientX - startX) / width) * 100;
      const dyPercent = ((moveEvent.clientY - startY) / height) * 100;
      // Dragging right/down should reveal more of the image's left/top —
      // i.e. move the focal point the opposite way from the pointer.
      setHeroPosition({
        x: clampPercent(startPosition.x - dxPercent),
        y: clampPercent(startPosition.y - dyPercent),
      });
    }

    function handlePointerUp() {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
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
                <div className={styles.greenBanner}>
                  <Leaf size={9} strokeWidth={2.5} />
                  NHÀ GỌT CÓ:
                  <Leaf size={9} strokeWidth={2.5} />
                </div>
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
                  <div
                    ref={heroImgRef}
                    className={`${styles.heroImgWrap}${isDragging ? ` ${styles.isDragging}` : ""}`}
                    style={{
                      backgroundImage: `url(${heroImageUrl})`,
                      backgroundPosition: `${heroPosition.x}% ${heroPosition.y}%`,
                      backgroundSize: heroBackgroundSize,
                    }}
                    onPointerDown={handleHeroPointerDown}
                    aria-label={`Kéo để chỉnh vị trí ảnh — hiện tại ${Math.round(heroPosition.x)}%, ${Math.round(heroPosition.y)}%`}
                    tabIndex={0}
                  />
                ) : (
                  <div className={styles.heroInner}>
                    {heroEmojis.map((emoji, idx) => (
                      <div key={idx} className={styles.heroEmoji} style={{ fontSize: `${scales.heroSize}px` }}>
                        {emoji}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.heroFade} aria-hidden="true" />
              </div>
            </div>
          </div>

          {heroImageUrl ? (
            <div className={styles.positionControls}>
              <div className={styles.zoomRow}>
                <label htmlFor="heroZoom" className={styles.zoomLabel}>
                  🔍 Thu phóng
                </label>
                <input
                  id="heroZoom"
                  type="range"
                  className={styles.zoomSlider}
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.05}
                  value={heroZoom}
                  onChange={(e) => setHeroZoom(Number(e.target.value))}
                />
                <span className={styles.zoomValue}>{Math.round((heroZoom / MIN_ZOOM) * 100)}%</span>
              </div>
              <div className={styles.positionSide}>
                <p className={styles.positionHint}>Kéo trực tiếp trên ảnh để chỉnh vị trí hiển thị.</p>
                <button
                  type="button"
                  className={styles.resetPositionBtn}
                  onClick={() => {
                    setHeroPosition(DEFAULT_HERO_POSITION);
                    setHeroZoom(MIN_ZOOM);
                  }}
                >
                  Đặt lại vị trí
                </button>
              </div>
            </div>
          ) : null}

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
