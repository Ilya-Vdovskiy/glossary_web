import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookMarked } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Header } from "@/components/Header";
import { getTerm, terms } from "@/lib/glossary";

type TermPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return terms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: TermPageProps) {
  const { slug } = await params;
  const term = getTerm(slug);
  return {
    title: term ? `${term.term} | Глоссарий` : "Термин не найден",
  };
}

export default async function TermPage({ params }: TermPageProps) {
  const { slug } = await params;
  const term = getTerm(slug);

  if (!term) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-9 flex items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: term.sectionTitle, href: `/section/${term.sectionSlug}` },
              { label: term.term },
            ]}
          />
          <Link
            href={`/section/${term.sectionSlug}`}
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <ArrowLeft className="size-4" />
            К разделу
          </Link>
        </div>

        <article>
          <div className="mb-9 flex items-start gap-5">
            <div className="grid size-16 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">
              <BookMarked className="size-8" />
            </div>
            <div>
              <p className="mb-3 inline-flex rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                {term.sectionTitle}
              </p>
              <h1 className="text-balance text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
                {term.term}
              </h1>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
            <p className="whitespace-pre-line text-lg leading-9 text-slate-800">{term.definition}</p>
            {term.source ? (
              <aside className="mt-8 border-t border-slate-200 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Источник</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{term.source}</p>
              </aside>
            ) : null}
          </div>
        </article>
      </main>
    </>
  );
}
