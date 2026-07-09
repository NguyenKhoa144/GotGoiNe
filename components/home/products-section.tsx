import type { Product } from "@/data/home";

type ProductsSectionProps = {
  activeCategory: string;
  products: Product[];
  flash: string | null;
  onAdd: (key: string) => void;
};

export function ProductsSection({
  activeCategory,
  products,
  flash,
  onAdd,
}: ProductsSectionProps) {
  return (
    <section className="home-products-section" id="menu">
      <div className="home-container">
        <div className="home-section-eyebrow">🛒 Menu hôm nay</div>
        <h2 className="home-section-title">{activeCategory}</h2>
        <p className="home-section-sub">
          Gọt và đóng gói ngay mỗi buổi sáng - đảm bảo độ tươi tối đa khi đến tay bạn.
        </p>

        {products.length > 0 ? (
          <div className="home-products-bento">
            {products.map((product) => (
              <div
                className={`home-product-card${product.featured ? " home-featured" : ""}`}
                key={product.id}
              >
                <div>
                  {product.badge ? <div className="home-p-badge">{product.badge}</div> : null}
                  <span className="home-p-emoji">{product.emoji}</span>
                  <div className="home-p-name">{product.name}</div>
                  <div className="home-p-weight">{product.weight}</div>
                  {product.description ? <p className="home-p-desc">{product.description}</p> : null}
                </div>
                <div className="home-p-footer">
                  <span className="home-p-price">{product.price}</span>
                  <button
                    className={`home-p-add${flash === product.id ? " home-is-done" : ""}`}
                    onClick={() => onAdd(product.id)}
                    aria-label={`Thêm ${product.name}`}
                  >
                    {flash === product.id ? "✓" : "＋"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="home-products-empty">
            <strong>Menu đang được cập nhật</strong>
            <p>Danh mục này sẽ có sản phẩm mới sau khi bếp chốt nguyên liệu trong ngày.</p>
          </div>
        )}
      </div>
    </section>
  );
}
