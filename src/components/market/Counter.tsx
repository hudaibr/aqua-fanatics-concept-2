"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeShadowPool } from "@/lib/textures";

/** Canvas-drawn chalk slate so signage lives in world space (no font fetch, no DOM). */
function makeSlate(top: string, main: string, bottom: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#171A19";
  ctx.fillRect(0, 0, c.width, c.height);
  // subtle slate grain
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 1);
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(245,242,234,0.5)";
  ctx.font = "500 34px ui-sans-serif, system-ui, sans-serif";
  const track = (t: string) => t.split("").join("\u2009");
  ctx.fillText(track(top.toUpperCase()), c.width / 2, 78);

  ctx.fillStyle = "#F5F2EA";
  ctx.font = "700 132px 'Bodoni Moda', 'Didot', Georgia, serif";
  ctx.fillText(main, c.width / 2, 226);

  ctx.strokeStyle = "rgba(245,242,234,0.32)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(320, 268);
  ctx.lineTo(704, 268);
  ctx.stroke();

  ctx.fillStyle = "rgba(232,165,75,0.92)";
  ctx.font = "600 30px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(track(bottom.toUpperCase()), c.width / 2, 326);

  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeSlats() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#123B45";
  ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x, 0, 3, 256);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x + 3, 0, 2, 256);
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.045})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

type Props = {
  position: [number, number, number];
  rotationY: number;
  /** length along the hall */
  length: number;
  /** depth front-to-back */
  depth: number;
  height?: number;
  signTop: string;
  signMain: string;
  signBottom: string;
  iceEmissive?: number;
  children?: React.ReactNode;
};

export default function Counter({
  position,
  rotationY,
  length,
  depth,
  height = 0.98,
  signTop,
  signMain,
  signBottom,
  iceEmissive = 0.5,
  children,
}: Props) {
  const iceMap = useMemo(() => {
    const t = new THREE.TextureLoader().load("textures/ice.jpg");
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(Math.max(1, length / 1.6), Math.max(1, depth / 1.6));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [length, depth]);

  const slats = useMemo(() => {
    const t = makeSlats();
    t.repeat.set(length / 1.2, height / 1.2);
    return t;
  }, [length, height]);

  const slate = useMemo(() => makeSlate(signTop, signMain, signBottom), [signTop, signMain, signBottom]);
  const shadow = useMemo(() => makeShadowPool(), []);
  useEffect(
    () => () => {
      iceMap.dispose();
      slats.dispose();
      slate.dispose();
      shadow.dispose();
    },
    [iceMap, slats, slate, shadow],
  );

  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4A3524",
        roughness: 0.78,
        metalness: 0.05,
        envMapIntensity: 0.6,
      }),
    [],
  );
  const steelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#A7AEB0",
        roughness: 0.24,
        metalness: 0.92,
        envMapIntensity: 1.5,
      }),
    [],
  );
  const iceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: iceMap,
        color: "#DDEDEE",
        roughness: 0.72,
        metalness: 0.02,
        emissive: new THREE.Color("#9FD8E2"),
        emissiveIntensity: iceEmissive * 0.22,
        envMapIntensity: 1.1,
      }),
    [iceMap, iceEmissive],
  );
  const frontMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: slats,
        roughness: 0.55,
        metalness: 0.35,
        envMapIntensity: 0.8,
      }),
    [slats],
  );

  return (
    <group position={position} rotation-y={rotationY}>
      {/* body */}
      <mesh position={[0, -height / 2, 0]} material={woodMat}>
        <boxGeometry args={[length, height, depth]} />
      </mesh>
      {/* front panel (faces the hall, local +Z) */}
      <mesh position={[0, -height * 0.5, depth / 2 + 0.012]} material={frontMat}>
        <boxGeometry args={[length * 0.97, height * 0.82, 0.03]} />
      </mesh>
      {/* toe kick */}
      <mesh position={[0, -height + 0.06, depth / 2 - 0.08]} material={steelMat}>
        <boxGeometry args={[length * 0.98, 0.12, 0.06]} />
      </mesh>
      {/* stainless top plate */}
      <mesh position={[0, -0.035, 0]} material={steelMat}>
        <boxGeometry args={[length, 0.07, depth]} />
      </mesh>
      {/* raised, heaped ice bed — the catch sits proud of the steel rim */}
      <mesh position={[0, 0.0, 0]} material={iceMat}>
        <boxGeometry args={[length - 0.3, 0.22, depth - 0.3]} />
      </mesh>
      {/* cold light spilling off the ice */}
      <pointLight
        position={[0, 1.1, 0.4]}
        color="#BFE3E8"
        intensity={5}
        distance={5.5}
        decay={2}
      />
      {/* standing price card, set back in the ice — always in frame with the catch */}
      <group position={[0, 0.3, -depth / 2 + 0.3]} rotation-x={-0.34}>
        <mesh>
          <planeGeometry args={[0.7, 0.27]} />
          <meshStandardMaterial
            map={slate}
            roughness={0.95}
            emissive="#F5F2EA"
            emissiveIntensity={0.16}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.13, -depth / 2 + 0.34]} material={steelMat}>
        <boxGeometry args={[0.74, 0.035, 0.05]} />
      </mesh>

      {/* hanging chalk slate — dropped low so it reads from the counter */}
      <group position={[0, 1.45, depth * 0.1]}>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 1.15, 0]} material={steelMat}>
            <cylinderGeometry args={[0.014, 0.014, 1.7, 8]} />
          </mesh>
        ))}
        <mesh position={[0, 1.95, 0]} material={steelMat} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.016, 0.016, 1.3, 8]} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.5, 0.56, 0.035]} />
          <meshStandardMaterial attach="material-0" color="#1B1E1D" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.021]}>
          <planeGeometry args={[1.44, 0.5]} />
          <meshStandardMaterial map={slate} roughness={0.95} emissive="#F5F2EA" emissiveIntensity={0.08} />
        </mesh>
      </group>
      {/* fake contact shadow on the wet floor */}
      <mesh
        position={[0, -height + 0.012, 0]}
        rotation-x={-Math.PI / 2}
        material={useMemo(
          () =>
            new THREE.MeshBasicMaterial({
              map: shadow,
              transparent: true,
              opacity: 0.85,
              depthWrite: false,
            }),
          [shadow],
        )}
      >
        <planeGeometry args={[length + 1.5, depth + 1.8]} />
      </mesh>

      {children}
    </group>
  );
}

/** Swaying pendant lamp used down the aisle. */
export function Pendant({
  position,
  lit = false,
  index = 0,
}: {
  position: [number, number, number];
  lit?: boolean;
  index?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.35 + index * 1.7;
    ref.current.rotation.z = Math.sin(t) * 0.035;
    ref.current.rotation.x = Math.cos(t * 0.8) * 0.022;
  });
  return (
    <group position={position} ref={ref}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.2, 6]} />
        <meshStandardMaterial color="#2C302F" roughness={0.6} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.34, 0.3, 24, 1, true]} />
        <meshStandardMaterial
          color="#33383A"
          roughness={0.34}
          metalness={0.9}
          side={THREE.DoubleSide}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial
          color="#FFE0AE"
          emissive="#FFB765"
          emissiveIntensity={3.4}
          roughness={0.2}
        />
      </mesh>
      {lit && (
        <pointLight
          position={[0, -0.35, 0]}
          color="#FFB765"
          intensity={16}
          distance={14}
          decay={2}
        />
      )}
    </group>
  );
}
