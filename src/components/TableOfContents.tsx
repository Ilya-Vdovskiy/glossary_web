import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { pluralRu } from "@/lib/plural";
import type { GlossarySection } from "@/types/glossary";

type TableOfContentsProps = {
  sections: GlossarySection[];
};

export function TableOfContents({ sections }: TableOfContentsProps) {
  return (
    <section id="sections" className="toc-modal fixed inset-0 z-50">
      <a aria-label="Закрыть оглавление" href="#" className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" />
      <div className="absolute left-1/2 top-24 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Разделы глоссария</h2>
            <p className="mt-1 text-sm text-slate-500">Выберите раздел, чтобы перейти к списку терминов.</p>
          </div>
          <a
            href="#"
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </a>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-4">
          <div className="space-y-2">
            {sections.map((section) => (
              <Link
                key={section.slug}
                href={`/section/${section.slug}`}
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition duration-200 hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <span>
                  <span className="block font-semibold text-slate-800 group-hover:text-blue-800">{section.title}</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    {section.terms.length} {pluralRu(section.terms.length, "термин", "термина", "терминов")}
                  </span>
                </span>
                <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
