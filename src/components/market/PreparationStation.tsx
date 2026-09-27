"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import Counter from "./Counter";
import { COUNTERS } from "@/lib/camera";

function makeBlade() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.34, 0.012);
  shape.quadraticCurveTo(0.44, 0.02, 0.47, 0.045);
  shape.quadraticCurveTo(0.4, 0.075, 0.3, 0.082);
  shape.lineTo(0.0, 0.088);
  shape.quadraticCurveTo(-0.02, 0.045, 0, 0);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
    curveSegments: 12,
  });
  g.translate(0, 0, -0.006);
  return g;
}

/** Counter 04 — the bench. Clean, stainless, non-graphic: board, blade, ice, wrap. */
export default function PreparationStation() {
  const blade = useMemo(() => makeBlade(), []);
  useEffect(() => () => blade.dispose(), [blade]);

  const steel = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#B4BBBD",
        roughness: 0.2,
        metalness: 0.94,
        envMapIntensity: 1.7,
      }),
    [],
  );
  const board = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#E3DCCB", roughness: 0.68, metalness: 0.02 }),
    [],
  );
  const kraft = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#B79A72", roughness: 0.92, metalness: 0 }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#16191A", roughness: 0.5, metalness: 0.6 }),
    [],
  );
  const iceMat = useMemo(() => {
    const t = new THREE.TextureLoader().load("textures/ice.jpg");
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.4, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({
      map: t,
      color: "#E2F0F1",
      roughness: 0.7,
      emissive: new THREE.Color("#9FD8E2"),
      emissiveIntensity: 0.3,
    });
  }, []);
  useEffect(
    () => () => {
      steel.dispose();
      board.dispose();
      kraft.dispose();
      dark.dispose();
      iceMat.map?.dispose();
      iceMat.dispose();
    },
    [steel, board, kraft, dark, iceMat],
  );

  return (
    <Counter
      position={COUNTERS.preparation.position}
      rotationY={COUNTERS.preparation.rotationY}
      length={4.6}
      depth={2.0}
      height={1.0}
      signTop="The bench"
      signMain="PREPARATION"
      signBottom="Cleaned your way"
      iceEmissive={0.5}
    >
      {/* recessed wash sink */}
      <group position={[-1.5, 0.02, -0.42]}>
        <mesh position={[0, -0.06, 0]} material={steel}>
          <boxGeometry args={[0.78, 0.16, 0.6]} />
        </mesh>
        <mesh position={[0, -0.13, 0]} material={dark}>
          <boxGeometry args={[0.7, 0.04, 0.52]} />
        </mesh>
        <mesh position={[0, 0.16, -0.24]} material={steel}>
          <cylinderGeometry args={[0.018, 0.018, 0.34, 10]} />
        </mesh>
        <mesh position={[0, 0.32, -0.16]} rotation-x={Math.PI / 2} material={steel}>
          <cylinderGeometry args={[0.016, 0.016, 0.2, 10]} />
        </mesh>
      </group>

      {/* cutting board with the blade resting on it */}
      <group position={[0.1, 0.04, 0.16]} rotation-y={-0.16}>
        <mesh material={board}>
          <boxGeometry args={[1.16, 0.055, 0.62]} />
        </mesh>
        <mesh position={[0.06, 0.035, 0]} material={board}>
          <boxGeometry args={[1.04, 0.02, 0.5]} />
        </mesh>
        <group position={[-0.34, 0.06, -0.1]} rotation-y={0.22}>
          <mesh geometry={blade} material={steel} />
          <mesh position={[-0.14, 0.045, 0]} rotation-z={0} material={dark}>
            <boxGeometry args={[0.2, 0.06, 0.036]} />
          </mesh>
        </group>
        {/* trimmed portion — clean, plated, never graphic */}
        <mesh position={[0.36, 0.05, 0.06]} rotation-y={0.5} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#D9DED9" roughness={0.42} metalness={0.05} />
        </mesh>
      </group>

      {/* ice tub */}
      <group position={[1.62, 0.0, 0.24]}>
        <mesh position={[0, -0.07, 0]} material={steel}>
          <boxGeometry args={[0.72, 0.18, 0.62]} />
        </mesh>
        <mesh position={[0, 0.0, 0]} material={iceMat}>
          <boxGeometry args={[0.66, 0.1, 0.56]} />
        </mesh>
      </group>

      {/* kraft packaging, twine, wax sheet */}
      <group position={[1.35, 0.0, -0.5]}>
        <mesh position={[0, 0.1, 0]} rotation-y={0.2} material={kraft}>
          <boxGeometry args={[0.46, 0.2, 0.34]} />
        </mesh>
        <mesh position={[0.5, 0.08, 0.12]} rotation-y={-0.35} material={kraft}>
          <boxGeometry args={[0.36, 0.16, 0.28]} />
        </mesh>
        <mesh position={[-0.44, 0.02, 0.1]} rotation-x={-Math.PI / 2} rotation-z={0.3}>
          <planeGeometry args={[0.5, 0.36]} />
          <meshStandardMaterial color="#F0EADC" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* knives on a magnetic strip at the back */}
      <group position={[-0.6, 0.0, -0.78]}>
        <mesh material={dark}>
          <boxGeometry args={[1.3, 0.1, 0.03]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.42 + i * 0.42, 0.14, 0.03]} rotation-z={Math.PI / 2 - 0.12} material={steel}>
            <boxGeometry args={[0.24, 0.02, 0.012]} />
          </mesh>
        ))}
      </group>
    </Counter>
  );
}
