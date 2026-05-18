import type { RichDocument } from "@/types/content";

export function DocumentArticle({ document }: { document: RichDocument }) {
  return (
    <article className="space-y-7">
      {document.blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1 key={`${block.text}-${index}`} className="text-balance text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
                {block.text}
              </h1>
            );
          }

          if (block.level === 2) {
            return (
              <h2 key={`${block.text}-${index}`} className="pt-4 text-2xl font-bold text-slate-950">
                {block.text}
              </h2>
            );
          }

          return (
            <h3 key={`${block.text}-${index}`} className="pt-2 text-xl font-semibold text-blue-800">
              {block.text}
            </h3>
          );
        }

        if (block.type === "listItem") {
          return (
            <div key={`${block.text}-${index}`} className="rounded-md border border-slate-200 bg-white p-5 leading-7 text-slate-700 shadow-sm">
              {block.text}
            </div>
          );
        }

        return (
          <p key={`${block.text}-${index}`} className="text-lg leading-9 text-slate-700">
            {block.text}
          </p>
        );
      })}
    </article>
  );
}
