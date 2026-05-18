import Link from "next/link";
import { BookOpen, FlaskConical } from "lucide-react";
import clsx from "clsx";

const buttonClass = clsx(
  "inline-flex items-center justify-center gap-2 rounded-3xl border border-blue-700 bg-blue-700 px-5 py-3",
  "text-sm font-semibold !text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 [&_*]:!text-white",
  "focus:outline-none focus:ring-4 focus:ring-blue-200",
);

export function CategoryButtons() {
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
      <a href="#sections" className={buttonClass}>
        <BookOpen className="size-4" />
        Зарубежная литература XIX века (к разделам)
      </a>
      <Link href="/science" className={buttonClass}>
        <FlaskConical className="size-4" />
        Научная часть
      </Link>
    </div>
  );
}
