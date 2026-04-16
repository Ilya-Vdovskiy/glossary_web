import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GlossaryTerm } from "@/types/glossary";

export function TermCard({ term }: { term: GlossaryTerm }) {
  return (
    <Link
      href={`/term/${term.slug}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-950 transition group-hover:text-blue-800">
            {term.term}
          </h2>
          <p className="mt-3 line-clamp-3 leading-7 text-slate-600">{term.preview}</p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
      </div>
    </Link>
  );
}
