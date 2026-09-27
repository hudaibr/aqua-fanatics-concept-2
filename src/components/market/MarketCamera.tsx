"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STATIONS, damp, samplePath, stationForProgress } from "@/lib/camera";
import { cam, getState, setState } from "@/lib/store";

const pathPos = new THREE.Vector3();
const pathTgt = new THREE.Vector3();
const focusPos = new THREE.Vector3();
const focusTgt = new THREE.Vector3();
const look = new THREE.Vector3();

/** Once the dolly is this close to a keyframe the station counts as "arrived". */
const SETTLE = 0.05;

/**
 * The whole navigation model lives here: a slow, heavy dolly along the hall,
 * a blended push-in when a product is being examined, and a small amount of
 * pointer parallax so the space always feels inhabited.
 */
export default function MarketCamera() {
  const { camera, size } = useThree();
  const lastStation = useRef(-1);

  // narrower halls read better with a slightly wider lens on small screens
  useEffect(() => {
    const cam3 = camera as THREE.PerspectiveCamera;
    const base = size.width < 700 ? 62 : size.width < 1100 ? 50 : 42;
    cam3.fov = base;
    cam3.near = 0.08;
    cam3.far = 140;
    cam3.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);

    // scroll / nav → slow, damped progress
    cam.t = damp(cam.t, cam.target, cam.lambda, dt);
    if (Math.abs(cam.t - cam.target) < 0.0004) cam.t = cam.target;

    const { position, target } = samplePath(cam.t);
    pathPos.set(position[0], position[1], position[2]);
    pathTgt.set(target[0], target[1], target[2]);

    // product focus blend — a slower push so it reads as an inspection
    cam.focus = damp(cam.focus, cam.focusTarget, 2.8, dt);
    focusPos.set(cam.fx + (cam.fx < 0 ? 1.35 : -1.35), cam.fy + 0.75, cam.fz + 0.85);
    focusTgt.set(cam.fx, cam.fy, cam.fz);

    const k = cam.focus;
    camera.position.lerpVectors(pathPos, focusPos, k);

    // pointer parallax (very small — this is a dolly, not a gimbal)
    const px = cam.px * (1 - k);
    const py = cam.py * (1 - k);
    camera.position.x += px * 0.14;
    camera.position.y += py * 0.08;

    look.lerpVectors(pathTgt, focusTgt, k);
    look.x += px * 0.16;
    look.y += py * 0.1;
    camera.lookAt(look);

    // Only swap the editorial once the dolly has actually arrived — the HUD
    // never runs ahead of what you are looking at.
    const st = stationForProgress(cam.t);
    const settled = Math.abs(cam.t - STATIONS[st].t) <= SETTLE;
    if (settled && st !== lastStation.current) {
      lastStation.current = st;
      setState({ station: st });
    }
  });

  return null;
}

/** Window-level scroll / keys / touch → discrete steps between counters. */
export function useScrollDriver(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let touchY: number | null = null;
    /** accumulated input, cashed in for one whole station move */
    let pending = 0;
    const TRIGGER = 0.45;
    const MAX_PENDING = TRIGGER * 2.5;

    const advance = (dir: number) => {
      const cur = stationForProgress(cam.target);
      const next = Math.max(0, Math.min(STATIONS.length - 1, cur + dir));
      if (next === cur) return;
      cam.lambda = 1.7;
      cam.target = STATIONS[next].t;
    };

    /** one gesture may cover more than one counter, but never a blur of them */
    const spend = () => {
      let guard = 0;
      while (Math.abs(pending) >= TRIGGER && guard < 3) {
        advance(pending > 0 ? 1 : -1);
        pending -= Math.sign(pending) * TRIGGER;
        guard++;
      }
    };

    const inPanel = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("[data-panel]");

    const onWheel = (e: WheelEvent) => {
      if (getState().selected || inPanel(e.target)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 34 : e.deltaMode === 2 ? 400 : 1;
      const d = e.deltaY * unit * 0.0016;
      pending = Math.max(-MAX_PENDING, Math.min(MAX_PENDING, pending + d));
      spend();
    };

    const onKey = (e: KeyboardEvent) => {
      if (getState().selected) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "ArrowRight" || e.key === " ") {
        pending = 0;
        advance(1);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
        pending = 0;
        advance(-1);
        e.preventDefault();
      } else if (e.key === "Escape") {
        setState({ selected: null, basketOpen: false, railOpen: false });
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
      pending = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (getState().selected || inPanel(e.target)) return;
      if (touchY == null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      const dy = touchY - y;
      touchY = y;
      pending = Math.max(-MAX_PENDING, Math.min(MAX_PENDING, pending + dy * 0.0022));
      spend();
    };

    const onPointer = (e: PointerEvent) => {
      cam.px = (e.clientX / window.innerWidth) * 2 - 1;
      cam.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const prevent = (e: Event) => e.preventDefault();

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("gesturestart", prevent);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("gesturestart", prevent);
    };
  }, [enabled]);
}

export { STATIONS };
