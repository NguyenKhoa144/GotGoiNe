"use client";

import { useState } from "react";
import { trackAddToCart } from "@/lib/analytics";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { homeStrings } from "@/lib/i18n/home-strings";
import { CtaBanner } from "@/components/home/cta-banner";
import { FruitBoxSection } from "@/components/home/fruit-box-section";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { HowSection } from "@/components/home/how-section";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { ProductsSection } from "@/components/home/products-section";
import { WhySection } from "@/components/home/why-section";
import { getHomeContent, type Product } from "@/data/home";
import { fruitBoxItemsFromProducts } from "@/data/fruit-box";

function HomeContent({ viProducts }: { viProducts: Product[] }) {
  const { lang } = useLanguage();
  const content = getHomeContent(lang);
  const products = lang === "vi" ? viProducts : content.products;
  // Phần ghép hộp lấy đúng danh sách đang bán hôm nay, để khách không chọn
  // được loại quán không có.
  const fruitBoxItems = fruitBoxItemsFromProducts(products);

  // Chọn danh mục theo index thay vì theo chuỗi nhãn — vì nhãn danh mục đổi
  // theo ngôn ngữ, dùng index giữ đúng vị trí đang chọn khi người dùng đổi
  // VI/EN (ví dụ đang chọn danh mục thứ 2, đổi ngôn ngữ vẫn giữ danh mục
  // thứ 2, chỉ đổi nhãn hiển thị).
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const activeCategory = content.categories[activeCategoryIndex];
  const visibleProducts = products.filter((product) => product.category === activeCategory);

  const handleAdd = (key: string) => {
    setFlash(key);
    setTimeout(() => setFlash(null), 900);

    const name = key === "hero" ? homeStrings[lang].hero.cardName : products.find((p) => p.id === key)?.name;
    trackAddToCart({ id: key, name });
  };

  return (
    <main id="top">
      <Header
        categories={content.categories}
        activeCategoryIndex={activeCategoryIndex}
        onCategoryChange={setActiveCategoryIndex}
      />
      <Hero stats={content.heroStats} flash={flash} onAdd={handleAdd} />
      <MarqueeStrip items={content.marqueeItems} />
      <WhySection reasons={content.whyReasons} />
      <ProductsSection
        activeCategory={activeCategory}
        products={visibleProducts}
        flash={flash}
        onAdd={handleAdd}
      />
      <FruitBoxSection items={fruitBoxItems} />
      <HowSection steps={content.processSteps} />
      <CtaBanner />
    </main>
  );
}

export function HomeClient({ viProducts }: { viProducts: Product[] }) {
  return (
    <LanguageProvider>
      <HomeContent viProducts={viProducts} />
    </LanguageProvider>
  );
}
