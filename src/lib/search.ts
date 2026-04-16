import type { GlossaryTerm } from "@/types/glossary";

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchTerms(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return terms
    .map((term) => {
      const title = normalizeSearchText(term.term);
      const definition = normalizeSearchText(term.definition);
      const section = normalizeSearchText(term.sectionTitle);
      const haystack = `${title} ${definition} ${section}`;

      const score = tokens.reduce((sum, token) => {
        if (title.includes(token)) return sum + 8;
        if (definition.includes(token)) return sum + 3;
        if (section.includes(token)) return sum + 1;
        return sum;
      }, 0);

      return { term, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.term.term.localeCompare(b.term.term, "ru"))
    .map((result) => result.term);
}
