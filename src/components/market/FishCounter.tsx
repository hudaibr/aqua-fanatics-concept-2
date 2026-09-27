"use client";

import Counter from "./Counter";
import InteractiveProduct from "./InteractiveProduct";
import { productsForStation } from "@/data/products";
import { COUNTERS } from "@/lib/camera";

export default function FishCounter() {
  const items = productsForStation("fish");
  const c = COUNTERS.fish;
  return (
    <Counter
      position={c.position}
      rotationY={c.rotationY}
      length={4.6}
      depth={1.9}
      signTop="Counter 01"
      signMain="FRESH FISH"
      signBottom="Landed this morning"
      iceEmissive={0.62}
    >
      {items.map((p) => (
        <InteractiveProduct key={p.id} product={p} position={p.position} />
      ))}
    </Counter>
  );
}
