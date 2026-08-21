import { HomeClient } from "@/components/home/home-content";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viProducts = await getActiveProducts();
  return <HomeClient viProducts={viProducts} />;
}
