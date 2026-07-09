"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import styles from "./login-scene.module.css";

const FRUIT_IMAGE_POOL = Array.from(
  { length: 20 },
  (_, i) => `/images/login-bg/fruit-${String(i + 1).padStart(2, "0")}.jpg`,
);

// Lưới 2x2 — 4 ô đều nhau, đánh số 0-3 theo thứ tự lấp lưới (trái qua phải,
// trên xuống dưới). Mỗi 15s, đúng 1 ô (theo thứ tự 0,1,2,3,0,1,...) được
// thay ảnh mới — không đổi cả 4 ô cùng lúc.
const CELL_COUNT = 4;
const ROTATE_INTERVAL_MS = 15 * 1000;

function pickRandomImages(pool: string[], count: number) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickReplacement(pool: string[], exclude: string[]) {
  const candidates = pool.filter((src) => !exclude.includes(src));
  return candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
}

export function LoginScene({ children }: { children: ReactNode }) {
  // Thứ tự cố định (không random) cho lần render đầu để khớp giữa server và
  // client — tránh lỗi hydration mismatch. Xáo ngẫu nhiên thật sự chỉ chạy
  // trong useEffect, tức là sau khi đã mount ở client.
  const [images, setImages] = useState<string[]>(() => FRUIT_IMAGE_POOL.slice(0, CELL_COUNT));

  useEffect(() => {
    const replaceCell = (index: number) => {
      setImages((current) => {
        const next = [...current];
        next[index] = pickReplacement(FRUIT_IMAGE_POOL, current);
        return next;
      });
    };

    // Random hoá ban đầu (né hydration mismatch) nhưng rải từng ô ra cách
    // nhau 350ms thay vì đổi cả 4 ô trong cùng 1 lần setState — nếu không,
    // ngay lúc vừa vào trang sẽ thấy cả 4 ảnh "nhảy" cùng lúc, không nhất
    // quán với cách xoay vòng từng ô một sau đó.
    const staggerTimers = Array.from({ length: CELL_COUNT }, (_, i) => setTimeout(() => replaceCell(i), i * 350));

    let cycleIndex = 0;
    const id = setInterval(() => {
      replaceCell(cycleIndex);
      cycleIndex = (cycleIndex + 1) % CELL_COUNT;
    }, ROTATE_INTERVAL_MS);

    return () => {
      staggerTimers.forEach(clearTimeout);
      clearInterval(id);
    };
  }, []);

  return (
    <main className={styles.scene}>
      <div className={styles.grid} aria-hidden="true">
        {images.map((src, i) => (
          <div key={i} className={styles.cell}>
            <Image key={src} src={src} alt="" fill sizes="50vw" className={styles.image} priority={i < 2} />
          </div>
        ))}
      </div>
      <div className={styles.dotGrain} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </main>
  );
}
