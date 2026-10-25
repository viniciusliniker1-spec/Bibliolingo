export type SupportedOriginalLanguage = "hbo" | "arc" | "grc";

const greekMap: Record<string, string> = {
  α:"a", β:"b", γ:"g", δ:"d", ε:"e", ζ:"z", η:"ē", θ:"th", ι:"i", κ:"k", λ:"l",
  μ:"m", ν:"n", ξ:"x", ο:"o", π:"p", ρ:"r", σ:"s", ς:"s", τ:"t", υ:"y", φ:"ph",
  χ:"ch", ψ:"ps", ω:"ō"
};
const hebrewMap: Record<string, string> = {
  א:"ʾ", ב:"b", ג:"g", ד:"d", ה:"h", ו:"w", ז:"z", ח:"ḥ", ט:"ṭ", י:"y", כ:"k",
  ך:"k", ל:"l", מ:"m", ם:"m", נ:"n", ן:"n", ס:"s", ע:"ʿ", פ:"p", ף:"p", צ:"ṣ",
  ץ:"ṣ", ק:"q", ר:"r", ש:"š", ת:"t"
};

function bare(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f\u0591-\u05c7]/g, "").toLocaleLowerCase();
}

export function transliterateOriginal(value: string, language: SupportedOriginalLanguage) {
  const map = language === "grc" ? greekMap : hebrewMap;
  return [...bare(value)].map((letter) => map[letter] ?? letter).join("");
}

const greekParts: Record<string, string> = {
  N:"substantivo", V:"verbo", A:"adjetivo", P:"pronome", PREP:"preposição", CONJ:"conjunção",
  ADV:"advérbio", T:"artigo", I:"interjeição", PRT:"partícula", PRES:"presente", IMPF:"imperfeito",
  FUT:"futuro", AOR:"aoristo", PERF:"perfeito", PLUP:"mais-que-perfeito", ACT:"voz ativa",
  MID:"voz média", PASS:"voz passiva", IND:"indicativo", SUBJ:"subjuntivo", OPT:"optativo",
  IMP:"imperativo", INF:"infinitivo", PTC:"particípio", NOM:"nominativo", GEN:"genitivo",
  DAT:"dativo", ACC:"acusativo", VOC:"vocativo", S:"singular", P:"plural"
};

export function explainMorphology(code: string, language: SupportedOriginalLanguage) {
  if (!code) return "Morfologia não informada";
  if (language === "grc") {
    const explained = code.toUpperCase().split(/[-.,/]/).map((part) => greekParts[part]).filter(Boolean);
    return explained.length ? explained.join(" · ") : "Código morfológico grego: " + code;
  }
  const normalized = code.split("/").pop() ?? code;
  const languageLabel = language === "arc" ? "aramaico" : "hebraico";
  const kind = normalized.includes("V") ? "verbo" : normalized.includes("N") ? "substantivo" :
    normalized.includes("A") ? "adjetivo" : normalized.includes("P") ? "pronome" : "forma";
  return kind + " em " + languageLabel + " · código OSHB " + code;
}

export function originalLanguageLabel(language: SupportedOriginalLanguage) {
  return language === "grc" ? "grego koiné" : language === "arc" ? "aramaico bíblico" : "hebraico bíblico";
}
