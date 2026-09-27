"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice, productById, type PreparationOption } from "@/data/products";
import { addToBasket, useStore } from "@/lib/store";
import { useProductInteraction } from "@/hooks/useMarketNavigation";

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 + i * 0.045, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] as const },
  }),
};

const drawLine = {
  hidden: { scaleX: 0 },
  show: (i: number) => ({
    scaleX: 1,
    transition: { delay: 0.05 + i * 0.045, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as const },
  }),
};

export default function ProductDetail() {
  const { selected, close } = useProductInteraction();
  const product = productById(selected);
  const basket = useStore((s) => s.basket);
  const [prep, setPrep] = useState<PreparationOption>("Whole");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setPrep(product.preparationOptions[0]);
      setQty(1);
      setAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <AnimatePresence>
      {product && (
        <motion.aside
          key={product.id}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed top-0 right-0 z-40 flex h-full w-full max-w-[26rem] flex-col border-l border-stock/25 bg-hall/92 backdrop-blur-md"
          data-panel
            aria-label={`${product.name} details`}
        >
          <header className="flex items-center justify-between px-7 pt-6">
            <span className="tracked-sm text-lamp">{product.category}</span>
            <button
              onClick={close}
              className="tracked-sm text-stock/60 transition hover:text-stock"
            >
              Close ✕
            </button>
          </header>

          <div className="thin-scroll flex-1 overflow-y-auto px-7 pb-8 pt-7">
            <motion.div
              custom={0}
              variants={drawLine}
              initial="hidden"
              animate="show"
              className="rule origin-left"
            />

            <motion.h2
              custom={1}
              variants={rise}
              initial="hidden"
              animate="show"
              className="display mt-6 text-[clamp(2.6rem,6vw,3.6rem)] text-stock"
            >
              {product.name}
            </motion.h2>

            <motion.p
              custom={2}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-2 font-display text-lg italic text-ice/70"
            >
              {product.tagline} · {product.freshness}
            </motion.p>

            <motion.div
              custom={3}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-6 flex items-baseline gap-2"
            >
              <span className="tnum font-display text-4xl font-bold text-lamp">
                {formatPrice(product.price)}
              </span>
              <span className="tracked-sm text-stock/55">/ {product.unit}</span>
            </motion.div>

            <motion.div
              custom={4}
              variants={drawLine}
              initial="hidden"
              animate="show"
              className="rule mt-6 origin-left"
            />

            <dl className="mt-5 grid grid-cols-[7.5rem_1fr] gap-y-3">
              {[
                ["Origin", product.origin],
                ["Weight", product.weight],
                ["Station", product.category],
              ].map(([k, v], i) => (
                <motion.div
                  key={k}
                  custom={5 + i}
                  variants={rise}
                  initial="hidden"
                  animate="show"
                  className="contents"
                >
                  <dt className="tracked-sm pt-1 text-stock/45">{k}</dt>
                  <dd className="text-[0.8125rem] leading-relaxed text-stock/85">{v}</dd>
                </motion.div>
              ))}
            </dl>

            <motion.p
              custom={8}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-[38ch] text-[0.875rem] leading-[1.75] text-stock/70"
            >
              {product.description}
            </motion.p>

            <motion.p
              custom={9}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-5 border-l border-lamp/60 pl-4 font-display text-[1.05rem] italic leading-snug text-ice"
            >
              {product.tastingNote}
            </motion.p>

            <motion.div
              custom={10}
              variants={drawLine}
              initial="hidden"
              animate="show"
              className="rule mt-8 origin-left"
            />

            <motion.p custom={11} variants={rise} initial="hidden" animate="show" className="tracked mt-6 text-stock/55">
              Choose preparation
            </motion.p>

            <div className="mt-4">
              {product.preparationOptions.map((o, i) => {
                const active = prep === o;
                return (
                  <motion.button
                    key={o}
                    custom={12 + i}
                    variants={rise}
                    initial="hidden"
                    animate="show"
                    onClick={() => setPrep(o)}
                    className="group flex w-full items-center justify-between border-b border-stock/12 py-3 text-left transition"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full border transition ${
                          active
                            ? "border-lamp bg-lamp"
                            : "border-stock/40 group-hover:border-stock"
                        }`}
                      />
                      <span
                        className={`text-[0.9rem] transition ${
                          active ? "text-stock" : "text-stock/65 group-hover:text-stock"
                        }`}
                      >
                        {o}
                      </span>
                    </span>
                    <span className="tracked-sm text-stock/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              custom={16}
              variants={rise}
              initial="hidden"
              animate="show"
              className="mt-7 flex items-center gap-5"
            >
              <span className="tracked-sm text-stock/45">Qty</span>
              <div className="flex items-center border border-stock/25">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 text-stock/70 transition hover:bg-stock hover:text-hall"
                  aria-label="decrease"
                >
                  –
                </button>
                <span className="tnum w-10 text-center text-sm text-stock">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="h-9 w-9 text-stock/70 transition hover:bg-stock hover:text-hall"
                  aria-label="increase"
                >
                  +
                </button>
              </div>
            </motion.div>
          </div>

          <footer className="border-t border-stock/20 px-7 py-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="tracked-sm text-stock/45">Line total</span>
              <span className="tnum font-display text-xl font-bold text-stock">
                {formatPrice(product.price * qty)}
              </span>
            </div>
            <button
              className="btn-cta w-full justify-center"
              data-accent={added ? "true" : "false"}
              onClick={() => {
                addToBasket({
                  id: product.id,
                  name: product.name,
                  preparation: prep,
                  qty,
                  price: product.price,
                  unit: product.unit,
                });
                setAdded(true);
              }}
            >
              <span>{added ? "✓ Added to basket" : "Add to basket"}</span>
            </button>
            <div className="mt-3 flex items-center justify-between">
              <span className="tracked-sm text-stock/35">
                {basket.length} line{basket.length === 1 ? "" : "s"} in your catch
              </span>
              <button onClick={close} className="tracked-sm text-stock/60 hover:text-lamp">
                ← Back to the market
              </button>
            </div>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
