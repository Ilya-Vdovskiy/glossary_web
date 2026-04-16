"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import clsx from "clsx";

type CategoryButtonsProps = {
  onOpenContents: () => void;
};

export function CategoryButtons({ onOpenContents }: CategoryButtonsProps) {
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
      >
        <Lock className="size-4" />
        Зарубежная литература XIX века (первая половина)
      </button>
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenContents}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-3xl border border-blue-700 bg-blue-700 px-5 py-3",
          "text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800",
          "focus:outline-none focus:ring-4 focus:ring-blue-200",
        )}
      >
        <Sparkles className="size-4" />
        Зарубежная литература XIX века (вторая половина)
      </motion.button>
    </div>
  );
}
