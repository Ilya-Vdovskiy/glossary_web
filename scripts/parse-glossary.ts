import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import type { GlossaryData, GlossarySection, GlossaryTerm } from "../src/types/glossary";
import type { DocumentBlock, ReferenceDocument, SupportDocuments } from "../src/types/content";
import { uniqueSlug } from "../src/lib/slug";

type DocxParagraph = {
  text: string;
  style: string;
  isNumbered: boolean;
};

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "src", "data");

const glossaryDocx = path.join(rootDir, "terminy.docx");
const scienceDocx = path.join(rootDir, "nauka_glossariy.docx");
const gostsDocx = path.join(rootDir, "gosty_and_spisok.docx");
const sourcesDocx = path.join(rootDir, "istockhniky.docx");
const reviewDocx = path.join(rootDir, "retsenzia.docx");

const explicitSectionTitles = new Set([
  "Поэтика, стилистика и художественные приёмы",
  "Персонажи и типы героев",
  "Произведения",
]);

function decodeXml(value: string): string {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function normalizeText(value: string): string {
  return decodeXml(value)
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/[‐‑‒–—―−]/g, "—")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{«])\s+/g, "$1")
    .replace(/\s+([)\]}»])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLines(value: string): string {
  return decodeXml(value)
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/[‐‑‒–—―−]/g, "—")
    .split(/\n+/g)
    .map((line) =>
      line
        .replace(/[ \t]+/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/([([{«])\s+/g, "$1")
        .replace(/\s+([)\]}»])/g, "$1")
        .trim(),
    )
    .filter(Boolean)
    .join("\n");
}

function getParagraphText(paragraphXml: string): string {
  return normalizeLines(
    paragraphXml
      .replace(/<w:tab\s*\/>/g, " ")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<[^>]+>/g, ""),
  );
}

function getParagraphStyle(paragraphXml: string): string {
  return paragraphXml.match(/<w:pStyle\s+w:val="([^"]+)"/)?.[1] ?? "";
}

function isNumberedParagraph(paragraphXml: string): boolean {
  return /<w:numPr[>\s]/.test(paragraphXml);
}

async function readDocxParagraphs(filePath: string): Promise<DocxParagraph[]> {
  const buffer = await readFile(filePath);
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("text");

  if (!documentXml) {
    throw new Error(`Не найден word/document.xml в ${path.basename(filePath)}`);
  }

  return [...documentXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g)]
    .flatMap((match) => {
      const style = getParagraphStyle(match[0]);
      const isNumbered = isNumberedParagraph(match[0]);
      return getParagraphText(match[0])
        .split(/\n+/g)
        .map((text) => ({ text, style, isNumbered }));
    })
    .filter((paragraph) => paragraph.text.length > 0);
}

function isHeadingLevel(style: string, level: 1 | 2 | 3): boolean {
  return style === String(level) || style.toLowerCase() === `heading${level}`;
}

function isGlossarySectionHeading(paragraph: DocxParagraph): boolean {
  const text = paragraph.text.replace(/[.]+$/g, "");
  return isHeadingLevel(paragraph.style, 1) || explicitSectionTitles.has(text);
}

function normalizeSectionTitle(title: string): string {
  const cleaned = normalizeText(title.replace(/[.]+$/g, ""));
  const lower = cleaned.toLocaleLowerCase("ru");
  return lower.replace(/^([\p{L}])/u, (letter) => letter.toLocaleUpperCase("ru"));
}

function findDefinitionSeparator(text: string): number {
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === "(" || char === "[" || char === "{") depth += 1;
    if (char === ")" || char === "]" || char === "}") depth = Math.max(0, depth - 1);

    const hasSpaceAround = /\s/.test(text[index - 1] ?? "") && /\s/.test(text[index + 1] ?? "");
    if (depth === 0 && (char === "—" || char === "-") && hasSpaceAround) {
      return index;
    }
  }

  return -1;
}

function isReasonableTerm(text: string): boolean {
  const normalized = normalizeText(text);
  if (normalized.length < 2 || normalized.length > 140) return false;
  if (/^[А-ЯЁ]\.\s+[\p{Lu}][\p{L}-]+\.?$/u.test(normalized)) return false;
  if (/[!?]$/.test(normalized)) return false;
  if (normalized.split(/\s+/).length > 12) return false;
  return /[\p{L}\p{N}]/u.test(normalized);
}

