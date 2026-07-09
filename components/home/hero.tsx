import type { HeroStat } from "@/data/home";

type HeroProps = {
  stats: HeroStat[];
  flash: string | null;
  onAdd: (key: string) => void;
};

export function Hero({ stats, flash, onAdd }: HeroProps) {
  return (
    <section className="hero" id="top">
      <div className="hero-left">
        <div className="hero-badge">🚀 Giao trong 30-60 phút tại Phú Lợi</div>
        <h1 className="hero-title">
          Trái cây <em>tươi ngon</em>,
          <br />
          gọt sẵn - ăn liền!
        </h1>
        <p className="hero-desc">
          <strong>Gọt Gòi Nè</strong> - startup nhỏ tại Phú Lợi, Cần Thơ.
          <br />
          Không cần gọt, không cần rửa. Mở hộp là ăn ngay, tươi sạch mỗi ngày.
        </p>
        <div className="hero-ctas">
          <a href="#menu" className="btn-primary">
            🍉 Xem menu hôm nay
          </a>
          <a href="#why" className="btn-ghost">
            Tìm hiểu thêm →
          </a>
        </div>
        <div className="hero-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="stat-num">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-card">
          <span className="hero-card-emoji">🍍</span>
          <div className="hero-card-name">Dứa mật gọt sẵn</div>
          <div className="hero-card-sub">Dứa mật ngọt · cắt miếng · 300g</div>
          <div className="hero-card-price-row">
            <div>
              <div className="hero-card-price">35.000₫</div>
              <div className="hero-card-unit">/ hộp 300g</div>
            </div>
            <button
              className={`hero-add-btn${flash === "hero" ? " is-done" : ""}`}
              onClick={() => onAdd("hero")}
              aria-label="Thêm dứa mật gọt sẵn"
            >
              {flash === "hero" ? "✓" : "＋"}
            </button>
          </div>
        </div>
        <div className="float-tag float-tag-1">
          <strong>🌿 100% tươi sạch</strong>
          <span>Nhập mỗi buổi sáng</span>
        </div>
        <div className="float-tag float-tag-2">
          <div className="live-dot" />
          <span>Đang giao • 14 đơn</span>
        </div>
      </div>
    </section>
  );
}
