import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Breadcrumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Навигация">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="size-4 text-slate-300" /> : null}
          {item.href ? (
            <Link className="transition hover:text-blue-700" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
