"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STATIONS } from "@/lib/camera";
import { basketCount, cam, setState, useStore } from "@/lib/store";
import { useMarketNavigation } from "@/hooks/useMarketNavigation";

const ease = [0.2, 0.7, 0.2, 1] as const;

const EDITORIAL: Record<string, { head: [string, string]; copy: string; cue?: string }> = {
  fish: {
    head: ["LAID ON ICE", "BEFORE SIX"],
    copy: "Five fish, chosen by hand at the counter while the ice is still dry.",
    cue: "Move over a fish to name it — click to examine",
  },
  prawns: {
    head: ["SHELL-ON,", "NEVER FROZEN"],
    copy: "King prawns and tiger shrimp, graded by the count, kept cold and dry.",
    cue: "Click a prawn to examine it",
  },
  shellfish: {
    head: ["HELD LIVE", "UNTIL YOU ASK"],
    copy: "Mussels, oysters and crab — purged overnight, resting on crushed ice.",
    cue: "Click a shell to examine it",
  },
  premium: {
    head: ["THE END", "OF THE HALL"],
    copy: "Lobster and seer fish, reserved before they ever reach the ice.",
    cue: "Click a piece to examine it",
  },
  preparation: {
    head: ["CLEANED", "YOUR WAY"],
    copy: "Whole, cleaned, curry cut or fillet — cut on the board, never behind a screen.",
  },
};

const STEPS = ["Caught", "Selected", "Prepared", "Packed", "Delivered"];
const stepForStation = (i: number) => (i === 0 ? 0 : i <= 3 ? 1 : i === 4 ? 2 : i === 5 ? 3 : 4);

/* ---------------------------------------------------------------- */

function Gauge({ station }: { station: number }) {
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id = 0;
    const tick = () => {
      if (fill.current) fill.current.style.transform = `scaleY(${Math.max(0.002, cam.t)})`;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-30 hidden h-full w-8 lg:block">
      <div className="absolute top-0 left-3 h-full w-[2px] bg-stock/12" />
      <div
        ref={fill}
        className="absolute top-0 left-3 h-full w-[2px] origin-top bg-lamp"
        style={{ transform: "scaleY(0)" }}
      />
      {STATIONS.map((s) => (
        <div
          key={s.id}
          className="absolute left-3 h-[1px] bg-stock/35"
          style={{ top: `${s.t * 100}%`, width: s.index === station ? 20 : 10 }}
        />
      ))}
      <span
        className="tracked-sm absolute left-6 origin-left text-stock/35"
        style={{ top: "0.6rem" }}
      >
        Entrance
      </span>
      <span className="tracked-sm absolute bottom-6 left-6 origin-left text-stock/35">
        The door
      </span>
    </div>
  );
}

function TopBar() {
  const basket = useStore((s) => s.basket);
  const basketOpen = useStore((s) => s.basketOpen);
  const count = basketCount(basket);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between px-5 pt-5 lg:px-8 lg:pt-6">
      <div className="pointer-events-auto">
        <p className="tracked text-[0.5rem] text-stock sm:text-[0.625rem]">The Morning Catch</p>
        <div className="mt-2 h-px w-32 bg-stock/25 lg:w-44" />
        <p className="tracked-sm mt-2 hidden text-[0.5rem] text-stock/40 sm:block">
          Fresh fish · Shellfish · Premium
        </p>
      </div>

      <button
        onClick={() => setState({ basketOpen: !basketOpen, selected: null })}
        className="group pointer-events-auto flex items-center gap-3 border border-stock/30 px-4 py-3 transition hover:border-stock hover:bg-stock hover:text-hall"
      >
        <span className="tracked">Basket</span>
        <span className="tnum tracked-sm flex h-5 min-w-5 items-center justify-center border border-current px-1 text-lamp transition group-hover:text-hall">
          {count}
        </span>
      </button>
    </header>
  );
}

