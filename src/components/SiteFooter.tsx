import Link from "next/link";

const footerLinks = [
  { href: "/gosts", label: "ГОСТы" },
  { href: "/literature", label: "Списки литературы" },
  { href: "/review", label: "Рецензия" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>Материалы проекта по зарубежной литературе XIX века</p>
        <nav className="flex flex-wrap gap-3 sm:justify-end" aria-label="Дополнительные материалы">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1 font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
