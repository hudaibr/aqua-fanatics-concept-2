"use client";

import { useCallback, useEffect, useRef } from "react";
import { STATIONS } from "@/lib/camera";
import { cam, getState, setState, useStore } from "@/lib/store";

/**
 * Station navigation: the rail, BACK and EXPLORE MARKET all resolve to a
 * progress value on the hall — never a page change.
 */
export function useMarketNavigation() {
  const station = useStore((s) => s.station);
  const phase = useStore((s) => s.phase);

  const goTo = useCallback((index: number) => {
    const i = Math.max(0, Math.min(STATIONS.length - 1, index));
    setState({ selected: null, basketOpen: false, railOpen: false });
    cam.lambda = 1.7;
    cam.target = STATIONS[i].t;
  }, []);

  const back = useCallback(() => goTo(Math.max(0, station - 1)), [goTo, station]);
  const forward = useCallback(() => goTo(Math.min(STATIONS.length - 1, station + 1)), [goTo, station]);

  /** Enter the hall from the threshold — the cinematic dolly. */
  const enter = useCallback(() => {
    if (getState().phase === "market") return;
    setState({ phase: "market" });
    // the threshold dolly is the signature move — give it room
    cam.lambda = 1.05;
    cam.target = STATIONS[1].t;
  }, []);

  return {
    station,
    stations: STATIONS,
    phase,
    goTo,
    back,
    forward,
    enter,
    atThreshold: station === 0,
    canBack: station > 0,
    canForward: station < STATIONS.length - 1,
  };
}

/**
 * Product interaction: hover label, click-to-examine with a camera push-in,
 * and the detail sheet. Esc and outside clicks both get you back out.
 */
export function useProductInteraction() {
  const selected = useStore((s) => s.selected);
  const hover = useStore((s) => s.hover);

  const close = useCallback(() => {
    cam.focusTarget = 0;
    setState({ selected: null });
  }, []);

  useEffect(() => {
    if (selected) cam.focusTarget = 1;
    else cam.focusTarget = 0;
  }, [selected]);

  return { selected, hover, close };
}

/** Keeps pointer focus values referenced from the 3D loop in sync. */
export function usePointerParallax() {
  const raf = useRef(0);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        cam.px = (e.clientX / window.innerWidth) * 2 - 1;
        cam.py = -((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);
}
