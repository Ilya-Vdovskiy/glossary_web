const cyrillicMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function slugify(value: string): string {
  const transliterated = value
    .toLowerCase()
    .split("")
    .map((char) => cyrillicMap[char] ?? char)
    .join("");

  return (
    transliterated
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/["'«»„“”]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "item"
  );
}

export function uniqueSlug(base: string, used: Set<string>): string {
  const root = slugify(base);
  let candidate = root;
  let index = 2;

  while (used.has(candidate)) {
    candidate = `${root}-${index}`;
    index += 1;
  }

  used.add(candidate);
  return candidate;
}
