"use client";

import Counter from "./Counter";
import InteractiveProduct from "./InteractiveProduct";
import { productsForStation } from "@/data/products";
import { COUNTERS } from "@/lib/camera";

export default function SeafoodCounter() {
  const items = productsForStation("prawns");
  const c = COUNTERS.prawns;
  return (
    <Counter
      position={c.position}
      rotationY={c.rotationY}
      length={3.9}
      depth={1.9}
      signTop="Counter 02"
      signMain="PRAWNS"
      signBottom="Shell-on · never frozen"
      iceEmissive={0.72}
    >
      {items.map((p) => (
        <InteractiveProduct key={p.id} product={p} position={p.position} />
      ))}
    </Counter>
  );
}
