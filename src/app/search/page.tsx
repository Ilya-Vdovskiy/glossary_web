import Link from "next/link";
import { SearchX } from "lucide-react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { TermCard } from "@/components/TermCard";
import { searchTerms } from "@/lib/search";
import { terms } from "@/lib/glossary";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Поиск | Глоссарий",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = searchTerms(terms, query);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link className="text-sm font-semibold text-blue-700 transition hover:text-blue-900" href="/">
          Главная
        </Link>
        <section className="mt-7">
          <h1 className="text-4xl font-bold text-slate-950">Поиск</h1>
          <p className="mt-3 text-slate-600">
            Поиск работает по названию термина, определению, источнику и названию раздела.
          </p>
          <div className="mt-7 max-w-2xl">
            <SearchBar initialValue={query} />
          </div>
        </section>

        <section className="mt-10">
          {query ? (
            <p className="mb-5 text-sm font-semibold text-slate-500">
              {results.length > 0 ? `Найдено: ${results.length}` : `По запросу «${query}» ничего не найдено.`}
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((term) => (
                <TermCard key={term.slug} term={term} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
              <SearchX className="mx-auto size-10 text-slate-300" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                {query ? "Нет результатов" : "Введите поисковый запрос"}
              </h2>
              <p className="mx-auto mt-2 max-w-md leading-7 text-slate-500">
                Попробуйте другое написание, более короткую фразу или название раздела.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