function StoryBand({ station }: { station: number }) {
  const step = stepForStation(station);
  const s = STATIONS[station];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 border-t border-stock/15 bg-hall/70 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 px-5 py-3 lg:px-8">
        <ol className="flex items-center gap-3 overflow-hidden sm:gap-5">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3 sm:gap-5">
              <span
                className={`tracked-sm whitespace-nowrap transition-colors duration-500 ${
                  i === step ? "text-lamp" : i < step ? "text-stock/55" : "text-stock/25"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`hidden h-px w-4 transition-colors duration-500 sm:block ${
                    i < step ? "bg-stock/45" : "bg-stock/15"
                  }`}
                />
              )}
            </li>
          ))}
        </ol>
        <p className="hidden text-right font-display text-[0.9rem] italic text-ice/60 md:block">
          {s.storyNote}
        </p>
      </div>
    </div>
  );
}

function ThresholdHero() {
  const { forward } = useMarketNavigation();
  return (
    <motion.section
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.8, ease }}
      className="pointer-events-none fixed top-1/2 left-5 z-20 w-[min(30rem,80vw)] -translate-y-1/2 lg:left-16"
    >
      <div className="scrim pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10" />
      <p className="tracked text-lamp">Hall No. 3 · 06:10</p>
      <h2 className="display mt-5 text-[clamp(2.4rem,7vw,5.2rem)] text-stock">
        THE MORNING
        <br />
        <span className="font-normal italic text-ice">catch</span>
      </h2>
      <div className="rule mt-7 max-w-xs" />
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-stock/70">
        Fresh from the sea. Prepared for your table. Walk the hall, look at the ice,
        and take what you want home.
      </p>
      <button onClick={forward} className="btn-cta pointer-events-auto mt-8" data-accent="true">
        <span>Explore market</span>
        <span aria-hidden>→</span>
      </button>
    </motion.section>
  );
}

function StationEditorial({ station }: { station: number }) {
  const s = STATIONS[station];
  const e = EDITORIAL[s.id];
  if (!e) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={s.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.6, ease }}
        className="pointer-events-none fixed top-20 left-5 z-20 w-[min(26rem,78vw)] lg:left-16"
      >
        <div className="scrim pointer-events-none absolute -inset-x-14 -inset-y-8 -z-10" />
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-lamp" />
          <span className="tracked-sm text-lamp">{s.eyebrow}</span>
        </div>
        <h3 className="display mt-4 text-[clamp(1.9rem,4.4vw,3.1rem)] text-stock">
          {e.head[0]}
          <br />
          {e.head[1]}
        </h3>
        <div className="rule mt-5 max-w-[16rem]" />
        <p className="mt-4 max-w-[30ch] text-[0.8125rem] leading-relaxed text-stock/65 [@media(max-height:740px)]:hidden">
          {e.copy}
        </p>
        {e.cue && (
          <p className="tracked-sm mt-5 flex items-center gap-2 text-stock/40 [@media(max-height:740px)]:hidden">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-lamp" />
            {e.cue}
          </p>
        )}
      </motion.section>
    </AnimatePresence>
  );
}

function FinalSection() {
  const { goTo } = useMarketNavigation();
  return (
    <motion.section
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease }}
      className="pointer-events-none fixed inset-x-0 top-1/2 z-20 px-5 lg:px-16"
    >
      <div className="scrim pointer-events-none absolute -inset-x-5 top-[-4rem] bottom-[-4rem] -z-10" />
      <div className="-translate-y-1/2">
        <p className="tracked text-lamp">From the sea to your table</p>
        <h2 className="display mt-6 text-[clamp(2.4rem,7.5vw,6rem)] text-stock">
          FROM OUR MARKET
          <br />
          <span className="font-normal italic text-ice">to your table.</span>
        </h2>
        <div className="rule mt-8 max-w-lg" />
        <p className="mt-6 max-w-md text-sm leading-relaxed text-stock/70">
          Freshly selected. Carefully prepared. Delivered to your door — inside three
          hours of the ice it was chosen from.
        </p>
        <div className="pointer-events-auto mt-9 flex flex-wrap items-center gap-6">
          <button className="btn-cta" data-accent="true" onClick={() => goTo(1)}>
            <span>Shop today’s catch</span>
            <span aria-hidden>→</span>
          </button>
          <a
            href="mailto:hall@themorningcatch.co?subject=Today%27s%20catch"
            className="tracked link-underline text-stock/75 hover:text-stock"
          >
            Contact us
          </a>
        </div>
      </div>
    </motion.section>
  );
}

function ScrollCue({ station }: { station: number }) {
  if (station >= STATIONS.length - 1) return null;
  return (
    <div className="pointer-events-none fixed right-5 bottom-20 z-20 hidden flex-col items-end gap-2 lg:right-8 lg:flex">
      <span className="tracked-sm text-stock/40">
        Scroll to walk the hall
      </span>
      <span className="scroll-cue text-lamp" aria-hidden>
        ↓
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export default function Hud() {
  const { station, phase } = useMarketNavigation();

  if (phase !== "market") return null;

  return (
    <>
      <TopBar />
      <Gauge station={station} />
      <AnimatePresence mode="wait">
        {station === 0 && <ThresholdHero key="hero" />}
        {station >= 1 && station <= 5 && (
          <StationEditorial key={`ed-${station}`} station={station} />
        )}
        {station === 6 && <FinalSection key="final" />}
      </AnimatePresence>
      <StoryBand station={station} />
      <ScrollCue station={station} />
    </>
  );
}
