"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Product } from "@/data/products";
import {
  buildAnalFin,
  buildCarapace,
  buildClaw,
  buildDorsalFin,
  buildFishBody,
  buildGillArc,
  buildLobster,
  buildPrawn,
  buildPectoralFin,
  buildShell,
  buildTail,
  fanShape,
  sweep,
  taperedLimb,
} from "./geometry";

type Props = {
  product: Product;
  hovered?: boolean;
  focused?: boolean;
};

const EYE = new THREE.Color("#0A0C0C");

/** Lays a swim-oriented body down on the ice, then spins it to its display angle. */
function OnIce({ children, spin = 0 }: { children: React.ReactNode; spin?: number }) {
  return (
    <group rotation-y={spin}>
      <group rotation-x={-Math.PI / 2}>{children}</group>
    </group>
  );
}

function useGlow(mats: THREE.Material[], active: boolean, amount = 0.5) {
  const ref = useRef({ v: 0 });
  useFrame((_, dt) => {
    const t = active ? 1 : 0;
    ref.current.v += (t - ref.current.v) * Math.min(1, dt * 7);
    for (const m of mats) {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissiveIntensity !== undefined) {
        mm.emissiveIntensity = ref.current.v * amount;
      }
    }
  });
}

function useMaterials(build: () => THREE.Material[], deps: unknown[]) {
  const mats = useMemo(build, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
  return mats;
}

function Fish({ product, hovered, focused }: Props) {
  const s = product.shape;
  const g = useMemo(
    () => ({
      body: buildFishBody(s, product.color),
      tail: buildTail(s),
      dorsal: buildDorsalFin(s),
      anal: buildAnalFin(s),
      pect: buildPectoralFin(s),
      gill: buildGillArc(s),
    }),
    [s, product.color],
  );
  useEffect(
    () => () => Object.values(g).forEach((x) => x.dispose()),
    [g],
  );

  const bodyMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.34,
        metalness: 0.34,
        envMapIntensity: 1.35,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [],
  )[0] as THREE.MeshStandardMaterial;

  const finMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.accent),
        roughness: 0.5,
        metalness: 0.2,
        envMapIntensity: 1.1,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.accent],
  )[0] as THREE.MeshStandardMaterial;

  const eyeMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: EYE,
        roughness: 0.08,
        metalness: 0.5,
        envMapIntensity: 2,
      }),
    ],
    [],
  )[0] as THREE.MeshStandardMaterial;

  useGlow([bodyMat, finMat], !!hovered || !!focused, hovered ? 0.34 : 0.18);

  const headW = s.depth * 0.4;
  const eyeR = Math.max(0.012, s.height * 0.075);
  const eyeX = 0.355 * s.length;
  const eyeY = s.height * 0.16;

  return (
    <OnIce spin={product.rotation}>
      <mesh geometry={g.body} material={bodyMat} />
      <mesh geometry={g.tail} material={finMat} />
      <mesh geometry={g.dorsal} material={finMat} />
      <mesh geometry={g.anal} material={finMat} />
      <mesh
        geometry={g.pect}
        material={finMat}
        position={[0.17 * s.length, -s.height * 0.12, headW * 1.1]}
        rotation={[-0.35, 0, -0.55]}
      />
      <mesh geometry={g.gill} material={finMat} />
      {[1, -1].map((sgn) => (
        <mesh
          key={sgn}
          material={eyeMat}
          position={[eyeX, eyeY, sgn * headW]}
          scale={[1, 1, 0.7]}
        >
          <sphereGeometry args={[eyeR, 14, 12]} />
        </mesh>
      ))}
    </OnIce>
  );
}

