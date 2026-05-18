export type DocumentBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "listItem";
      text: string;
    };

export type RichDocument = {
  title: string;
  blocks: DocumentBlock[];
};

export type ReferenceSection = {
  title: string;
  items: string[];
};

export type ReferenceDocument = {
  title: string;
  sections: ReferenceSection[];
};

export type SupportDocuments = {
  science: RichDocument;
  gosts: ReferenceDocument;
  literature: ReferenceDocument;
  review: RichDocument;
};
