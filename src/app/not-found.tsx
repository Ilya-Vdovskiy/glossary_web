import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="text-4xl font-bold text-slate-950">Страница не найдена</h1>
        <p className="mt-3 text-slate-600">Такого раздела или термина нет в текущем глоссарии.</p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-md bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
