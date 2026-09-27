"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Environment as DreiEnvironment, Lightformer } from "@react-three/drei";
import { Pendant } from "./Counter";
import { makeCaustics, makeSoftSprite } from "@/lib/textures";

function useColorTexture(url: string, repeat: [number, number]) {
  const tex = useLoader(THREE.TextureLoader, url);
  return useMemo(() => {
    const t = tex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [tex, repeat[0], repeat[1]]);
}

/** Drifting motes — cold mist that sits on the ice, warm dust in the lamp cones. */
function Particles({
  count,
  area,
  center,
  color,
  size,
  opacity,
  drift,
}: {
  count: number;
  area: [number, number, number];
  center: [number, number, number];
  color: string;
  size: number;
  opacity: number;
  drift: number;
}) {
  const sprite = useMemo(() => makeSoftSprite(), []);
  const { geo, base, seed } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const x = center[0] + (Math.random() - 0.5) * area[0];
      const y = center[1] + (Math.random() - 0.5) * area[1];
      const z = center[2] + (Math.random() - 0.5) * area[2];
      pos[i * 3] = base[i * 3] = x;
      pos[i * 3 + 1] = base[i * 3 + 1] = y;
      pos[i * 3 + 2] = base[i * 3 + 2] = z;
      seed[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, base, seed };
  }, [count, area, center]);

  useEffect(() => () => { geo.dispose(); sprite.dispose(); }, [geo, sprite]);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    const g = geo;
    const arr = g.getAttribute("position") as THREE.BufferAttribute;
    const t = state.clock.elapsedTime * drift;
    for (let i = 0; i < count; i++) {
      const s = seed[i];
      arr.array[i * 3] = base[i * 3] + Math.sin(t * 0.6 + s) * 0.42;
      arr.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.9 + s * 1.7) * 0.22;
      arr.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.5 + s * 0.8) * 0.42;
    }
    arr.needsUpdate = true;
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.05) * 0.01;
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Crates() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6B4A32", roughness: 0.85, metalness: 0.04 }),
    [],
  );
  const mat2 = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#4E3726", roughness: 0.9, metalness: 0.04 }),
    [],
  );
  const items = useMemo(() => {
    const out: { p: [number, number, number]; r: number; s: [number, number, number]; m: 0 | 1 }[] = [];
    const spots: [number, number][] = [
      [-6.5, 6.2],
      [-6.4, -7.4],
      [-6.5, -20.6],
      [6.5, 3.6],
      [6.4, -13.9],
      [6.5, -31.4],
      [-6.4, -33.6],
      [6.4, -26.1],
    ];
    spots.forEach(([x, z], i) => {
      out.push({ p: [x, 0.22, z], r: (i * 0.7) % 1.2, s: [0.66, 0.44, 0.46], m: i % 2 ? 1 : 0 });
      if (i % 3 === 0) out.push({ p: [x + 0.05, 0.66, z + 0.06], r: 0.4, s: [0.6, 0.42, 0.44], m: 1 });
    });
    return out;
  }, []);

  useEffect(() => () => { mat.dispose(); mat2.dispose(); }, [mat, mat2]);

  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} rotation-y={it.r} material={it.m ? mat2 : mat}>
          <boxGeometry args={it.s} />
        </mesh>
      ))}
    </group>
  );
}

