"use client";

import Counter from "./Counter";
import InteractiveProduct from "./InteractiveProduct";
import { productsForStation } from "@/data/products";
import { COUNTERS } from "@/lib/camera";

/** Counter 02b — bivalves, kept apart from the crustaceans. */
export default function ShellfishCounter() {
  const items = productsForStation("shellfish");
  const c = COUNTERS.shellfish;
  return (
    <Counter
      position={c.position}
      rotationY={c.rotationY}
      length={4.6}
      depth={1.9}
      signTop="Counter 02b"
      signMain="SHELLFISH"
      signBottom="Held live · purged"
      iceEmissive={0.66}
    >
      {items.map((p) => (
        <InteractiveProduct key={p.id} product={p} position={p.position} />
      ))}
    </Counter>
  );
}
