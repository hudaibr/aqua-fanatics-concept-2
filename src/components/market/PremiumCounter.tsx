"use client";

import { useMemo } from "react";
import * as THREE from "three";
import Counter from "./Counter";
import InteractiveProduct from "./InteractiveProduct";
import { productsForStation } from "@/data/products";
import { COUNTERS } from "@/lib/camera";

/** Counter 03 — the lit end of the hall: raised backboard, brass edge, deep ice well. */
export default function PremiumCounter() {
  const items = productsForStation("premium");
  const c = COUNTERS.premium;
  const brass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#B08D4F",
        roughness: 0.28,
        metalness: 0.95,
        envMapIntensity: 1.8,
      }),
    [],
  );
  const back = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#101413", roughness: 0.7, metalness: 0.3 }),
    [],
  );

  return (
    <group>
      <Counter
        position={c.position}
        rotationY={c.rotationY}
        length={4.9}
        depth={2.2}
        height={1.02}
        signTop="Counter 03"
        signMain="PREMIUM"
        signBottom="Reserved before the ice"
        iceEmissive={0.95}
      >
        {items.map((p) => (
          <InteractiveProduct key={p.id} product={p} position={p.position} />
        ))}
      </Counter>

      {/* narrow premium backboard mounted flat on the right wall behind the counter */}
      <group position={[6.9, 1.02, -22.6]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 0.9, 0]} material={back}>
          <boxGeometry args={[4.0, 1.65, 0.055]} />
        </mesh>
        <mesh position={[0, 1.75, -0.035]} material={brass}>
          <boxGeometry args={[4.06, 0.04, 0.035]} />
        </mesh>
        <mesh position={[0, 1.48, -0.04]}>
          <boxGeometry args={[3.55, 0.025, 0.025]} />
          <meshStandardMaterial color="#FFCE92" emissive="#E8A54B" emissiveIntensity={2.0} />
        </mesh>
        <pointLight position={[0, 1.42, -0.42]} color="#FFCE92" intensity={6} distance={4} decay={2} />
      </group>
    </group>
  );
}
