import Image from "next/image";

type HeaderProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export function Header({ categories, activeCategory, onCategoryChange }: HeaderProps) {
  return (
    <header className="home-site-header">
      <div className="home-nav-top">
        <a href="#top" className="home-nav-logo" aria-label="Về đầu trang">
          <Image
            src="/images/logo-main.jpg"
            alt="GỌT GÒI NÈ"
            width={48}
            height={48}
            className="home-nav-logo-icon"
            priority
          />
          <div className="home-nav-logo-text">
            <strong>GỌT GÒI NÈ</strong>
            <span>Trái cây gọt sẵn</span>
          </div>
        </a>

        <div className="home-nav-search">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          <button className="home-nav-search-btn" aria-label="Tìm kiếm sản phẩm">
            🔍
          </button>
        </div>

        <div className="home-nav-actions">
          <a href="#menu" className="home-nav-link">
            Menu hôm nay
          </a>
          <div className="home-nav-lang">
            <button className="home-active">VI</button>
            <span>|</span>
            <button>EN</button>
          </div>
        </div>
      </div>

      <nav className="home-nav-cats">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`home-cat-pill${activeCategory === cat ? " home-active" : ""}`}
            onClick={() => onCategoryChange(cat)}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </nav>
    </header>
  );
}
