import { BookOpen } from "lucide-react";
import { CategoryButtons } from "@/components/CategoryButtons";
import { SearchBar } from "@/components/SearchBar";
import { TableOfContents } from "@/components/TableOfContents";
import { pluralRu } from "@/lib/plural";
import type { GlossaryData } from "@/types/glossary";

type HomeExperienceProps = {
  data: GlossaryData;
  stats: {
    sections: number;
    terms: number;
  };
};

export function HomeExperience({ data, stats }: HomeExperienceProps) {
  const sectionsLabel = pluralRu(stats.sections, "Раздел", "Раздела", "Разделов");
  const termsLabel = pluralRu(stats.terms, "Термин", "Термина", "Терминов");

  return (
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-16">
        <section className="text-center">
          <div className="mx-auto mb-7 grid size-20 place-items-center rounded-md bg-blue-50 text-blue-700">
            <BookOpen className="size-10" />
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">ДО-курс НовГУ</p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
            {data.courseTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Быстрый доступ к разделам, определениям, источникам и научным материалам проекта.
          </p>
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar />
          </div>
          <div className="mt-8">
            <CategoryButtons />
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-700">{stats.sections}</div>
            <div className="mt-2 font-semibold text-slate-950">{sectionsLabel}</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">От философии до произведений.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-700">{stats.terms}</div>
            <div className="mt-2 font-semibold text-slate-950">{termsLabel}</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">Каждая статья содержит источник.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-5xl font-bold text-blue-700">∞</div>
            <div className="mt-2 font-semibold text-slate-950">Знаний</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">Для студентов и преподавателей.</p>
          </div>
        </section>
      </main>
      <TableOfContents sections={data.sections} />
    </>
  );
}
