import * as THREE from "three";
import type { SpeciesShape } from "@/data/products";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ *
 * A fish built as a lofted body: cross sections swept nose → peduncle,
 * countershaded by vertex colour, with flat extruded tail and fins.
 * No cube stands in for a fish anywhere in this scene.
 * ------------------------------------------------------------------ */

export function buildFishBody(s: SpeciesShape, bodyColor: string) {
  const L = s.length;
  const H = s.height;
  const D = s.depth;
  const T = 46; // along body
  const R = 22; // around section
  const xNose = (0.5 + s.snout) * L;
  const xTail = -0.34 * L;
  const arch = s.dorsal;

  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];

  const dorsalC = new THREE.Color("#3E4E52");
  const flankC = new THREE.Color(bodyColor);
  const bellyC = new THREE.Color("#E9E7DE");
  const c = new THREE.Color();

  for (let i = 0; i <= T; i++) {
    const u = i / T; // 0 nose → 1 peduncle
    const x = mix(xNose, xTail, u);

    // vertical profile
    let hv: number;
    const hPeak = 0.3 + 0.12 * arch;
    if (u < hPeak) hv = mix(0.09, 1, smoothstep(0, hPeak, u));
    else hv = mix(1, 0.3, smoothstep(hPeak, 1, u));

    // lateral profile
    let wv: number;
    if (u < 0.34) wv = mix(0.12, 1, smoothstep(0, 0.34, u));
    else wv = mix(1, 0.36, smoothstep(0.34, 1, u));

    // head wedge: snout tapers faster vertically than laterally
    const headTaper = mix(0.55, 1, smoothstep(0, 0.18, u));
    const hh = H * hv * headTaper;
    const hw = D * wv * mix(0.7, 1, smoothstep(0, 0.2, u));

    // belly hangs slightly deeper than the back (groupers, carp)
    const bellyDrop = H * 0.1 * s.belly;

    for (let j = 0; j <= R; j++) {
      const a = (j / R) * Math.PI * 2;
      const sy = Math.sin(a);
      const sz = Math.cos(a);
      // superellipse keeps the back softly rounded rather than balloon-like
      const p = 0.86;
      const ky = Math.sign(sy) * Math.pow(Math.abs(sy), p);
      const kz = Math.sign(sz) * Math.pow(Math.abs(sz), p);

      const y = hh * ky - bellyDrop * (ky < 0 ? 0.45 : 0);
      const z = hw * kz;
      pos.push(x, y, z);

      const shade = (y / Math.max(hh, 1e-4) + 1) * 0.5; // 0 belly → 1 back
      c.copy(bellyC).lerp(flankC, smoothstep(0.1, 0.62, shade));
      c.lerp(dorsalC, smoothstep(0.68, 1, shade));
      col.push(c.r, c.g, c.b);
    }
  }

  for (let i = 0; i < T; i++) {
    for (let j = 0; j < R; j++) {
      const a = i * (R + 1) + j;
      const b = a + R + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  // peduncle cap
  const capStart = pos.length / 3;
  pos.push(xTail, 0, 0);
  col.push(flankC.r, flankC.g, flankC.b);
  const ringStart = T * (R + 1);
  for (let j = 0; j < R; j++) idx.push(ringStart + j, capStart, ringStart + j + 1);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function extrudeFlat(
  build: (shape: THREE.Shape) => void,
  thickness: number,
  bevel = 0.004,
) {
  const shape = new THREE.Shape();
  build(shape);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 14,
    steps: 1,
  });
  g.translate(0, 0, -thickness / 2);
  return g;
}

export function buildTail(s: SpeciesShape) {
  const L = s.length;
  const H = s.height;
  const f = 0.3 + 0.72 * s.fork;
  const px = -0.34 * L;
  const r = 0.3 * H;
  return extrudeFlat((sh) => {
    sh.moveTo(px, r * 0.9);
    sh.lineTo(px - 0.17 * L, r + H * f * 0.72);
    sh.quadraticCurveTo(px - 0.1 * L, 0, px - 0.17 * L, -(r + H * f * 0.72));
    sh.lineTo(px, -r * 0.9);
    sh.quadraticCurveTo(px + 0.03 * L, 0, px, r * 0.9);
  }, s.depth * 1.15);
}

