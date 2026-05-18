import Link from "next/link";
import { Header } from "@/components/Header";
import { ReferenceList } from "@/components/ReferenceList";
import { support } from "@/lib/support";

export const metadata = {
  title: "Списки литературы | Глоссарий",
};

export default function LiteraturePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link className="text-sm font-semibold text-blue-700 transition hover:text-blue-900" href="/">
          Главная
        </Link>
        <section className="mt-7">
          <h1 className="text-4xl font-bold text-slate-950">{support.literature.title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Объединенный список источников и литературы из подготовленных Word-документов.
          </p>
        </section>
        <section className="mt-10">
          <ReferenceList document={support.literature} />
        </section>
      </main>
    </>
  );
}