export default function MarketEnvironment() {
  const floorMap = useColorTexture("textures/floor.jpg", [4, 16]);
  const wallMap = useColorTexture("textures/wall.jpg", [16, 1.4]);
  const caustics = useMemo(() => makeCaustics(256), []);

  useEffect(
    () => () => {
      floorMap.dispose();
      wallMap.dispose();
      caustics.dispose();
    },
    [floorMap, wallMap, caustics],
  );

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: floorMap,
        color: "#5A6365",
        roughness: 0.3,
        metalness: 0.24,
        envMapIntensity: 1.4,
      }),
    [floorMap],
  );
  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wallMap,
        color: "#58615F",
        roughness: 0.5,
        metalness: 0.16,
        envMapIntensity: 0.9,
      }),
    [wallMap],
  );
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#14181A", roughness: 0.92, metalness: 0.06 }),
    [],
  );

  const causticRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    caustics.offset.set(t * 0.012, t * 0.019);
    if (causticRef.current) {
      (causticRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + Math.sin(t * 0.4) * 0.028;
    }
  });

  const pendantZ = useMemo(() => {
    const arr: number[] = [];
    for (let z = 4.6; z >= -35; z -= 3.4) arr.push(z);
    return arr;
  }, []);

  const railMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8C7A4E",
        roughness: 0.32,
        metalness: 0.95,
        envMapIntensity: 1.6,
      }),
    [],
  );

  return (
    <group>
      {/* ---------- lighting: warm pendants overhead, cool spill from the ice ---------- */}
      <ambientLight intensity={0.42} color="#A8C2C6" />
      <directionalLight position={[8, 9, 16]} intensity={0.75} color="#FFE0B8" />
      <directionalLight position={[-9, 6, -26]} intensity={0.26} color="#7FB6C0" />

      {/* local reflections for steel and wet floor — rendered once, no HDR download */}
      <DreiEnvironment resolution={128} frames={1}>
        <Lightformer intensity={2.6} color="#FFC98A" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 40, 1]} />
        <Lightformer intensity={1.1} color="#BFE3E8" position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[30, 8, 1]} />
        <Lightformer intensity={1.1} color="#BFE3E8" position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[30, 8, 1]} />
        <Lightformer intensity={0.6} color="#123B45" position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[12, 44, 1]} />
      </DreiEnvironment>

      {/* ---------- the hall ---------- */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -14.2]} material={floorMat}>
        <planeGeometry args={[14, 48]} />
      </mesh>
      {/* moving water sheen across the wet floor */}
      <mesh ref={causticRef} rotation-x={-Math.PI / 2} position={[0, 0.014, -14.2]}>
        <planeGeometry args={[14, 48]} />
        <meshBasicMaterial
          map={caustics}
          color="#8FE0EC"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-7, 2.2, -14.2]} rotation-y={Math.PI / 2} material={wallMat}>
        <planeGeometry args={[48, 4.4]} />
      </mesh>
      <mesh position={[7, 2.2, -14.2]} rotation-y={-Math.PI / 2} material={wallMat}>
        <planeGeometry args={[48, 4.4]} />
      </mesh>
      <mesh position={[0, 2.2, -38]} material={wallMat}>
        <planeGeometry args={[14, 4.4]} />
      </mesh>
      <mesh position={[0, 2.2, 9.6]} rotation-y={Math.PI} material={wallMat}>
        <planeGeometry args={[14, 4.4]} />
      </mesh>
      <mesh position={[0, 4.4, -14.2]} rotation-x={Math.PI / 2} material={darkMat}>
        <planeGeometry args={[14, 48]} />
      </mesh>

      {/* brass rail + hanging hooks along both walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 6.86, 2.95, -14.2]} rotation-x={Math.PI / 2} material={railMat}>
          <cylinderGeometry args={[0.024, 0.024, 46, 8]} />
        </mesh>
      ))}

      {/* far doorway — the way out to the table */}
      <group position={[0, 0, -37.9]}>
        <mesh position={[0, 1.6, 0.03]}>
          <planeGeometry args={[2.6, 3.2]} />
          <meshStandardMaterial color="#F2E4CB" emissive="#FFCE92" emissiveIntensity={1.5} roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.6, 0.06]}>
          <planeGeometry args={[3.1, 3.7]} />
          <meshStandardMaterial color="#2A231B" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.6, 0.07]}>
          <planeGeometry args={[2.6, 3.2]} />
          <meshStandardMaterial color="#FFE9C8" emissive="#FFCE92" emissiveIntensity={2.1} />
        </mesh>
      </group>

      {/* ---------- pendant row ---------- */}
      {pendantZ.map((z, i) => (
        <Pendant key={z} position={[0, 3.35, z]} index={i} lit={i === 3 || i === 5 || i === 8 || i === 10} />
      ))}

      <Crates />

      {/* ---------- atmosphere ---------- */}
      <Particles
        count={340}
        area={[13, 1.1, 54]}
        center={[0, 1.15, -14]}
        color="#BFE3E8"
        size={0.32}
        opacity={0.16}
        drift={0.5}
      />
      <Particles
        count={420}
        area={[13, 4, 54]}
        center={[0, 2.3, -14]}
        color="#FFD9A6"
        size={0.045}
        opacity={0.5}
        drift={0.35}
      />
    </group>
  );
}