function createPreview(definition: string): string {
  const limit = 190;
  if (definition.length <= limit) return definition;

  const sliced = definition.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 120 ? lastSpace : limit).trim()}...`;
}

function stripSourcePrefix(text: string): string {
  return normalizeText(text.replace(/^Источник\s*:?\s*/i, ""));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildGlossary(paragraphs: DocxParagraph[]): GlossaryData {
  const sectionSlugs = new Set<string>();
  const termSlugs = new Set<string>();
  const sections: GlossarySection[] = [];
  let currentSection: GlossarySection | undefined;
  let currentTerm: GlossaryTerm | undefined;
  let awaitingSourceFor: GlossaryTerm | undefined;
  let sourceContinuationOnly = false;

  function ensureSection(title: string) {
    const section: GlossarySection = {
      slug: uniqueSlug(title, sectionSlugs),
      title: normalizeSectionTitle(title),
      terms: [],
    };
    sections.push(section);
    currentSection = section;
    currentTerm = undefined;
    awaitingSourceFor = undefined;
    sourceContinuationOnly = false;
  }

  function addTerm(rawTerm: string, rawDefinition: string) {
    if (!currentSection) return;

    const term = normalizeText(rawTerm);
    const definition = normalizeText(rawDefinition);
    if (!term || !definition) return;

    const item: GlossaryTerm = {
      slug: uniqueSlug(term, termSlugs),
      term,
      definition,
      preview: createPreview(definition),
      source: "",
      sectionSlug: currentSection.slug,
      sectionTitle: currentSection.title,
    };
    currentSection.terms.push(item);
    currentTerm = item;
    awaitingSourceFor = item;
    sourceContinuationOnly = false;
  }

  for (const paragraph of paragraphs) {
    const text = paragraph.text;

    if (isGlossarySectionHeading(paragraph)) {
      ensureSection(text);
      continue;
    }

    if (!currentSection) continue;

    if (/^Источник\s*:?\s*$/i.test(text)) {
      awaitingSourceFor = currentTerm;
      sourceContinuationOnly = false;
      continue;
    }

    if (/^Источник\s*:/i.test(text)) {
      if (awaitingSourceFor) {
        awaitingSourceFor.source = stripSourcePrefix(text);
        sourceContinuationOnly = true;
      }
      continue;
    }

    if (awaitingSourceFor) {
      const separatorIndex = findDefinitionSeparator(text);
      const possibleTerm = separatorIndex >= 0 ? normalizeText(text.slice(0, separatorIndex)) : "";
      const isNextTerm = sourceContinuationOnly && isReasonableTerm(possibleTerm);

      if (!isNextTerm) {
        awaitingSourceFor.source = normalizeText(`${awaitingSourceFor.source} ${text}`);
        awaitingSourceFor = undefined;
        sourceContinuationOnly = false;
        continue;
      }

      awaitingSourceFor = undefined;
      sourceContinuationOnly = false;
    }

    const separatorIndex = findDefinitionSeparator(text);
    if (separatorIndex >= 0) {
      addTerm(text.slice(0, separatorIndex), text.slice(separatorIndex + 1));
      continue;
    }

    if (currentTerm) {
      currentTerm.definition = normalizeText(`${currentTerm.definition} ${text}`);
      currentTerm.preview = createPreview(currentTerm.definition);
    }
  }

  return {
    courseTitle: "Глоссарий по курсу «Зарубежная литература XIX века»",
    periodTitle: "XIX век",
    sections,
  };
}

function buildRichDocument(paragraphs: DocxParagraph[]): { title: string; blocks: DocumentBlock[] } {
  const blocks: DocumentBlock[] = [];
  let title = paragraphs[0]?.text ?? "Документ";

  for (const paragraph of paragraphs) {
    if (isHeadingLevel(paragraph.style, 1)) {
      title = paragraph.text;
      blocks.push({ type: "heading", level: 1, text: paragraph.text });
    } else if (isHeadingLevel(paragraph.style, 2)) {
      blocks.push({ type: "heading", level: 2, text: paragraph.text });
    } else if (isHeadingLevel(paragraph.style, 3)) {
      blocks.push({ type: "heading", level: 3, text: paragraph.text.replace(/[.]+$/g, "") });
    } else if (paragraph.isNumbered) {
      blocks.push({ type: "listItem", text: paragraph.text });
    } else if (paragraph.text) {
      blocks.push({ type: "paragraph", text: paragraph.text });
    }
  }

  return { title, blocks };
}

function splitGostsAndLiterature(text: string): { gosts: string[]; literatureSections: { title: string; items: string[] }[] } {
  const markers = [
    "Основы терминоведения, лексикографии и терминографии",
    "Словари литературоведческих терминов",
    "Проблематика составления глоссариев (статьи и диссертации)",
  ];
  let normalized = normalizeText(text).replace(/^ГОСТ\s*/i, "ГОСТ • ");

  for (const marker of markers) {
    normalized = normalized.replace(new RegExp(`(\\d+\\s*с\\.?)\\s*${escapeRegExp(marker)}`, "i"), `$1 • ${marker}`);
  }

  const parts = normalized
    .split(/•\s*/g)
    .map((part) => normalizeText(part))
    .filter(Boolean);

  const gosts: string[] = [];
  const literatureSections: { title: string; items: string[] }[] = [];
  let currentSection: { title: string; items: string[] } | undefined;

  for (const part of parts) {
    const clean = part.trim();
    if (/^ГОСТ$/i.test(clean)) continue;
    const matchedMarker = markers.find((marker) => clean.startsWith(marker));

    if (matchedMarker) {
      currentSection = { title: matchedMarker, items: [] };
      literatureSections.push(currentSection);
      const item = normalizeText(clean.slice(matchedMarker.length));
      if (item) currentSection.items.push(item);
    } else if (currentSection) {
      currentSection.items.push(clean);
    } else if (clean) {
      gosts.push(clean);
    }
  }

  return { gosts, literatureSections };
}

function uniqueItems(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLocaleLowerCase("ru");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildReferenceDocuments(gostParagraphs: DocxParagraph[], sourceParagraphs: DocxParagraph[]) {
  const combinedGostText = gostParagraphs.map((paragraph) => paragraph.text).join(" ");
  const { gosts, literatureSections } = splitGostsAndLiterature(combinedGostText);
  const sourceItems = sourceParagraphs.slice(1).map((paragraph) => paragraph.text).filter(Boolean);

  const gostDocument: ReferenceDocument = {
    title: "ГОСТы",
    sections: [{ title: "Стандарты", items: uniqueItems(gosts) }],
  };

  const literatureDocument: ReferenceDocument = {
    title: "Списки литературы",
    sections: [
      ...literatureSections.map((section) => ({ ...section, items: uniqueItems(section.items) })),
      { title: "Источники", items: uniqueItems(sourceItems) },
    ].filter((section) => section.items.length > 0),
  };

  return { gostDocument, literatureDocument };
}

async function main() {
  const [glossaryParagraphs, scienceParagraphs, gostParagraphs, sourceParagraphs, reviewParagraphs] = await Promise.all([
    readDocxParagraphs(glossaryDocx),
    readDocxParagraphs(scienceDocx),
    readDocxParagraphs(gostsDocx),
    readDocxParagraphs(sourcesDocx),
    readDocxParagraphs(reviewDocx),
  ]);

  const glossary = buildGlossary(glossaryParagraphs);
  const { gostDocument, literatureDocument } = buildReferenceDocuments(gostParagraphs, sourceParagraphs);
  const supportDocuments: SupportDocuments = {
    science: buildRichDocument(scienceParagraphs),
    gosts: gostDocument,
    literature: literatureDocument,
    review: buildRichDocument(reviewParagraphs),
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "glossary.json"), `${JSON.stringify(glossary, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, "support-documents.json"), `${JSON.stringify(supportDocuments, null, 2)}\n`, "utf8");

  const termsCount = glossary.sections.reduce((sum, section) => sum + section.terms.length, 0);
  console.log(`Готово: ${glossary.sections.length} разделов, ${termsCount} терминов, 4 дополнительных документа.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
