import glossaryData from "@/data/glossary.json";
import type { GlossaryData, GlossarySection, GlossaryTerm } from "@/types/glossary";

export const glossary = glossaryData as GlossaryData;

export const sections = glossary.sections;

export const terms = sections.flatMap((section) => section.terms);

export const topLevelSections = sections;

export function getSection(slug: string): GlossarySection | undefined {
  return sections.find((section) => section.slug === slug);
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return terms.find((term) => term.slug === slug);
}

export function getSectionChildren(slug: string): GlossarySection[] {
  return [];
}

export function getSectionTermCount(section: GlossarySection): number {
  const children = getSectionChildren(section.slug);

  if (children.length === 0) {
    return section.terms.length;
  }

  return children.reduce((sum, child) => sum + child.terms.length, section.terms.length);
}

export function getParentSection(section: GlossarySection): GlossarySection | undefined {
  return undefined;
}

export function getStats() {
  return {
    sections: topLevelSections.length,
    terms: terms.length,
  };
}
