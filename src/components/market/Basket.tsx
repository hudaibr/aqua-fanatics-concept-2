"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatPrice, productById } from "@/data/products";
import { basketCount, basketTotal, setQty, setState, useStore } from "@/lib/store";

export default function Basket() {
  const open = useStore((s) => s.basketOpen);
  const lines = useStore((s) => s.basket);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 bg-hall/55"
            onClick={() => useStoreClose()}
          />
          <motion.aside
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
            data-panel
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[24rem] flex-col border-l border-stock/25 bg-hall"
          >
            <header className="flex items-center justify-between px-7 pt-6">
              <span className="tracked-sm text-lamp">Your catch</span>
              <button
                onClick={() => setStateBasket(false)}
                className="tracked-sm text-stock/60 transition hover:text-stock"
              >
                Close ✕
              </button>
            </header>

            <div className="rule mx-7 mt-5" />

            <div className="thin-scroll flex-1 overflow-y-auto px-7">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col justify-center py-16">
                  <p className="font-display text-3xl italic leading-tight text-stock/45">
                    Nothing on the ice yet.
                  </p>
                  <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-stock/50">
                    Walk the hall and choose a fish — it will be added here with the
                    preparation you picked at the counter.
                  </p>
                </div>
              ) : (
                <ul>
                  {lines.map((l, i) => {
                    const p = productById(l.id);
                    return (
                      <motion.li
                        key={l.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="border-b border-stock/12 py-5"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <h4 className="text-[0.95rem] font-medium text-stock">{l.name}</h4>
                          <span className="tnum font-display text-lg font-bold text-lamp">
                            {formatPrice(l.price * l.qty)}
                          </span>
                        </div>
                        <p className="tracked-sm mt-2 text-stock/45">
                          {l.preparation} · {l.qty} {l.unit}
                        </p>
                        {p && (
                          <p className="mt-2 font-display text-[0.9rem] italic text-ice/60">
                            {p.freshness}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center border border-stock/25">
                            <button
                              onClick={() => setQty(l.key, l.qty - 1)}
                              className="h-7 w-7 text-stock/70 transition hover:bg-stock hover:text-hall"
                              aria-label="decrease"
                            >
                              –
                            </button>
                            <span className="tnum w-8 text-center text-xs text-stock">
                              {l.qty}
                            </span>
                            <button
                              onClick={() => setQty(l.key, l.qty + 1)}
                              className="h-7 w-7 text-stock/70 transition hover:bg-stock hover:text-hall"
                              aria-label="increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => setQty(l.key, 0)}
                            className="tracked-sm text-stock/40 transition hover:text-lamp"
                          >
                            Remove
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="border-t border-stock/20 px-7 py-6">
              <div className="flex items-baseline justify-between">
                <span className="tracked-sm text-stock/50">
                  Total · {basketCount(lines)} item{basketCount(lines) === 1 ? "" : "s"}
                </span>
                <span className="tnum font-display text-3xl font-bold text-stock">
                  {formatPrice(basketTotal(lines))}
                </span>
              </div>
              <p className="mt-2 text-[0.7rem] leading-relaxed text-stock/40">
                Prototype basket — no payment is taken. Delivery is arranged by hand.
              </p>
              <button
                className="btn-cta mt-5 w-full justify-center"
                onClick={() => setStateBasket(false)}
              >
                <span>Continue</span>
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


function setStateBasket(v: boolean) {
  setState({ basketOpen: v, selected: null });
}
function useStoreClose() {
  setState({ basketOpen: false });
}
