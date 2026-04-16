import glossaryData from "@/data/glossary.json";
import type { GlossaryData, GlossarySection, GlossaryTerm } from "@/types/glossary";

export const glossary = glossaryData as GlossaryData;

export const sections = glossary.sections;

export const terms = sections.flatMap((section) => section.terms);

export const literaryParentSlug = "literaturovedenie";

export const literarySubsectionSlugs = [
  "teoriya",
  "personalii",
  "proizvedeniya",
  "personazhi-proizvedeniy",
];

export const topLevelSections = sections.filter(
  (section) => !literarySubsectionSlugs.includes(section.slug),
);

export function getSection(slug: string): GlossarySection | undefined {
  return sections.find((section) => section.slug === slug);
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return terms.find((term) => term.slug === slug);
}

export function getSectionChildren(slug: string): GlossarySection[] {
  if (slug !== literaryParentSlug) {
    return [];
  }

  return literarySubsectionSlugs
    .map((childSlug) => getSection(childSlug))
    .filter((section): section is GlossarySection => Boolean(section));
}

export function getSectionTermCount(section: GlossarySection): number {
  const children = getSectionChildren(section.slug);

  if (children.length === 0) {
    return section.terms.length;
  }

  return children.reduce((sum, child) => sum + child.terms.length, section.terms.length);
}

export function getParentSection(section: GlossarySection): GlossarySection | undefined {
  if (!literarySubsectionSlugs.includes(section.slug)) {
    return undefined;
  }

  return getSection(literaryParentSlug);
}

export function getStats() {
  return {
    sections: topLevelSections.length,
    terms: terms.length,
  };
}
