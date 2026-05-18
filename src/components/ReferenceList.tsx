import type { ReferenceDocument } from "@/types/content";

export function ReferenceList({ document }: { document: ReferenceDocument }) {
  return (
    <div className="space-y-10">
      {document.sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
          <ol className="mt-5 space-y-3">
            {section.items.map((item, index) => (
              <li key={`${section.title}-${index}`} className="rounded-md border border-slate-200 bg-white p-5 leading-7 text-slate-700 shadow-sm">
                {item}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
