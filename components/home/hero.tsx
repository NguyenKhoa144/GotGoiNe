import type { HeroStat } from "@/data/home";

type HeroProps = {
  stats: HeroStat[];
  flash: string | null;
  onAdd: (key: string) => void;
};

export function Hero({ stats, flash, onAdd }: HeroProps) {
  return (
    <section className="home-hero" id="top">
      <div className="home-hero-left">
        <div className="home-hero-badge">🚀 Giao trong 30-60 phút tại Phú Lợi</div>
        <h1 className="home-hero-title">
          Trái cây <em>tươi ngon</em>,
          <br />
          gọt sẵn - ăn liền!
        </h1>
        <p className="home-hero-desc">
          <strong>Gọt Gòi Nè</strong> - startup nhỏ tại Phú Lợi, Cần Thơ.
          <br />
          Không cần gọt, không cần rửa. Mở hộp là ăn ngay, tươi sạch mỗi ngày.
        </p>
        <div className="home-hero-ctas">
          <a href="#menu" className="home-btn-primary">
            🍉 Xem menu hôm nay
          </a>
          <a href="#why" className="home-btn-ghost">
            Tìm hiểu thêm →
          </a>
        </div>
        <div className="home-hero-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="home-stat-num">{stat.value}</div>
              <div className="home-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-hero-right">
        <div className="home-hero-card">
          <span className="home-hero-card-emoji">🍍</span>
          <div className="home-hero-card-name">Dứa mật gọt sẵn</div>
          <div className="home-hero-card-sub">Dứa mật ngọt · cắt miếng · 300g</div>
          <div className="home-hero-card-price-row">
            <div>
              <div className="home-hero-card-price">35.000₫</div>
              <div className="home-hero-card-unit">/ hộp 300g</div>
            </div>
            <button
              className={`home-hero-add-btn${flash === "hero" ? " home-is-done" : ""}`}
              onClick={() => onAdd("hero")}
              aria-label="Thêm dứa mật gọt sẵn"
            >
              {flash === "hero" ? "✓" : "＋"}
            </button>
          </div>
        </div>
        <div className="home-float-tag home-float-tag-1">
          <strong>🌿 100% tươi sạch</strong>
          <span>Nhập mỗi buổi sáng</span>
        </div>
        <div className="home-float-tag home-float-tag-2">
          <div className="home-live-dot" />
          <span>Đang giao • 14 đơn</span>
        </div>
      </div>
    </section>
  );
}
