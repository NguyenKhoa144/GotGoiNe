import { HomeClient } from "@/components/home/home-content";
import { getTodayMenu } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viProducts = await getTodayMenu();
  return <HomeClient viProducts={viProducts} />;
}
