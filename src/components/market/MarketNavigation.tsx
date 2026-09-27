"use client";

import { motion } from "framer-motion";
import { STATIONS } from "@/lib/camera";
import { useMarketNavigation } from "@/hooks/useMarketNavigation";

const ease = [0.2, 0.7, 0.2, 1] as const;

export default function MarketNavigation() {
  const { station, goTo, back, forward, canBack } = useMarketNavigation();
  const items = STATIONS.slice(1, 6);

  return (
    <>
      {/* ---------- desktop: vertical rail hanging off a hairline ---------- */}
      <motion.nav
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease }}
        className="fixed left-10 bottom-20 z-30 hidden w-[13.5rem] lg:block"
        aria-label="Market sections"
      >
        <div className="flex items-baseline justify-between">
          <span className="tracked text-stock/45">Market</span>
          <span className="tracked-sm tnum text-stock/30">05 counters</span>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
          className="rule mt-3 origin-left"
        />

        <ul className="mt-1">
          {items.map((s, i) => {
            const active = station === s.index;
            return (
              <li key={s.id}>
                <button
                  onClick={() => goTo(s.index)}
                  aria-current={active ? "true" : undefined}
                  className="group flex w-full items-center gap-3 border-b border-stock/10 py-[0.58rem] text-left"
                >
                  <span
                    className={`tnum tracked-sm w-4 transition-colors ${
                      active ? "text-lamp" : "text-stock/30 group-hover:text-stock/60"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`tracked truncate transition-colors ${
                      active ? "text-stock" : "text-stock/55 group-hover:text-stock"
                    }`}
                  >
                    {s.label}
                  </span>
                  <motion.span
                    layoutId="rail-marker"
                    className="ml-auto h-[1px] w-6 bg-lamp"
                    transition={{ duration: 0.4, ease }}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center gap-6">
          <button
            onClick={back}
            disabled={!canBack}
            className="tracked link-underline text-stock/70 transition hover:text-stock disabled:opacity-25 disabled:hover:text-stock/70"
          >
            ← Back
          </button>
          <button
            onClick={forward}
            className="tracked link-underline text-lamp transition hover:text-stock"
          >
            Explore market
          </button>
        </div>
      </motion.nav>

      {/* ---------- mobile / tablet: horizontal chip row ---------- */}
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease }}
        className="fixed inset-x-0 bottom-[3.25rem] z-30 lg:hidden"
        aria-label="Market sections"
      >
        <div className="thin-scroll flex gap-1 overflow-x-auto px-3 pb-1">
          <button
            onClick={back}
            disabled={!canBack}
            className="tracked shrink-0 border border-stock/25 px-3 py-2.5 text-stock/70 disabled:opacity-25"
          >
            ← Back
          </button>
          {items.map((s, i) => {
            const active = station === s.index;
            return (
              <button
                key={s.id}
                onClick={() => goTo(s.index)}
                className={`tracked shrink-0 border px-3 py-2.5 transition ${
                  active
                    ? "border-lamp text-lamp"
                    : "border-stock/20 text-stock/55"
                }`}
              >
                <span className="tnum mr-2 opacity-50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
              </button>
            );
          })}
          <button
            onClick={forward}
            className="tracked shrink-0 border border-lamp/70 px-3 py-2.5 text-lamp"
          >
            Explore →
          </button>
        </div>
      </motion.nav>
    </>
  );
}