function Prawn({ product, hovered, focused }: Props) {
  const s = product.shape;
  const g = useMemo(() => {
    const { body, L, R } = buildPrawn(s);
    const tail = fanShape(R * 2.6, R * 2.2, 5);
    const antenna = sweep(
      [
        new THREE.Vector3(L * 0.46, L * 0.1, 0),
        new THREE.Vector3(L * 0.72, L * 0.3, R * 0.16),
        new THREE.Vector3(L * 1.08, L * 0.34, R * 0.5),
      ],
      () => R * 0.06,
      20,
      5,
    );
    const legs = [0, 1, 2, 3].flatMap((i) =>
      [1, -1].map((sgn) =>
        taperedLimb(
          [
            new THREE.Vector3(L * (0.34 - i * 0.13), -L * 0.03, 0),
            new THREE.Vector3(
              L * (0.3 - i * 0.13),
              -L * 0.1,
              sgn * R * 0.7,
            ),
          ],
          R * 0.1,
          R * 0.03,
        ),
      ),
    );
    return { body, tail, antenna, legs, L, R };
  }, [s]);
  useEffect(
    () => () => {
      [g.body, g.tail, g.antenna, ...g.legs].forEach((x) => x.dispose());
    },
    [g],
  );

  const shellMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.color),
        roughness: 0.26,
        metalness: 0.3,
        envMapIntensity: 1.5,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.color],
  )[0] as THREE.MeshStandardMaterial;

  const legMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.accent),
        roughness: 0.45,
        metalness: 0.15,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.accent],
  )[0] as THREE.MeshStandardMaterial;

  const eyeMat = useMaterials(
    () => [new THREE.MeshStandardMaterial({ color: EYE, roughness: 0.1, metalness: 0.4 })],
    [],
  )[0] as THREE.MeshStandardMaterial;

  useGlow([shellMat, legMat], !!hovered || !!focused, hovered ? 0.4 : 0.2);

  // tail fan sits at the end of the curve (u = 1 → −X side)
  const tailPos: [number, number, number] = [-g.L * 0.45, -g.L * 0.34, 0];

  return (
    <OnIce spin={product.rotation}>
      <mesh geometry={g.body} material={shellMat} />
      <mesh
        geometry={g.tail}
        material={legMat}
        position={tailPos}
        rotation={[0, 0, Math.PI / 2]}
      />
      <mesh geometry={g.antenna} material={legMat} />
      <mesh geometry={g.antenna} material={legMat} scale={[1, -1, 1]} />
      {g.legs.map((l, i) => (
        <mesh key={i} geometry={l} material={legMat} />
      ))}
      {[1, -1].map((sgn) => (
        <mesh key={sgn} material={eyeMat} position={[g.L * 0.44, g.L * 0.13, sgn * g.R * 0.32]}>
          <sphereGeometry args={[g.R * 0.15, 10, 8]} />
        </mesh>
      ))}
    </OnIce>
  );
}

