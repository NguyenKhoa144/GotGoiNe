import Image from "next/image";

type HeaderProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export function Header({ categories, activeCategory, onCategoryChange }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="nav-top">
        <a href="#top" className="nav-logo" aria-label="Về đầu trang">
          <Image
            src="/images/logo-main.jpg"
            alt="GỌT GÒI NÈ"
            width={48}
            height={48}
            className="nav-logo-icon"
            priority
          />
          <div className="nav-logo-text">
            <strong>GỌT GÒI NÈ</strong>
            <span>Trái cây gọt sẵn</span>
          </div>
        </a>

        <div className="nav-search">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          <button className="nav-search-btn" aria-label="Tìm kiếm sản phẩm">
            🔍
          </button>
        </div>

        <div className="nav-actions">
          <a href="#menu" className="nav-link">
            Menu hôm nay
          </a>
          <div className="nav-lang">
            <button className="active">VI</button>
            <span>|</span>
            <button>EN</button>
          </div>
        </div>
      </div>

      <nav className="nav-cats">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-pill${activeCategory === cat ? " active" : ""}`}
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
