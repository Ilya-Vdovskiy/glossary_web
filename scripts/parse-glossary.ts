import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { GlossaryData, GlossarySection, GlossaryTerm } from "../src/types/glossary";
import { uniqueSlug } from "../src/lib/slug";

type Paragraph = {
  text: string;
  style?: string;
  isNumbered: boolean;
};

const rootDir = process.cwd();
const sourceDocx = path.join(rootDir, "термины_все_исправленные_с_оглавлением.docx");
const outputJson = path.join(rootDir, "src", "data", "glossary.json");

const sectionTitles = [
  "История",
  "Литературоведение",
  "Теория",
  "Персоналии",
  "Произведения",
  "Персонажи произведений",
  "Философия",
];

const sectionLookup = new Map(sectionTitles.map((title) => [normalizeKey(title), title]));

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[‐‑‒–—―−]/g, "—")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{«])\s+/g, "$1")
    .replace(/\s+([)\]}»])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value: string): string {
  return normalizeText(value)
    .replace(/^[·•*]\s*/, "")
    .replace(/[.:\-—]+$/g, "")
    .replace(/^\d+[.)]\s*/, "")
    .toLowerCase()
    .replace(/ё/g, "е");
}

function getNodeText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (typeof node !== "object") return "";

  const record = node as Record<string, unknown>;
  let result = "";

  for (const [key, value] of Object.entries(record)) {
    if (key === "w:t") {
      result += getNodeText(value);
    } else if (key === "w:tab") {
      result += " ";
    } else if (key === "w:br") {
      result += "\n";
    } else if (!key.startsWith("@_")) {
      result += getNodeText(value);
    }
  }

  return result;
}

function getParagraphs(documentXml: string): Paragraph[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    trimValues: false,
  });
  const document = parser.parse(documentXml);
  const body = document["w:document"]?.["w:body"];
  const paragraphs = asArray<Record<string, unknown>>(body?.["w:p"]);

  return paragraphs
    .map((paragraph) => {
      const paragraphProps = paragraph["w:pPr"] as Record<string, unknown> | undefined;
      const styleNode = paragraphProps?.["w:pStyle"] as Record<string, string> | undefined;
      const style = styleNode?.["@_w:val"];
      const isNumbered = Boolean(paragraphProps?.["w:numPr"]);
      const text = normalizeText(getNodeText(paragraph));

      return { text, style, isNumbered };
    })
    .filter((paragraph) => paragraph.text.length > 0);
}

function findCourseTitle(paragraphs: Paragraph[]): string {
  return (
    paragraphs.find((paragraph) => /глоссарий/i.test(paragraph.text))?.text ??
    "Глоссарий по ДО курсу «Зарубежная литература XIX века»"
  );
}

function findPeriodTitle(courseTitle: string): string {
  const match = courseTitle.match(/\(([^)]+)\)/);
  if (!match) return "Вторая половина";

  return match[1].replace(/^./, (letter) => letter.toUpperCase());
}

function getSectionTitle(text: string): string | undefined {
  return sectionLookup.get(normalizeKey(text));
}

function findContentStart(paragraphs: Paragraph[]): number {
  const firstSection = sectionTitles[0];
  const firstSectionIndexes = paragraphs
    .map((paragraph, index) => (getSectionTitle(paragraph.text) === firstSection ? index : -1))
    .filter((index) => index >= 0);

  if (firstSectionIndexes.length > 1) {
    return firstSectionIndexes[1];
  }

  const tocIndex = paragraphs.findIndex((paragraph) => /оглавление/i.test(paragraph.text));
  const firstSectionAfterToc = paragraphs.findIndex(
    (paragraph, index) => index > tocIndex && Boolean(getSectionTitle(paragraph.text)),
  );

  return firstSectionAfterToc >= 0 ? firstSectionAfterToc : 0;
}

function splitInlineTerm(text: string): { term: string; definition: string } | undefined {
  const separatorIndex = findDefinitionSeparator(text);
  if (separatorIndex < 0) return undefined;

  const term = normalizeText(text.slice(0, separatorIndex)).replace(/^[·•*]\s*/, "").replace(/[.:;]+$/g, "");
  const definition = normalizeText(text.slice(separatorIndex + 1));

  if (!isReasonableTerm(term) || !definition) return undefined;
  return { term, definition };
}

function findDefinitionSeparator(text: string): number {
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === "(" || char === "[" || char === "{") depth += 1;
    if (char === ")" || char === "]" || char === "}") depth = Math.max(0, depth - 1);

    const isDash = char === "—" || char === "-";
    const hasSpaceAround = /\s/.test(text[index - 1] ?? "") && /\s/.test(text[index + 1] ?? "");

    if (depth === 0 && isDash && hasSpaceAround && index >= 2) {
      const left = text.slice(0, index);
      const right = text.slice(index + 1);
      if (left.length <= 150 && right.trim().length >= 8) {
        return index;
      }
    }
  }

  return -1;
}

