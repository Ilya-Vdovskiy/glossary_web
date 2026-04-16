export type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  preview: string;
  sectionSlug: string;
  sectionTitle: string;
};

export type GlossarySection = {
  slug: string;
  title: string;
  terms: GlossaryTerm[];
};

export type GlossaryData = {
  courseTitle: string;
  periodTitle: string;
  sections: GlossarySection[];
};
