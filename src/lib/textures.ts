"use client";

import { useMemo } from "react";
import * as THREE from "three";

/** Procedural canvas textures — no network fetch, no asset download at boot. */

export function makeCaustics(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      let n =
        Math.sin(u * 3 + Math.sin(v * 2) * 1.6) +
        Math.sin(v * 3 + Math.sin(u * 3) * 1.4) * 0.9 +
        Math.sin((u + v) * 4.2) * 0.5;
      n = Math.abs(n) / 2.4;
      n = Math.pow(n, 3.2);
      const val = Math.min(255, n * 320);
      const i = (y * size + x) * 4;
      img.data[i] = val * 0.72;
      img.data[i + 1] = val * 0.94;
      img.data[i + 2] = val;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function makeSoftSprite(size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(226,244,247,0.55)");
  g.addColorStop(1, "rgba(226,244,247,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  return t;
}

export function makeShadowPool(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.72)");
  g.addColorStop(0.55, "rgba(0,0,0,0.34)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  return t;
}

/** Cheap drifting particle field: mist over the ice, dust in the lamp cones. */
export function useParticleField(opts: {
  count: number;
  area: [number, number, number];
  center?: [number, number, number];
  vertical?: boolean;
}) {
  const { count, area, center = [0, 0, 0], vertical = false } = opts;
  return useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = center[0] + (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = center[1] + (Math.random() - 0.5) * area[1];
      pos[i * 3 + 2] = center[2] + (Math.random() - 0.5) * area[2];
      seed[i] = Math.random() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, seed, vertical };
  }, [count, area, center, vertical]);
}
