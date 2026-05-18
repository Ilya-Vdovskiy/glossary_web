import Link from "next/link";
import { Header } from "@/components/Header";
import { DocumentArticle } from "@/components/DocumentArticle";
import { support } from "@/lib/support";

export const metadata = {
  title: "Научная часть | Глоссарий",
};

export default function SciencePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <Link className="text-sm font-semibold text-blue-700 transition hover:text-blue-900" href="/">
          Главная
        </Link>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-7 shadow-sm md:p-10">
          <DocumentArticle document={support.science} />
        </div>
      </main>
    </>
  );
}