export function buildDorsalFin(s: SpeciesShape) {
  const L = s.length;
  const H = s.height;
  const peak = H * (1.18 + 0.22 * s.dorsal);
  return extrudeFlat((sh) => {
    sh.moveTo(0.2 * L, H * 0.5);
    sh.quadraticCurveTo(0.12 * L, peak, 0.0, peak * 0.96);
    sh.quadraticCurveTo(-0.1 * L, peak * 0.9, -0.17 * L, H * 0.46);
    sh.quadraticCurveTo(0.02 * L, H * 0.78, 0.2 * L, H * 0.5);
  }, s.depth * 0.7);
}

export function buildAnalFin(s: SpeciesShape) {
  const L = s.length;
  const H = s.height;
  const drop = H * (0.72 + 0.2 * s.belly);
  return extrudeFlat((sh) => {
    sh.moveTo(-0.02 * L, -H * 0.5);
    sh.quadraticCurveTo(-0.07 * L, -drop, -0.16 * L, -drop * 0.88);
    sh.quadraticCurveTo(-0.2 * L, -drop * 0.7, -0.2 * L, -H * 0.42);
    sh.quadraticCurveTo(-0.11 * L, -H * 0.7, -0.02 * L, -H * 0.5);
  }, s.depth * 0.6);
}

export function buildPectoralFin(s: SpeciesShape) {
  const L = s.length;
  const H = s.height;
  return extrudeFlat((sh) => {
    sh.moveTo(0, 0);
    sh.quadraticCurveTo(-0.12 * L, -0.16 * H, -0.19 * L, -0.06 * H);
    sh.quadraticCurveTo(-0.12 * L, 0.06 * H, 0, 0);
  }, s.depth * 0.4);
}

export function buildGillArc(s: SpeciesShape) {
  const H = s.height;
  const g = new THREE.TorusGeometry(H * 0.52, H * 0.03, 6, 22, Math.PI * 1.05);
  g.rotateY(Math.PI / 2);
  g.rotateZ(Math.PI * 0.48);
  g.translate(0.3 * s.length, 0, 0);
  return g;
}

/* ------------------------------------------------------------------ *
 * Crustacean sweep: a tube with a varying radius along a curve,
 * optionally banded to read as shell segments.
 * ------------------------------------------------------------------ */
export function sweep(
  points: THREE.Vector3[],
  radius: (u: number) => number,
  tubular = 46,
  radial = 12,
  band = 0,
) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
  const frames = curve.computeFrenetFrames(tubular, false);
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();

  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular;
    curve.getPointAt(u, P);
    N.copy(frames.normals[Math.min(i, tubular - 1)]);
    B.copy(frames.binormals[Math.min(i, tubular - 1)]);
    let r = radius(u);
    if (band) r *= 1 + band * Math.sin(u * Math.PI * 11);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      const nx = cos * N.x + sin * B.x;
      const ny = cos * N.y + sin * B.y;
      const nz = cos * N.z + sin * B.z;
      pos.push(P.x + r * nx, P.y + r * ny, P.z + r * nz);
      uv.push(u, j / radial);
    }
  }
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Fan of a crustacean tail / crab leg tip. */
export function fanShape(width: number, length: number, lobes = 5) {
  return extrudeFlat((sh) => {
    sh.moveTo(0, 0);
    const half = width / 2;
    sh.lineTo(-half, length * 0.72);
    for (let i = 1; i < lobes; i++) {
      const x = -half + (width * i) / (lobes - 1);
      const scallop = i % 2 === 0 ? 0.86 : 1;
      sh.quadraticCurveTo(
        x - width / (lobes * 2),
        length * 1.1 * scallop,
        x,
        length * 0.78 * scallop,
      );
    }
    sh.lineTo(half, length * 0.72);
    sh.lineTo(0, 0);
  }, 0.012);
}

export function buildPrawn(s: SpeciesShape) {
  const L = s.length;
  const R = s.depth;
  const bodyPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    // a gentle J-curve: head high, tail curling under
    bodyPts.push(
      new THREE.Vector3(
        L * (0.5 - u * 0.95),
        L * (0.16 * Math.sin(u * Math.PI * 0.92) - 0.34 * u * u),
        0,
      ),
    );
  }
  const body = sweep(
    bodyPts,
    (u) => R * (0.42 + 0.72 * Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.06))) * (1 - 0.55 * u * u),
    54,
    14,
    0.05,
  );
  return { body, L, R };
}

