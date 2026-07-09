"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import styles from "./auth-scene.module.css";

const FRUIT_IMAGE_POOL = Array.from(
  { length: 20 },
  (_, i) => `/images/login-bg/fruit-${String(i + 1).padStart(2, "0")}.jpg`,
);

// Lưới 2x2 — 4 ô đều nhau, đánh số 0-3 theo thứ tự lấp lưới (trái qua phải,
// trên xuống dưới). Mỗi 5s, đúng 1 ô (theo thứ tự 0,1,2,3,0,1,...) được
// thay ảnh mới — không đổi cả 4 ô cùng lúc.
const CELL_COUNT = 4;
const ROTATE_INTERVAL_MS = 5 * 1000;

function pickReplacement(pool: string[], exclude: string[]) {
  const candidates = pool.filter((src) => !exclude.includes(src));
  return candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
}

export function AuthScene({ children }: { children: ReactNode }) {
  // Thứ tự cố định (không random) cho lần render đầu để khớp giữa server và
  // client — tránh lỗi hydration mismatch. Xáo ngẫu nhiên thật sự chỉ chạy
  // trong useEffect, tức là sau khi đã mount ở client.
  const [images, setImages] = useState<string[]>(() => FRUIT_IMAGE_POOL.slice(0, CELL_COUNT));

  useEffect(() => {
    // 4 ảnh đầu tiên (fruit-01..04) đã được preload sẵn (priority) nên hiện
    // ngay lập tức, không chờ tải — cố tình KHÔNG random hoá ngay lúc mount
    // nữa (trước đây có làm, nhưng khiến 4 ảnh mới toanh chưa preload phải
    // tải lại gần như ngay sau khi trang vừa hiện xong, gây cảm giác giật/
    // lag). Random hoá thật sự chỉ bắt đầu từ lần xoay vòng đầu tiên.
    let cycleIndex = 0;
    const id = setInterval(() => {
      setImages((current) => {
        const next = [...current];
        next[cycleIndex] = pickReplacement(FRUIT_IMAGE_POOL, current);
        return next;
      });
      cycleIndex = (cycleIndex + 1) % CELL_COUNT;
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <main className={styles.scene}>
      <div className={styles.grid} aria-hidden="true">
        {images.map((src, i) => (
          <div key={i} className={styles.cell}>
            <Image key={src} src={src} alt="" fill sizes="50vw" className={styles.image} priority quality={70} />
          </div>
        ))}
      </div>
      <div className={styles.dotGrain} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </main>
  );
}