function isReasonableTerm(text: string): boolean {
  const normalized = normalizeText(text).replace(/^[·•*]\s*/, "");
  if (normalized.length < 2 || normalized.length > 120) return false;
  if (/^(оглавление|содержание)$/i.test(normalized)) return false;
  if (/[.!?]$/.test(normalized)) return false;
  if (normalized.split(/\s+/).length > 10) return false;
  return /[\p{L}\p{N}]/u.test(normalized);
}

function looksLikeTermHeading(current: Paragraph, next?: Paragraph): boolean {
  if (!next || !isReasonableTerm(current.text)) return false;
  if (getSectionTitle(current.text)) return false;

  const nextIsDefinition =
    next.text.length > 45 ||
    /^[—-]/.test(next.text) ||
    new RegExp(`^${escapeRegExp(current.text)}\\s*(?:—|-)`, "i").test(next.text);

  const styleHint = Boolean(current.style && /heading|title|a[1-9]/i.test(current.style));
  const compactHeading = current.text.length <= 80 && /^[\p{Lu}«"]/u.test(current.text);

  return nextIsDefinition && (styleHint || compactHeading || current.isNumbered);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripRepeatedTerm(term: string, definition: string): string {
  const repeated = new RegExp(`^${escapeRegExp(term)}\\s*(?:—|-|:)?\\s*`, "i");
  const cleaned = normalizeText(definition.replace(repeated, ""));
  return cleaned || definition;
}

function createPreview(definition: string): string {
  const limit = 190;
  if (definition.length <= limit) return definition;

  const sliced = definition.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 120 ? lastSpace : limit).trim()}...`;
}

function buildData(paragraphs: Paragraph[]): GlossaryData {
  const courseTitle = findCourseTitle(paragraphs);
  const periodTitle = findPeriodTitle(courseTitle);
  const contentStart = findContentStart(paragraphs);
  const content = paragraphs.slice(contentStart);

  const sectionSlugs = new Set<string>();
  const termSlugs = new Set<string>();
  const sections: GlossarySection[] = [];
  let currentSection: GlossarySection | undefined;
  let currentTerm: GlossaryTerm | undefined;

  function ensureSection(title: string): GlossarySection {
    let section = sections.find((item) => item.title === title);
    if (!section) {
      section = {
        slug: uniqueSlug(title, sectionSlugs),
        title,
        terms: [],
      };
      sections.push(section);
    }
    currentSection = section;
    currentTerm = undefined;
    return section;
  }

  function addTerm(term: string, definition: string) {
    if (!currentSection) {
      ensureSection("Без раздела");
    }

    const section = currentSection!;
    const cleanedTerm = normalizeText(term).replace(/^[·•*]\s*/, "");
    const cleanedDefinition = stripRepeatedTerm(cleanedTerm, definition);

    if (!isReasonableTerm(cleanedTerm) || cleanedDefinition.length < 8) return;

    currentTerm = {
      slug: uniqueSlug(cleanedTerm, termSlugs),
      term: cleanedTerm,
      definition: cleanedDefinition,
      preview: createPreview(cleanedDefinition),
      sectionSlug: section.slug,
      sectionTitle: section.title,
    };
    section.terms.push(currentTerm);
  }

  for (let index = 0; index < content.length; index += 1) {
    const paragraph = content[index];
    const text = paragraph.text;
    const sectionTitle = getSectionTitle(text);

    if (sectionTitle) {
      ensureSection(sectionTitle);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    const inlineTerm = splitInlineTerm(text);
    if (inlineTerm) {
      addTerm(inlineTerm.term, inlineTerm.definition);
      continue;
    }

    const next = content[index + 1];
    if (looksLikeTermHeading(paragraph, next)) {
      const definitionParts: string[] = [];
      index += 1;

      while (index < content.length) {
        const candidate = content[index];
        if (getSectionTitle(candidate.text)) {
          index -= 1;
          break;
        }
        if (definitionParts.length > 0 && (splitInlineTerm(candidate.text) || looksLikeTermHeading(candidate, content[index + 1]))) {
          index -= 1;
          break;
        }

        definitionParts.push(candidate.text.replace(/^[—-]\s*/, ""));
        index += 1;
      }

      addTerm(text, definitionParts.join(" "));
      continue;
    }

    if (currentTerm && !getSectionTitle(text)) {
      currentTerm.definition = normalizeText(`${currentTerm.definition} ${text}`);
      currentTerm.preview = createPreview(currentTerm.definition);
    }
  }

  return {
    courseTitle,
    periodTitle,
    sections,
  };
}

async function main() {
  const buffer = await readFile(sourceDocx);
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("text");

  if (!documentXml) {
    throw new Error("Не найден word/document.xml внутри .docx");
  }

  const paragraphs = getParagraphs(documentXml);
  const data = buildData(paragraphs);

  await mkdir(path.dirname(outputJson), { recursive: true });
  await writeFile(outputJson, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const termsCount = data.sections.reduce((sum, section) => sum + section.terms.length, 0);
  console.log(`Готово: ${data.sections.length} разделов, ${termsCount} терминов.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
