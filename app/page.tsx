"use client";

import { useState } from "react";
import { CtaBanner } from "@/components/home/cta-banner";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { HowSection } from "@/components/home/how-section";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { ProductsSection } from "@/components/home/products-section";
import { WhySection } from "@/components/home/why-section";
import {
  categories,
  heroStats,
  marqueeItems,
  processSteps,
  products,
  whyReasons,
} from "@/data/home";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("🔥 Hộp cắt sẵn");
  const [flash, setFlash] = useState<string | null>(null);
  const visibleProducts = products.filter((product) => product.category === activeCategory);

  const handleAdd = (key: string) => {
    setFlash(key);
    setTimeout(() => setFlash(null), 900);
  };

  return (
    <main id="top">
      <Header
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <Hero stats={heroStats} flash={flash} onAdd={handleAdd} />
      <MarqueeStrip items={marqueeItems} />
      <WhySection reasons={whyReasons} />
      <ProductsSection
        activeCategory={activeCategory}
        products={visibleProducts}
        flash={flash}
        onAdd={handleAdd}
      />
      <HowSection steps={processSteps} />
      <CtaBanner />
    </main>
  );
}
