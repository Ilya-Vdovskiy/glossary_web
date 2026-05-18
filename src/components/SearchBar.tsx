import { Search } from "lucide-react";
import clsx from "clsx";

type SearchBarProps = {
  initialValue?: string;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ initialValue = "", placeholder = "Введите термин...", className }: SearchBarProps) {
  return (
    <form action="/search" className={clsx("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      <input
        name="q"
        defaultValue={initialValue}
        placeholder={placeholder}
        className="w-full rounded-3xl border-2 border-slate-200 bg-white py-4 pl-14 pr-5 text-base text-slate-950 shadow-sm transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
      />
    </form>
  );
}
