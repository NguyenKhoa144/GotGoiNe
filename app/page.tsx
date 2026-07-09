"use client";

import { useState } from "react";
import { trackAddToCart } from "@/lib/analytics";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import { CtaBanner } from "@/components/home/cta-banner";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { HowSection } from "@/components/home/how-section";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { ProductsSection } from "@/components/home/products-section";
import { WhySection } from "@/components/home/why-section";
import { getHomeContent } from "@/data/home";

function HomeContent() {
  const { lang } = useLanguage();
  const content = getHomeContent(lang);

  // Chọn danh mục theo index thay vì theo chuỗi nhãn — vì nhãn danh mục đổi
  // theo ngôn ngữ, dùng index giữ đúng vị trí đang chọn khi người dùng đổi
  // VI/EN (ví dụ đang chọn danh mục thứ 2, đổi ngôn ngữ vẫn giữ danh mục
  // thứ 2, chỉ đổi nhãn hiển thị).
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const activeCategory = content.categories[activeCategoryIndex];
  const visibleProducts = content.products.filter((product) => product.category === activeCategory);

  const handleAdd = (key: string) => {
    setFlash(key);
    setTimeout(() => setFlash(null), 900);

    const product = content.products.find((p) => p.id === key);
    trackAddToCart({
      id: key,
      name: key === "hero" ? content.products.find((p) => p.id === "p4")?.name : product?.name,
    });
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
      <HowSection steps={content.processSteps} />
      <CtaBanner />
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
