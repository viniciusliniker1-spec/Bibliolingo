/**
 * Identidade visual das trilhas de idiomas originais.
 *
 * Grego koiné: azul do Egeu e ouro, mármore, meandro grego e colunas jônicas.
 * Hebraico e aramaico: pergaminho, bronze e oliveira; faixas como rolos da Torá
 * e o caminho espelhado (o hebraico se lê da direita para a esquerda).
 */
export type LanguageTrailId = "greek" | "hebrew";

export interface LanguageTrailColors {
  ground: string;
  groundDeep: string;
  card: string;
  line: string;
  text: string;
  muted: string;
  path: string;
  pathDone: string;
  node: string;
  nodeShadow: string;
  nodeText: string;
  done: string;
  doneShadow: string;
  locked: string;
  lockedShadow: string;
  accent: string;
  ornament: string;
  cta: string;
  ctaShadow: string;
  ctaText: string;
}

export interface UnitWord { word: string; meaning: string }

export interface LanguageTrailTheme {
  id: LanguageTrailId;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Letras usadas nos nós, na ordem do alfabeto. */
  letters: string[];
  /** Letra grande de fundo no topo e nos cartões. */
  watermark: string;
  /** Uma palavra bíblica por unidade, como emblema da faixa. */
  unitWords: UnitWord[];
  /** Saudação da Lumi ao lado do próximo passo. */
  greeting: string;
  /** Caminho espelhado (começa pela direita). */
  mirrored: boolean;
  dictionaryLabel: string;
  dark: LanguageTrailColors;
  light: LanguageTrailColors;
}

export const GREEK_TRAIL: LanguageTrailTheme = {
  id: "greek",
  eyebrow: "GREGO KOINÉ",
  title: "Grego Bíblico",
  subtitle: "A língua do Novo Testamento, letra por letra.",
  letters: "αβγδεζηθικλμνξοπρστυφχψω".split(""),
  watermark: "Ω",
  unitWords: [
    { word: "ἀρχή", meaning: "princípio" },
    { word: "φωνή", meaning: "voz" },
    { word: "λόγος", meaning: "palavra" },
    { word: "ὄνομα", meaning: "nome" },
    { word: "ζωή", meaning: "vida" },
    { word: "ἀλήθεια", meaning: "verdade" },
    { word: "χάρις", meaning: "graça" },
    { word: "ἀγάπη", meaning: "amor" }
  ],
  greeting: "Χαῖρε! Que tal “{licao}”?",
  mirrored: false,
  dictionaryLabel: "Léxico grego",
  dark: {
    ground: "#0b2034", groundDeep: "#081828", card: "#11304b", line: "#1d4566", text: "#f3f7fb", muted: "#9cb6cf",
    path: "#1b4467", pathDone: "#e2b44c", node: "#2f86c9", nodeShadow: "#1a527f", nodeText: "#ffffff",
    done: "#e2b44c", doneShadow: "#97701f", locked: "#1a3b58", lockedShadow: "#11293f", accent: "#7cc4ff",
    ornament: "#e2b44c", cta: "#2f86c9", ctaShadow: "#1a527f", ctaText: "#ffffff"
  },
  light: {
    ground: "#eef3f8", groundDeep: "#e3ebf3", card: "#ffffff", line: "#cfdbe7", text: "#0f2740", muted: "#5b7189",
    path: "#c9d8e6", pathDone: "#d29f2e", node: "#2f86c9", nodeShadow: "#1f5f92", nodeText: "#ffffff",
    done: "#e2b44c", doneShadow: "#a57a20", locked: "#d6e1ec", lockedShadow: "#b9c8d8", accent: "#1f6fae",
    ornament: "#c79a2c", cta: "#2f86c9", ctaShadow: "#1f5f92", ctaText: "#ffffff"
  }
};

export const HEBREW_TRAIL: LanguageTrailTheme = {
  id: "hebrew",
  eyebrow: "LÍNGUAS DO ANTIGO TESTAMENTO",
  title: "Hebraico e Aramaico",
  subtitle: "Da direita para a esquerda, como os rolos de Israel.",
  letters: "אבגדהוזחטיכלמנסעפצקרשת".split(""),
  watermark: "א",
  unitWords: [
    { word: "אוֹר", meaning: "luz" },
    { word: "קוֹל", meaning: "voz" },
    { word: "שֵׁם", meaning: "nome" },
    { word: "חֶסֶד", meaning: "amor leal" },
    { word: "דָּבָר", meaning: "palavra" },
    { word: "בְּרָכָה", meaning: "bênção" },
    { word: "שִׁיר", meaning: "cântico" },
    { word: "שָׁלוֹם", meaning: "paz" }
  ],
  greeting: "Shalom! Bora para “{licao}”?",
  mirrored: true,
  dictionaryLabel: "Léxico hebraico",
  dark: {
    ground: "#1b170f", groundDeep: "#14110b", card: "#2a2318", line: "#43382a", text: "#f7eedc", muted: "#c3b394",
    path: "#4a3d27", pathDone: "#d9a441", node: "#6f9a3c", nodeShadow: "#47661f", nodeText: "#ffffff",
    done: "#d9a441", doneShadow: "#8f651c", locked: "#3a3122", lockedShadow: "#2a2318", accent: "#e8c27a",
    ornament: "#c9a25a", cta: "#6f9a3c", ctaShadow: "#47661f", ctaText: "#ffffff"
  },
  light: {
    ground: "#f6eedb", groundDeep: "#efe4cb", card: "#fffaf0", line: "#e3d3b0", text: "#3a2c17", muted: "#7d6a4b",
    path: "#e3d3b0", pathDone: "#c08a26", node: "#5f8a2f", nodeShadow: "#41611d", nodeText: "#ffffff",
    done: "#d9a441", doneShadow: "#97701f", locked: "#e8dcc2", lockedShadow: "#d2c19c", accent: "#8a5a12",
    ornament: "#b58a3c", cta: "#5f8a2f", ctaShadow: "#41611d", ctaText: "#ffffff"
  }
};

export const LANGUAGE_TRAILS: Record<LanguageTrailId, LanguageTrailTheme> = { greek: GREEK_TRAIL, hebrew: HEBREW_TRAIL };

/** Letra do nó: avança pelo alfabeto a cada lição e recomeça depois da última. */
export function nodeLetter(theme: LanguageTrailTheme, lessonOrdinal: number) {
  return theme.letters[((lessonOrdinal % theme.letters.length) + theme.letters.length) % theme.letters.length];
}

export function unitWord(theme: LanguageTrailTheme, unitIndex: number) {
  return theme.unitWords[unitIndex % theme.unitWords.length];
}

/** Espelha o x no caminho do hebraico. */
export function mirrorX(theme: LanguageTrailTheme, x: number, width: number) {
  return theme.mirrored ? width - x : x;
}
