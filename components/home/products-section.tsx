"use client";

import { Check, Plus } from "lucide-react";

import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import type { Product } from "@/data/home";
import { isOptimizableImage } from "@/lib/image-url";

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
  const { lang } = useLanguage();
  const t = homeStrings[lang].products;

  return (
    <section className="home-products-section" id="menu">
      <div className="home-container">
        <div className="home-section-eyebrow">{t.eyebrow}</div>
        <h2 className="home-section-title">{activeCategory}</h2>
        <p className="home-section-sub">{t.subtitle}</p>

        {products.length > 0 ? (
          <div className="home-products-bento">
            {products.map((product) => (
              <div
                className={`home-product-card${product.featured ? " home-featured" : ""}`}
                key={product.id}
              >
                {product.badge ? <div className="home-p-badge">{product.badge}</div> : null}
                <span className="home-p-photo">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt=""
                      fill
                      sizes={
                        product.featured
                          ? "(max-width: 700px) 100vw, 520px"
                          : "(max-width: 700px) 50vw, 260px"
                      }
                      unoptimized={!isOptimizableImage(product.imageUrl)}
                    />
                  ) : (
                    <span className="home-p-emoji" aria-hidden="true">
                      {product.emoji}
                    </span>
                  )}
                </span>
                <div className="home-p-body">
                  <div className="home-p-name">{product.name}</div>
                  {product.description ? <p className="home-p-desc">{product.description}</p> : null}
                  <div className="home-p-footer">
                    <button
                      className={`home-p-add${flash === product.id ? " home-is-done" : ""}`}
                      onClick={() => onAdd(product.id)}
                      aria-label={`${t.addAriaPrefix}${product.name}`}
                    >
                      {flash === product.id ? <Check size={18} /> : <Plus size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="home-products-empty">
            <strong>{t.emptyTitle}</strong>
            <p>{t.emptyDesc}</p>
          </div>
        )}
      </div>
    </section>
  );
}
