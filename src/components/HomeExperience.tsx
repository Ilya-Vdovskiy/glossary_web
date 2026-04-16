"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { CategoryButtons } from "@/components/CategoryButtons";
import { SearchBar } from "@/components/SearchBar";
import { TableOfContents } from "@/components/TableOfContents";
import type { GlossaryData } from "@/types/glossary";

type HomeExperienceProps = {
  data: GlossaryData;
  stats: {
    sections: number;
    terms: number;
  };
};

export function HomeExperience({ data, stats }: HomeExperienceProps) {
  const [isContentsOpen, setIsContentsOpen] = useState(false);

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-16">
        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <div className="mx-auto mb-7 grid size-20 place-items-center rounded-md bg-blue-50 text-blue-700">
            <BookOpen className="size-10" />
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">ДО-курс НовГУ</p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
            {data.courseTitle.replace(" (вторая половина)", "")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Быстрый доступ к разделам, определениям и поиску по учебному глоссарию.
          </p>
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar />
          </div>
          <div className="mt-8">
            <CategoryButtons onOpenContents={() => setIsContentsOpen(true)} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-700">{stats.sections}</div>
            <div className="mt-2 font-semibold text-slate-950">Разделов</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">От истории до философии.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-700">{stats.terms}</div>
            <div className="mt-2 font-semibold text-slate-950">Терминов</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">Данные из дистанционного курса</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-5xl font-bold text-blue-700">∞</div>
            <div className="mt-2 font-semibold text-slate-950">Знаний</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">Для студентов и преподавателей</p>
          </div>
        </motion.section>
      </main>
      <TableOfContents
        sections={data.sections}
        isOpen={isContentsOpen}
        onClose={() => setIsContentsOpen(false)}
      />
    </>
  );
}
