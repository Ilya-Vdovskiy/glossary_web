"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import type { GlossarySection } from "@/types/glossary";

const literaryParentSlug = "literaturovedenie";
const literarySubsectionSlugs = [
  "teoriya",
  "personalii",
  "proizvedeniya",
  "personazhi-proizvedeniy",
];

type TableOfContentsProps = {
  sections: GlossarySection[];
  isOpen: boolean;
  onClose: () => void;
};

export function TableOfContents({ sections, isOpen, onClose }: TableOfContentsProps) {
  const [openSectionSlug, setOpenSectionSlug] = useState<string | null>(null);
  const sectionsBySlug = new Map(sections.map((section) => [section.slug, section]));
  const visibleSections = sections.filter((section) => !literarySubsectionSlugs.includes(section.slug));

  function getChildren(section: GlossarySection) {
    if (section.slug !== literaryParentSlug) {
      return [];
    }

    return literarySubsectionSlugs
      .map((slug) => sectionsBySlug.get(slug))
      .filter((child): child is GlossarySection => Boolean(child));
  }

  function getTermsCount(section: GlossarySection) {
    const children = getChildren(section);

    if (children.length === 0) {
      return section.terms.length;
    }

    return children.reduce((sum, child) => sum + child.terms.length, section.terms.length);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            aria-label="Закрыть оглавление"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.section
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Разделы глоссария</h2>
                <p className="mt-1 text-sm text-slate-500">Выберите раздел или раскройте подразделы.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                aria-label="Закрыть"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {visibleSections.map((section, index) => {
                  const children = getChildren(section);
                  const isExpanded = openSectionSlug === section.slug;

                  return (
                    <motion.div
                      key={section.slug}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      {children.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setOpenSectionSlug(isExpanded ? null : section.slug)}
                          className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-left transition duration-200 hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                          <span>
                            <span className="block font-semibold text-slate-800 group-hover:text-blue-800">
                              {section.title}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                              {getTermsCount(section)} терминов во всех подразделах
                            </span>
                          </span>
                          <ChevronRight
                            className={`size-5 text-slate-400 transition group-hover:text-blue-700 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          href={`/section/${section.slug}`}
                          onClick={onClose}
                          className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition duration-200 hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                          <span>
                            <span className="block font-semibold text-slate-800 group-hover:text-blue-800">
                              {section.title}
                            </span>
                            <span className="mt-1 block text-sm text-slate-500">
                              {getTermsCount(section)} терминов
                            </span>
                          </span>
                          <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                        </Link>
                      )}

                      <AnimatePresence>
                        {isExpanded ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-5 mt-2 space-y-2 overflow-hidden border-l border-blue-100 pl-4"
                          >
                            {children.map((child) => (
                              <Link
                                key={child.slug}
                                href={`/section/${child.slug}`}
                                onClick={onClose}
                                className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-3 transition duration-200 hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                              >
                                <span>
                                  <span className="block font-semibold text-slate-800 group-hover:text-blue-800">
                                    {child.title}
                                  </span>
                                  <span className="mt-1 block text-sm text-slate-500">
                                    {child.terms.length} терминов
                                  </span>
                                </span>
                                <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                              </Link>
                            ))}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
