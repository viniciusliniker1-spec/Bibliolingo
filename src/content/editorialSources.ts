import type { SourceReference, Unit } from "../types/content";

const commonSources: Omit<SourceReference, "applicableUnitIds">[] = [
  {
    id: "sbl-bible-odyssey",
    title: "Bible Odyssey",
    institution: "Society of Biblical Literature",
    url: "https://www.bibleodyssey.org/",
    language: "inglês",
    coverageRead: "Portal de contexto histórico, literário e arqueológico",
    limitations: ["Recurso complementar; cada artigo possui autoria e escopo próprios."],
    status: "catalogued"
  },
  {
    id: "wesley-center-online",
    title: "Wesley Center Online",
    institution: "Northwest Nazarene University",
    url: "https://wesley.nnu.edu/",
    language: "inglês",
    theologicalOrientation: "Wesleyana",
    coverageRead: "Biblioteca histórica e teológica para aprofundamento",
    limitations: ["Recurso complementar; não substitui a leitura do texto bíblico."],
    status: "catalogued"
  }
];

const originalTextSources: Record<"old" | "new", Omit<SourceReference, "applicableUnitIds">> = {
  old: {
    id: "openscriptures-hebrew-bible",
    title: "Open Scriptures Hebrew Bible",
    institution: "Open Scriptures",
    url: "https://github.com/openscriptures/morphhb",
    language: "hebraico e aramaico",
    license: "CC BY 4.0 (morfologia OSHB); texto WLC conforme distribuição da fonte",
    coverageRead: "Texto e dados morfológicos do Antigo Testamento",
    status: "metadata-verified"
  },
  new: {
    id: "robinson-pierpont-greek-nt",
    title: "Robinson-Pierpont Byzantine Greek New Testament",
    author: "Maurice A. Robinson e William G. Pierpont",
    url: "https://github.com/byztxt/byzantine-majority-text",
    language: "grego koiné",
    coverageRead: "Texto grego e dados linguísticos do Novo Testamento",
    limitations: ["A tradição textual deve ser identificada; variantes relevantes exigem consulta crítica."],
    status: "metadata-verified"
  }
};

const newTestamentBooks = new Set([
  "matthew", "mark", "luke", "john", "acts", "romans", "1-corinthians", "2-corinthians",
  "galatians", "ephesians", "philippians", "colossians", "1-thessalonians",
  "2-thessalonians", "1-timothy", "2-timothy", "titus", "philemon", "hebrews",
  "james", "1-peter", "2-peter", "1-john", "2-john", "3-john", "jude", "revelation"
]);

export function supplementalSourcesForUnit(unit: Unit): SourceReference[] {
  const testament = newTestamentBooks.has(unit.bookId) ? "new" : "old";
  return [...commonSources, originalTextSources[testament]].map((source) => ({
    ...source,
    applicableUnitIds: [unit.id]
  }));
}
