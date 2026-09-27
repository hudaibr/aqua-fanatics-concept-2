"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/data/products";
import SpeciesMesh from "./SpeciesMesh";
import { cam, setState, useStore } from "@/lib/store";

type Props = {
  product: Product;
  /** station-local placement, resolved by the parent counter group */
  position: [number, number, number];
};

export default function InteractiveProduct({ product, position }: Props) {
  const group = useRef<THREE.Group>(null);
  const lift = useRef(0);
  const spin = useRef(0);
  const selected = useStore((s) => s.selected);
  const [hovered, setHovered] = useState(false);
  const focused = selected === product.id;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const want = focused ? 1 : hovered ? 1 : 0;
    lift.current += (want - lift.current) * Math.min(1, dt * 6);

    const idle = Math.sin(state.clock.elapsedTime * 0.9 + position[0] * 2) * 0.004;
    g.position.y = position[1] + lift.current * 0.1 + idle;
    g.scale.setScalar(1 + lift.current * 0.045);

    if (focused) {
      spin.current += dt * 0.42;
      g.rotation.y = spin.current;
    } else {
      spin.current += (0 - spin.current) * Math.min(1, dt * 3);
      g.rotation.y = spin.current;
    }
  });

  const onOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    setState({ hover: product.id });
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
    setState({ hover: null });
    document.body.style.cursor = "";
  };
  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (group.current) {
      const p = group.current.getWorldPosition(new THREE.Vector3());
      cam.fx = p.x;
      cam.fy = p.y;
      cam.fz = p.z;
    }
    setState({ selected: product.id, basketOpen: false });
  };

  return (
    <group ref={group} position={position}>
      <mesh
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        {/* generous invisible hit volume so small prawns stay easy to click */}
        <boxGeometry
          args={[
            Math.max(0.5, product.shape.length * 1.15),
            Math.max(0.3, product.shape.height * 2.4),
            Math.max(0.42, product.shape.depth * 4),
          ]}
        />
        <meshBasicMaterial visible={false} />
      </mesh>

      <SpeciesMesh product={product} hovered={hovered} focused={focused} />

      {(hovered || focused) && (
        <Html
          position={[0, Math.max(0.3, product.shape.height * 2.2), 0]}
          center
          zIndexRange={[40, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="market-label">
            <span className="market-label__rule" />
            <span className="market-label__name">{product.name}</span>
            <span className="market-label__note">{product.tagline}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