function Lobster({ product, hovered, focused }: Props) {
  const s = product.shape;
  const g = useMemo(() => {
    const { body, pts, L, R } = buildLobster(s);
    const tail = fanShape(R * 3.2, R * 2.6, 5);
    const clawA = buildClaw(L * 0.34, 1);
    const clawB = buildClaw(L * 0.34, 1);
    const ant = [-1, 1].map((sgn) =>
      sweep(
        [
          new THREE.Vector3(L * 0.44, L * 0.06, sgn * R * 0.3),
          new THREE.Vector3(L * 0.82, L * 0.26 + sgn * R * 0.5, R * 0.2),
          new THREE.Vector3(L * 1.32, L * 0.34 + sgn * R * 1.1, R * 0.4),
        ],
        (u) => R * 0.07 * (1 - 0.7 * u),
        22,
        5,
      ),
    );
    const legs = [0, 1, 2].flatMap((i) =>
      [1, -1].map((sgn) =>
        taperedLimb(
          [
            new THREE.Vector3(L * (0.3 - i * 0.12), -L * 0.02, sgn * R * 0.7),
            new THREE.Vector3(L * (0.26 - i * 0.12), -L * 0.1, sgn * R * 0.9),
          ],
          R * 0.11,
          R * 0.04,
        ),
      ),
    );
    return { body, tail, clawA, clawB, ant, legs, pts, L, R };
  }, [s]);
  useEffect(
    () => () => {
      [g.body, g.tail, g.clawA.arm, g.clawA.pincer, g.clawB.arm, g.clawB.pincer, ...g.ant, ...g.legs].forEach(
        (x) => x.dispose(),
      );
    },
    [g],
  );

  const shellMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.color),
        roughness: 0.38,
        metalness: 0.34,
        envMapIntensity: 1.4,
        emissive: new THREE.Color("#E08A4B"),
        emissiveIntensity: 0,
      }),
    ],
    [product.color],
  )[0] as THREE.MeshStandardMaterial;

  const accentMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.accent),
        roughness: 0.44,
        metalness: 0.25,
        emissive: new THREE.Color("#E08A4B"),
        emissiveIntensity: 0,
      }),
    ],
    [product.accent],
  )[0] as THREE.MeshStandardMaterial;

  useGlow([shellMat, accentMat], !!hovered || !!focused, hovered ? 0.32 : 0.16);

  const clawY = g.R * 0.4;
  return (
    <OnIce spin={product.rotation}>
      <mesh geometry={g.body} material={shellMat} />
      <mesh
        geometry={g.tail}
        material={accentMat}
        position={[-g.L * 0.44, -g.L * 0.3, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      {[g.clawA, g.clawB].map((c, i) => (
        <group key={i} position={[g.L * 0.4, clawY * 0.4, (i === 0 ? 1 : -1) * g.R * 0.9]} rotation={[0, 0, 0]}>
          <mesh geometry={c.arm} material={shellMat} />
          <mesh
            geometry={c.pincer}
            material={accentMat}
            position={[g.L * 0.32, 0, 0]}
            rotation={[0, 0, i === 0 ? 0.32 : -0.32]}
          />
        </group>
      ))}
      {g.ant.map((a, i) => (
        <mesh key={i} geometry={a} material={accentMat} />
      ))}
      {g.legs.map((l, i) => (
        <mesh key={i} geometry={l} material={shellMat} />
      ))}
    </OnIce>
  );
}

function Crab({ product, hovered, focused }: Props) {
  const s = product.shape;
  const g = useMemo(() => {
    const shell = buildCarapace(s.length, s.height * 1.5);
    shell.rotateX(-Math.PI / 2);
    const legs = [0, 1, 2, 3].flatMap((i) =>
      [1, -1].map((sgn) => {
        const spread = 0.5 + i * 0.16;
        return taperedLimb(
          [
            new THREE.Vector3(0, 0, sgn * s.length * 0.34),
            new THREE.Vector3(
              s.length * (0.3 - i * 0.26),
              -s.height * 0.12,
              sgn * s.length * (0.5 + spread * 0.3),
            ),
            new THREE.Vector3(
              s.length * (0.42 - i * 0.3),
              -s.height * 0.34,
              sgn * s.length * (0.62 + spread * 0.34),
            ),
          ],
          s.depth * 0.09,
          s.depth * 0.035,
        );
      }),
    );
    const claws = [1, -1].map((sgn) => {
      const arm = taperedLimb(
        [
          new THREE.Vector3(s.length * 0.4, 0, sgn * s.length * 0.3),
          new THREE.Vector3(s.length * 0.62, s.height * 0.06, sgn * s.length * 0.5),
          new THREE.Vector3(s.length * 0.82, 0, sgn * s.length * 0.44),
        ],
        s.depth * 0.14,
        s.depth * 0.1,
      );
      const pincer = fanShape(s.length * 0.3, s.length * 0.3, 3);
      return { arm, pincer };
    });
    return { shell, legs, claws };
  }, [s]);
  useEffect(
    () => () => {
      [g.shell, ...g.legs, ...g.claws.flatMap((c) => [c.arm, c.pincer])].forEach((x) => x.dispose());
    },
    [g],
  );

  const shellMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.color),
        roughness: 0.42,
        metalness: 0.3,
        envMapIntensity: 1.3,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.color],
  )[0] as THREE.MeshStandardMaterial;

  const legMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.accent),
        roughness: 0.5,
        metalness: 0.2,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.accent],
  )[0] as THREE.MeshStandardMaterial;

  useGlow([shellMat, legMat], !!hovered || !!focused, hovered ? 0.36 : 0.18);

  return (
    <group rotation-y={product.rotation + Math.PI / 2}>
      <mesh geometry={g.shell} material={shellMat} position={[0, 0, 0]} />
      <group position={[0, -s.height * 0.1, 0]}>
        <group scale={[1.5, 1, 1.5]}>
          {g.legs.map((l, i) => (
            <mesh key={i} geometry={l} material={legMat} />
          ))}
        </group>
        {g.claws.map((c, i) => (
          <group key={i}>
            <mesh geometry={c.arm} material={shellMat} />
            <mesh
              geometry={c.pincer}
              material={legMat}
              position={[s.length * 0.8, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        ))}
      </group>
      {[1, -1].map((sgn) => (
        <group key={sgn} position={[s.length * 0.44, s.height * 0.18, sgn * s.length * 0.1]}>
          <mesh material={shellMat}>
            <cylinderGeometry args={[s.length * 0.02, s.length * 0.02, s.height * 0.2, 6]} />
          </mesh>
          <mesh material={shellMat} position={[0, s.height * 0.12, 0]}>
            <sphereGeometry args={[s.length * 0.028, 8, 6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Shell({ product, hovered, focused }: Props) {
  const form = product.shellForm ?? "round";
  const g = useMemo(() => buildShell(form), [form]);
  useEffect(() => () => g.dispose(), [g]);

  const mat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.color),
        roughness: form === "round" ? 0.82 : 0.42,
        metalness: form === "round" ? 0.06 : 0.28,
        envMapIntensity: form === "round" ? 0.9 : 1.5,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.color, form],
  )[0] as THREE.MeshStandardMaterial;

  const innerMat = useMaterials(
    () => [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(product.accent),
        roughness: 0.6,
        metalness: 0.1,
        envMapIntensity: 1.1,
        emissive: new THREE.Color("#63C6D6"),
        emissiveIntensity: 0,
      }),
    ],
    [product.accent],
  )[0] as THREE.MeshStandardMaterial;

  useGlow([mat, innerMat], !!hovered || !!focused, hovered ? 0.3 : 0.15);

  const cluster = useMemo(() => {
    const n = form === "long" ? 5 : 4;
    return Array.from({ length: n }, (_, i) => ({
      p: [
        (Math.random() - 0.5) * 0.34,
        (i % 2) * 0.055,
        (Math.random() - 0.5) * 0.3,
      ] as [number, number, number],
      r: Math.random() * Math.PI * 2,
      s: 0.86 + Math.random() * 0.3,
      tilt: (Math.random() - 0.5) * 0.5,
    }));
  }, [form]);

  const scale = form === "long" ? 0.42 : 0.4;

  return (
    <group rotation-y={product.rotation}>
      {cluster.map((c, i) => (
        <mesh
          key={i}
          geometry={g}
          material={i % 3 === 2 ? innerMat : mat}
          position={c.p}
          rotation={[c.tilt, c.r, c.tilt * 0.6]}
          scale={scale * c.s}
        />
      ))}
    </group>
  );
}

export default function SpeciesMesh({ product, hovered, focused }: Props) {
  if (product.build === "shell") return <Shell product={product} hovered={hovered} focused={focused} />;
  if (product.build === "prawn") return <Prawn product={product} hovered={hovered} focused={focused} />;
  if (product.build === "lobster")
    return <Lobster product={product} hovered={hovered} focused={focused} />;
  if (product.build === "crab") return <Crab product={product} hovered={hovered} focused={focused} />;
  return <Fish product={product} hovered={hovered} focused={focused} />;
}
