import type { StationId } from "@/data/products";

export type Station = {
  id: StationId;
  index: number;
  label: string;
  eyebrow: string;
  t: number;
  camera: [number, number, number];
  target: [number, number, number];
  side: "left" | "right" | "end";
  story: string;
  storyNote: string;
};

/**
 * One hall, one continuous dolly. The camera never cuts — it is eased
 * between these keyframes along a damped piecewise path.
 */
export const STATIONS: Station[] = [
  {
    id: "entrance",
    index: 0,
    label: "Threshold",
    eyebrow: "The morning catch",
    t: 0,
    camera: [0, 1.95, 8.2],
    target: [0, 1.5, -7],
    side: "end",
    story: "CAUGHT",
    storyNote: "Landed before first light",
  },
  {
    id: "fish",
    index: 1,
    label: "Fresh Fish",
    eyebrow: "Counter 01",
    t: 1 / 6,
    camera: [-2.5, 1.9, -2.9],
    target: [-5.05, 1.05, -4.0],
    side: "left",
    story: "SELECTED",
    storyNote: "Sorted by hand, on the ice",
  },
  {
    id: "prawns",
    index: 2,
    label: "Prawns",
    eyebrow: "Counter 02",
    t: 2 / 6,
    camera: [2.5, 1.9, -9.1],
    target: [5.05, 1.05, -10.2],
    side: "right",
    story: "SELECTED",
    storyNote: "Shell-on, never frozen",
  },
  {
    id: "shellfish",
    index: 3,
    label: "Shellfish",
    eyebrow: "Counter 02b",
    t: 3 / 6,
    camera: [-2.5, 1.9, -15.3],
    target: [-5.05, 1.05, -16.4],
    side: "left",
    story: "SELECTED",
    storyNote: "Held live in filtered water",
  },
  {
    id: "premium",
    index: 4,
    label: "Premium",
    eyebrow: "Counter 03",
    t: 4 / 6,
    camera: [2.5, 1.92, -21.5],
    target: [5.05, 1.08, -22.6],
    side: "right",
    story: "PREPARED",
    storyNote: "Reserved before it reaches the ice",
  },
  {
    id: "preparation",
    index: 5,
    label: "Preparation",
    eyebrow: "The bench",
    t: 5 / 6,
    camera: [-2.5, 1.94, -27.7],
    target: [-5.05, 1.06, -28.8],
    side: "left",
    story: "PACKED",
    storyNote: "Cleaned your way, on the board",
  },
  {
    id: "table",
    index: 6,
    label: "To your table",
    eyebrow: "The door",
    t: 1,
    camera: [0, 1.88, -31.0],
    target: [0, 1.5, -37.2],
    side: "end",
    story: "DELIVERED",
    storyNote: "From our market to your table",
  },
];

/** Where each counter physically sits in the hall. */
export const COUNTERS = {
  fish: { position: [-5.15, 0.98, -4.0] as [number, number, number], rotationY: Math.PI / 2 },
  prawns: { position: [5.15, 0.98, -10.2] as [number, number, number], rotationY: -Math.PI / 2 },
  shellfish: { position: [-5.15, 0.98, -16.4] as [number, number, number], rotationY: Math.PI / 2 },
  premium: { position: [5.15, 1.02, -22.6] as [number, number, number], rotationY: -Math.PI / 2 },
  preparation: { position: [-5.15, 1.0, -28.8] as [number, number, number], rotationY: Math.PI / 2 },
};

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  a + (b - a) * (1 - Math.exp(-lambda * dt));

function interpolate(
  t: number,
  keys: { t: number; v: [number, number, number] }[],
  out: [number, number, number],
): [number, number, number] {
  if (t <= keys[0].t) {
    out[0] = keys[0].v[0];
    out[1] = keys[0].v[1];
    out[2] = keys[0].v[2];
    return out;
  }
  const last = keys[keys.length - 1];
  if (t >= last.t) {
    out[0] = last.v[0];
    out[1] = last.v[1];
    out[2] = last.v[2];
    return out;
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const k = smoothstep(a.t, b.t, t);
      out[0] = a.v[0] + (b.v[0] - a.v[0]) * k;
      out[1] = a.v[1] + (b.v[1] - a.v[1]) * k;
      out[2] = a.v[2] + (b.v[2] - a.v[2]) * k;
      return out;
    }
  }
  return out;
}

const camKeys = STATIONS.map((s) => ({ t: s.t, v: s.camera }));
const tgtKeys = STATIONS.map((s) => ({ t: s.t, v: s.target }));

const _cam: [number, number, number] = [0, 0, 0];
const _tgt: [number, number, number] = [0, 0, 0];

/** Damped, eased sampling of the hall keyframes. Never snaps. */
export function samplePath(t: number) {
  return {
    position: interpolate(t, camKeys, _cam),
    target: interpolate(t, tgtKeys, _tgt),
  };
}

export function stationForProgress(t: number) {
  let best = 0;
  let bestDist = Infinity;
  for (const s of STATIONS) {
    const d = Math.abs(s.t - t);
    if (d < bestDist) {
      bestDist = d;
      best = s.index;
    }
  }
  return best;
}
