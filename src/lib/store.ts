"use client";

import { useSyncExternalStore } from "react";

export type Phase = "gate" | "landing" | "market";

export type BasketLine = {
  key: string;
  id: string;
  name: string;
  preparation: string;
  qty: number;
  price: number;
  unit: string;
};

export type StoreState = {
  ready: boolean;
  phase: Phase;
  /** target scroll progress 0..1 along the hall */
  progress: number;
  /** active station index, updated by the camera loop */
  station: number;
  hover: string | null;
  selected: string | null;
  basket: BasketLine[];
  basketOpen: boolean;
  railOpen: boolean;
};

let state: StoreState = {
  ready: false,
  phase: "gate",
  progress: 0,
  station: 0,
  hover: null,
  selected: null,
  basket: [],
  basketOpen: false,
  railOpen: false,
};

const listeners = new Set<() => void>();

export const getState = () => state;

export function setState(patch: Partial<StoreState>) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof StoreState)[]) {
    if (state[k] !== patch[k]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/* ------------------------------------------------------------------ *
 * Runtime camera driver. Mutated inside the R3F frame loop so that
 * scrolling never triggers a React re-render of the scene graph.
 * ------------------------------------------------------------------ */
export const cam = {
  /** damped current progress */
  t: 0,
  /** requested progress (scroll / nav) */
  target: 0,
  /** damping rate — lower is a slower, heavier dolly */
  lambda: 1.7,
  /** 0..1 blend toward a focused product */
  focus: 0,
  focusTarget: 0,
  /** world position the focused product sits at */
  fx: 0,
  fy: 0,
  fz: 0,
  /** pointer parallax */
  px: 0,
  py: 0,
};

export const basketCount = (b: BasketLine[]) => b.reduce((n, l) => n + l.qty, 0);
export const basketTotal = (b: BasketLine[]) => b.reduce((n, l) => n + l.qty * l.price, 0);

export function addToBasket(line: Omit<BasketLine, "key">) {
  const key = `${line.id}::${line.preparation}`;
  const existing = state.basket.find((l) => l.key === key);
  const basket = existing
    ? state.basket.map((l) => (l.key === key ? { ...l, qty: l.qty + line.qty } : l))
    : [...state.basket, { ...line, key }];
  setState({ basket });
}

export function setQty(key: string, qty: number) {
  setState({
    basket:
      qty <= 0
        ? state.basket.filter((l) => l.key !== key)
        : state.basket.map((l) => (l.key === key ? { ...l, qty } : l)),
  });
}
