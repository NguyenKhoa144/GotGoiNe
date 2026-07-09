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
    <section className="products-section" id="menu">
      <div className="container">
        <div className="section-eyebrow">🛒 Menu hôm nay</div>
        <h2 className="section-title">{activeCategory}</h2>
        <p className="section-sub">
          Gọt và đóng gói ngay mỗi buổi sáng - đảm bảo độ tươi tối đa khi đến tay bạn.
        </p>

        {products.length > 0 ? (
          <div className="products-bento">
            {products.map((product) => (
              <div
                className={`product-card${product.featured ? " featured" : ""}`}
                key={product.id}
              >
                <div>
                  {product.badge ? <div className="p-badge">{product.badge}</div> : null}
                  <span className="p-emoji">{product.emoji}</span>
                  <div className="p-name">{product.name}</div>
                  <div className="p-weight">{product.weight}</div>
                  {product.description ? <p className="p-desc">{product.description}</p> : null}
                </div>
                <div className="p-footer">
                  <span className="p-price">{product.price}</span>
                  <button
                    className={`p-add${flash === product.id ? " is-done" : ""}`}
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
          <div className="products-empty">
            <strong>Menu đang được cập nhật</strong>
            <p>Danh mục này sẽ có sản phẩm mới sau khi bếp chốt nguyên liệu trong ngày.</p>
          </div>
        )}
      </div>
    </section>
  );
}
