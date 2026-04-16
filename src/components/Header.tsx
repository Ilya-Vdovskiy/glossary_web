import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-4 focus:ring-blue-100">
          <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-blue-700">
            <BookOpen className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">Глоссарий НовГУ</span>
            <span className="block text-xs text-slate-500">Зарубежная литература XIX века</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
