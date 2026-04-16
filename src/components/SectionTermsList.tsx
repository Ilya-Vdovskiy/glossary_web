import type { GlossarySection } from "@/types/glossary";
import { TermCard } from "@/components/TermCard";

export function SectionTermsList({ section }: { section: GlossarySection }) {
  return (
    <div className="space-y-4">
      {section.terms.map((term) => (
        <TermCard key={term.slug} term={term} />
      ))}
    </div>
  );
}
