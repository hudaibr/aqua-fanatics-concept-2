"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@react-three/drei";
import { useMarketNavigation } from "@/hooks/useMarketNavigation";
import { useStore } from "@/lib/store";

const ease = [0.2, 0.7, 0.2, 1] as const;

export default function LoadingScreen() {
  const { progress, total, active } = useProgress();
  const [elapsed, setElapsed] = useState(false);
  const [forced, setForced] = useState(false);
  const { phase, enter } = useMarketNavigation();
  const sceneReady = useStore((s) => s.ready);

  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), 1500);
    const failSafe = setTimeout(() => setForced(true), 12000);
    return () => {
      clearTimeout(t);
      clearTimeout(failSafe);
    };
  }, []);

  const pct = total > 0 ? Math.min(100, Math.round(progress)) : elapsed ? 100 : 0;
  const ready = pct >= 100 || forced || (sceneReady && !active && elapsed);
  const leaving = phase === "market";

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="gate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 1.1, ease }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-hall"
        >
          {/* atmosphere plate — fades up only once the scene is resident */}
          <motion.img
            src="textures/poster.jpg"
            alt=""
            aria-hidden
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: ready ? 0.34 : 0, scale: 1 }}
            transition={{ duration: 2.2, ease }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              maskImage:
                "radial-gradient(120% 90% at 70% 55%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 78%)",
              WebkitMaskImage:
                "radial-gradient(120% 90% at 70% 55%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 78%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-hall via-hall/40 to-hall/85" />

          <div className="relative flex w-full max-w-4xl flex-col items-center px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="tracked-sm text-lamp"
            >
              Fresh from the sea
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1, ease }}
              className="display mt-6 text-[clamp(2.6rem,9vw,7rem)] text-stock"
            >
              THE MORNING
              <br />
              <span className="italic font-normal text-ice">CATCH</span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease }}
              className="mt-9 h-px w-full max-w-md origin-center bg-stock/25"
            />

            {/* progress */}
            <div className="mt-8 w-full max-w-md">
              <div className="flex items-baseline justify-between">
                <span className="tracked-sm text-stock/50">
                  {ready ? "The market is open" : "Preparing today’s market…"}
                </span>
                <span className="tnum tracked-sm text-stock/50">{pct}%</span>
              </div>
              <div className="mt-3 h-[3px] w-full bg-stock/12">
                <motion.div
                  className="h-full bg-lamp"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease }}
                />
              </div>
            </div>

            <AnimatePresence>
              {ready && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease }}
                  className="mt-11 flex flex-col items-center"
                >
                  <p className="font-display text-[clamp(1rem,2.2vw,1.35rem)] italic leading-relaxed text-ice/80">
                    Fresh from the sea.
                    <br />
                    Prepared for your table.
                  </p>

                  <button onClick={enter} className="btn-cta mt-9" data-accent="true">
                    <span>Enter the market</span>
                    <span aria-hidden>→</span>
                  </button>

                  <p className="tracked-sm mt-7 text-stock/35">
                    Scroll · drag · or use the rail on the left
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-7 left-0 right-0 flex items-center justify-between px-6">
            <span className="tracked-sm text-stock/30">Est. 1974 · Hall No. 3</span>
            <span className="tracked-sm text-stock/30">
              {active ? "Loading the ice" : "Warming the lamps"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
