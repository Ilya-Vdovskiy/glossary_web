import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SectionTermsList } from "@/components/SectionTermsList";
import { getSection, sections } from "@/lib/glossary";
import { pluralRu } from "@/lib/plural";

type SectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: SectionPageProps) {
  const { slug } = await params;
  const section = getSection(slug);
  return {
    title: section ? `${section.title} | Глоссарий` : "Раздел не найден",
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug } = await params;
  const section = getSection(slug);

  if (!section) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-9 flex items-center justify-between gap-4">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: section.title }]} />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <ArrowLeft className="size-4" />
            Назад
          </Link>
        </div>

        <section className="mb-10">
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <BookOpen className="size-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-950">{section.title}</h1>
              <p className="mt-3 text-slate-600">
                {section.terms.length} {pluralRu(section.terms.length, "термин", "термина", "терминов")} в разделе.
              </p>
            </div>
          </div>
          <div className="mt-7 max-w-2xl">
            <SearchBar placeholder="Поиск по всему глоссарию..." />
          </div>
        </section>

        {section.terms.length > 0 ? (
          <SectionTermsList section={section} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            В этом разделе пока нет терминов.
          </div>
        )}
      </main>
    </>
  );
}
