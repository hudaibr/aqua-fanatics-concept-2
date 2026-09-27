"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import MarketEnvironment from "./Environment";
import FishCounter from "./FishCounter";
import SeafoodCounter from "./SeafoodCounter";
import ShellfishCounter from "./ShellfishCounter";
import PremiumCounter from "./PremiumCounter";
import PreparationStation from "./PreparationStation";
import MarketCamera, { useScrollDriver } from "./MarketCamera";
import { cam, setState } from "@/lib/store";

/** Tells the gate the WebGL scene is resident and rendering. */
function SceneMounted() {
  useEffect(() => setState({ ready: true }), []);
  return null;
}

function RendererTuning() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);
  return null;
}

export default function MarketScene({ active }: { active: boolean }) {
  useScrollDriver(active);

  return (
    <Canvas
      className="market-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 42, near: 0.08, far: 140, position: [0, 1.9, 8.6] }}
      onCreated={({ gl }) => gl.setClearColor("#0E100F", 1)}
    >
      <RendererTuning />
      <SceneMounted />
      <fog attach="fog" args={["#0E100F", 13, 56]} />
      <Suspense fallback={null}>
        <MarketEnvironment />
        <FishCounter />
        <SeafoodCounter />
        <ShellfishCounter />
        <PremiumCounter />
        <PreparationStation />
      </Suspense>
      <MarketCamera />
    </Canvas>
  );
}

/** Jump the dolly to a progress value (used by the loading gate → entrance handoff). */
export function resetCameraProgress(t: number) {
  cam.target = t;
}
