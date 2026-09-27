"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import MarketNavigation from "@/components/market/MarketNavigation";
import LoadingScreen from "@/components/market/LoadingScreen";
import ProductDetail from "@/components/market/ProductDetail";
import Basket from "@/components/market/Basket";
import Hud from "@/components/market/Hud";
import { useMarketNavigation } from "@/hooks/useMarketNavigation";

// The scene is client-only; keeping it out of the SSR pass avoids hydration
// mismatch on the WebGL canvas while the gate covers the first paint.
const MarketScene = dynamic(() => import("@/components/market/MarketScene"), {
  ssr: false,
});

export default function Page() {
  const { phase } = useMarketNavigation();
  const inMarket = phase === "market";

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-hall">
      <MarketScene active={inMarket} />

      <AnimatePresence>
        {inMarket && (
          <>
            <MarketNavigation key="nav" />
            <Hud key="hud" />
          </>
        )}
      </AnimatePresence>

      <ProductDetail />
      <Basket />
      <LoadingScreen />
    </main>
  );
}