export function buildLobster(s: SpeciesShape) {
  const L = s.length;
  const R = s.depth;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 9; i++) {
    const u = i / 9;
    pts.push(
      new THREE.Vector3(
        L * (0.48 - u * 0.92),
        L * (0.06 * Math.sin(u * Math.PI * 0.8) - 0.3 * u * u * u),
        0,
      ),
    );
  }
  const body = sweep(
    pts,
    (u) =>
      R *
      (u < 0.3
        ? mix(0.7, 1, smoothstep(0, 0.3, u))
        : mix(1, 0.34, smoothstep(0.3, 1, u))),
    56,
    14,
    0.035,
  );
  return { body, pts, L, R };
}

export function buildClaw(size: number, flip = 1) {
  const arm = sweep(
    [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(size * 0.5 * flip, size * 0.16, size * 0.08),
      new THREE.Vector3(size * 1.0 * flip, size * 0.1, size * 0.02),
    ],
    (u) => size * (0.17 - 0.05 * u),
    18,
    9,
  );
  const pincer = extrudeFlat((sh) => {
    sh.moveTo(0, 0);
    sh.quadraticCurveTo(size * 0.5, size * 0.3, size * 0.98, size * 0.13);
    sh.quadraticCurveTo(size * 0.72, size * 0.02, size * 0.96, -size * 0.06);
    sh.quadraticCurveTo(size * 0.5, -size * 0.26, 0, -size * 0.14);
    sh.quadraticCurveTo(-size * 0.1, 0, 0, 0);
  }, size * 0.14, size * 0.03);
  if (flip < 0) {
    arm.scale(1, 1, 1);
  }
  return { arm, pincer };
}

export function buildCarapace(w: number, d: number) {
  const lobes = 11;
  return extrudeFlat((sh) => {
    sh.moveTo(w * 0.5, 0);
    for (let i = 0; i <= lobes; i++) {
      const a = (i / lobes) * Math.PI;
      const bump = 1 + 0.045 * Math.sin(i * Math.PI);
      sh.lineTo(Math.cos(a) * w * 0.5, Math.sin(a) * d * 0.5 * bump);
    }
    for (let i = lobes; i >= 0; i--) {
      const a = Math.PI + (i / lobes) * Math.PI;
      sh.lineTo(Math.cos(a) * w * 0.5, Math.sin(a) * d * 0.5 * 0.86);
    }
    sh.lineTo(w * 0.5, 0);
  }, d * 0.34, d * 0.2);
}

export function taperedLimb(a: THREE.Vector3[], r0: number, r1: number) {
  return sweep(a, (u) => mix(r0, r1, u), 14, 7);
}

/**
 * A ribbed bivalve: a squashed sphere whose radial frequency is modulated
 * to raise real ribs, then tapered along its long axis. Convex side up,
 * already lying the way it sits on the ice.
 */
export function buildShell(form: "round" | "long" = "round") {
  const g = new THREE.SphereGeometry(1, 44, 24);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const ribs = form === "long" ? 11 : 16;
  const amp = form === "long" ? 0.035 : 0.05;
  const sx = form === "long" ? 0.62 : 0.5;
  const sz = form === "long" ? 0.4 : 0.48;
  const sy = form === "long" ? 0.2 : 0.24;

  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    const theta = Math.atan2(z, x);
    let rib = 1 + amp * Math.sin(theta * ribs);
    // oyster: craggy, irregular growth rings
    rib += form === "round" ? 0.055 * Math.sin(theta * 3 + 1.1) + 0.03 * Math.sin(theta * 7) : 0;
    x *= rib * sx;
    z *= rib * sz;
    y *= sy * (1 + 0.12 * Math.sin(theta * 5));
    if (form === "long") {
      // point the umbo one way, flare the other
      const t = (x / (sx * 1.05) + 1) * 0.5;
      z *= mix(1.16, 0.68, t);
      y *= mix(1.05, 0.82, t);
    }
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
