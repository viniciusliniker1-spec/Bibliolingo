/**
 * Alfabetos grego (koiné) e hebraico com nome, som e uma palavra bíblica de exemplo.
 *
 * Pronúncia: a acadêmica usada nos seminários brasileiros (grego "erasmiano"
 * simplificado; hebraico com as distinções de dagesh). O áudio usa a voz do
 * aparelho, que tem sotaque moderno: serve como apoio, não como referência.
 */
export type AlphabetId = "grc" | "hbo";

export interface Letter {
  id: string;
  /** Forma principal mostrada no app (minúscula no grego). */
  glyph: string;
  /** Grego: maiúscula. Hebraico: forma final, quando existe. */
  alt?: string;
  name: string;
  /** Nome escrito no idioma, para a voz do aparelho. */
  nativeName: string;
  translit: string;
  sound: string;
  example: { word: string; translit: string; meaning: string; ref: string };
  note?: string;
}

export interface Alphabet {
  id: AlphabetId;
  title: string;
  direction: "ltr" | "rtl";
  /** Grupos de aprendizagem, em ordem. */
  groups: { title: string; letters: string[] }[];
  letters: Letter[];
}

const greekLetters: Letter[] = [
  { id: "alpha", glyph: "α", alt: "Α", name: "alfa", nativeName: "άλφα", translit: "a", sound: "“a” de pai", example: { word: "ἀγάπη", translit: "agápē", meaning: "amor", ref: "1 Coríntios 13:13" } },
  { id: "beta", glyph: "β", alt: "Β", name: "beta", nativeName: "βήτα", translit: "b", sound: "“b” de bola", example: { word: "βίβλος", translit: "bíblos", meaning: "livro", ref: "Mateus 1:1" } },
  { id: "gamma", glyph: "γ", alt: "Γ", name: "gama", nativeName: "γάμμα", translit: "g", sound: "“g” de gato", note: "Antes de γ, κ, ξ ou χ soa como “n”: ἄγγελος = ánguelos.", example: { word: "γραφή", translit: "graphḗ", meaning: "escritura", ref: "2 Timóteo 3:16" } },
  { id: "delta", glyph: "δ", alt: "Δ", name: "delta", nativeName: "δέλτα", translit: "d", sound: "“d” de dado", example: { word: "δόξα", translit: "dóxa", meaning: "glória", ref: "João 1:14" } },
  { id: "epsilon", glyph: "ε", alt: "Ε", name: "épsilon", nativeName: "έψιλον", translit: "e", sound: "“é” breve, de café", example: { word: "ἐλπίς", translit: "elpís", meaning: "esperança", ref: "Romanos 5:5" } },
  { id: "zeta", glyph: "ζ", alt: "Ζ", name: "zeta", nativeName: "ζήτα", translit: "z", sound: "“dz”, como em “adzuki”", example: { word: "ζωή", translit: "zōḗ", meaning: "vida", ref: "João 14:6" } },
  { id: "eta", glyph: "η", alt: "Η", name: "eta", nativeName: "ήτα", translit: "ē", sound: "“ê” longo, de mês", example: { word: "ἡμέρα", translit: "hēméra", meaning: "dia", ref: "Mateus 6:34" } },
  { id: "theta", glyph: "θ", alt: "Θ", name: "teta", nativeName: "θήτα", translit: "th", sound: "“th” do inglês “think”", example: { word: "θεός", translit: "theós", meaning: "Deus", ref: "João 1:1" } },
  { id: "iota", glyph: "ι", alt: "Ι", name: "iota", nativeName: "γιώτα", translit: "i", sound: "“i” de vida", example: { word: "Ἰησοῦς", translit: "Iēsoûs", meaning: "Jesus", ref: "Mateus 1:21" } },
  { id: "kappa", glyph: "κ", alt: "Κ", name: "capa", nativeName: "κάππα", translit: "k", sound: "“k” de casa", example: { word: "κύριος", translit: "kýrios", meaning: "Senhor", ref: "Filipenses 2:11" } },
  { id: "lambda", glyph: "λ", alt: "Λ", name: "lambda", nativeName: "λάμδα", translit: "l", sound: "“l” de luz", example: { word: "λόγος", translit: "lógos", meaning: "palavra", ref: "João 1:1" } },
  { id: "mu", glyph: "μ", alt: "Μ", name: "mi", nativeName: "μι", translit: "m", sound: "“m” de mãe", example: { word: "μαθητής", translit: "mathētḗs", meaning: "discípulo", ref: "Mateus 28:19" } },
  { id: "nu", glyph: "ν", alt: "Ν", name: "ni", nativeName: "νι", translit: "n", sound: "“n” de nome", example: { word: "νόμος", translit: "nómos", meaning: "lei", ref: "Romanos 3:21" } },
  { id: "xi", glyph: "ξ", alt: "Ξ", name: "csi", nativeName: "ξι", translit: "x", sound: "“ks”, de táxi", example: { word: "ξένος", translit: "xénos", meaning: "estrangeiro", ref: "Mateus 25:35" } },
  { id: "omicron", glyph: "ο", alt: "Ο", name: "ômicron", nativeName: "όμικρον", translit: "o", sound: "“ó” breve, de pó", example: { word: "οὐρανός", translit: "ouranós", meaning: "céu", ref: "Mateus 6:9" } },
  { id: "pi", glyph: "π", alt: "Π", name: "pi", nativeName: "πι", translit: "p", sound: "“p” de pão", example: { word: "πίστις", translit: "pístis", meaning: "fé", ref: "Hebreus 11:1" } },
  { id: "rho", glyph: "ρ", alt: "Ρ", name: "rô", nativeName: "ρο", translit: "r", sound: "“r” de caro", example: { word: "ῥῆμα", translit: "rhêma", meaning: "palavra dita", ref: "Romanos 10:17" } },
  { id: "sigma", glyph: "σ", alt: "Σ", name: "sigma", nativeName: "σίγμα", translit: "s", sound: "“s” de sol", note: "No fim da palavra se escreve ς: λόγος.", example: { word: "σωτηρία", translit: "sōtēría", meaning: "salvação", ref: "Atos 4:12" } },
  { id: "tau", glyph: "τ", alt: "Τ", name: "tau", nativeName: "ταυ", translit: "t", sound: "“t” de teto", example: { word: "τέκνον", translit: "téknon", meaning: "filho, criança", ref: "1 João 3:1" } },
  { id: "upsilon", glyph: "υ", alt: "Υ", name: "úpsilon", nativeName: "ύψιλον", translit: "y / u", sound: "“ü”, como no francês “tu”", example: { word: "υἱός", translit: "huiós", meaning: "filho", ref: "João 3:16" } },
  { id: "phi", glyph: "φ", alt: "Φ", name: "fi", nativeName: "φι", translit: "ph", sound: "“f” de fé", example: { word: "φῶς", translit: "phôs", meaning: "luz", ref: "João 8:12" } },
  { id: "chi", glyph: "χ", alt: "Χ", name: "qui", nativeName: "χι", translit: "ch", sound: "“kh” aspirado, como o “j” espanhol", example: { word: "χάρις", translit: "cháris", meaning: "graça", ref: "Efésios 2:8" } },
  { id: "psi", glyph: "ψ", alt: "Ψ", name: "psi", nativeName: "ψι", translit: "ps", sound: "“ps”, de psicologia", example: { word: "ψυχή", translit: "psychḗ", meaning: "alma, vida", ref: "Mateus 16:26" } },
  { id: "omega", glyph: "ω", alt: "Ω", name: "ômega", nativeName: "ωμέγα", translit: "ō", sound: "“ô” longo, de avô", example: { word: "ὥρα", translit: "hṓra", meaning: "hora", ref: "João 17:1" } }
];

const hebrewLetters: Letter[] = [
  { id: "alef", glyph: "א", name: "álef", nativeName: "אָלֶף", translit: "ʾ", sound: "sem som próprio (apoio da vogal)", example: { word: "אֱלֹהִים", translit: "ʾelohim", meaning: "Deus", ref: "Gênesis 1:1" } },
  { id: "bet", glyph: "ב", name: "bet / vet", nativeName: "בֵּית", translit: "b / v", sound: "“b” com ponto (בּ), “v” sem ponto", example: { word: "בְּרֵאשִׁית", translit: "bereshit", meaning: "no princípio", ref: "Gênesis 1:1" } },
  { id: "gimel", glyph: "ג", name: "guímel", nativeName: "גִּימֶל", translit: "g", sound: "“g” de gato", example: { word: "גּוֹי", translit: "goy", meaning: "nação", ref: "Gênesis 12:2" } },
  { id: "dalet", glyph: "ד", name: "dálet", nativeName: "דָּלֶת", translit: "d", sound: "“d” de dado", example: { word: "דָּבָר", translit: "davar", meaning: "palavra", ref: "Salmo 119:105" } },
  { id: "he", glyph: "ה", name: "he", nativeName: "הֵא", translit: "h", sound: "“h” aspirado, do inglês “house”", example: { word: "הַר", translit: "har", meaning: "monte", ref: "Êxodo 19:2" } },
  { id: "vav", glyph: "ו", name: "vav", nativeName: "וָו", translit: "v / o / u", sound: "“v”; com ponto vira vogal “o” (וֹ) ou “u” (וּ)", example: { word: "וְ", translit: "ve", meaning: "e (conjunção)", ref: "Gênesis 1:1" } },
  { id: "zayin", glyph: "ז", name: "záyin", nativeName: "זַיִן", translit: "z", sound: "“z” de zebra", example: { word: "זֶרַע", translit: "zera", meaning: "semente", ref: "Gênesis 3:15" } },
  { id: "het", glyph: "ח", name: "het", nativeName: "חֵית", translit: "ḥ", sound: "“rr” da garganta, como o “j” espanhol", example: { word: "חֶסֶד", translit: "ḥesed", meaning: "amor leal", ref: "Salmo 136:1" } },
  { id: "tet", glyph: "ט", name: "tet", nativeName: "טֵית", translit: "ṭ", sound: "“t” de teto", example: { word: "טוֹב", translit: "tov", meaning: "bom", ref: "Gênesis 1:4" } },
  { id: "yod", glyph: "י", name: "yod", nativeName: "יוֹד", translit: "y", sound: "“i” de iate", example: { word: "יוֹם", translit: "yom", meaning: "dia", ref: "Gênesis 1:5" } },
  { id: "kaf", glyph: "כ", alt: "ך", name: "kaf / khaf", nativeName: "כַּף", translit: "k / kh", sound: "“k” com ponto (כּ), “kh” aspirado sem ponto", note: "No fim da palavra: ך.", example: { word: "כָּבוֹד", translit: "kavod", meaning: "glória", ref: "Salmo 19:1" } },
  { id: "lamed", glyph: "ל", name: "lámed", nativeName: "לָמֶד", translit: "l", sound: "“l” de luz", example: { word: "לֵב", translit: "lev", meaning: "coração", ref: "Salmo 51:10" } },
  { id: "mem", glyph: "מ", alt: "ם", name: "mem", nativeName: "מֵם", translit: "m", sound: "“m” de mãe", note: "No fim da palavra: ם.", example: { word: "מֶלֶךְ", translit: "melekh", meaning: "rei", ref: "Salmo 24:7" } },
  { id: "nun", glyph: "נ", alt: "ן", name: "nun", nativeName: "נוּן", translit: "n", sound: "“n” de nome", note: "No fim da palavra: ן.", example: { word: "נֶפֶשׁ", translit: "nefesh", meaning: "alma, vida", ref: "Salmo 103:1" } },
  { id: "samekh", glyph: "ס", name: "sámekh", nativeName: "סָמֶךְ", translit: "s", sound: "“s” de sol", example: { word: "סֵפֶר", translit: "sefer", meaning: "livro", ref: "Josué 1:8" } },
  { id: "ayin", glyph: "ע", name: "áyin", nativeName: "עַיִן", translit: "ʿ", sound: "gutural, hoje quase sem som", example: { word: "עַם", translit: "ʿam", meaning: "povo", ref: "Êxodo 6:7" } },
  { id: "pe", glyph: "פ", alt: "ף", name: "pe / fe", nativeName: "פֵּא", translit: "p / f", sound: "“p” com ponto (פּ), “f” sem ponto", note: "No fim da palavra: ף.", example: { word: "פֶּה", translit: "pe", meaning: "boca", ref: "Salmo 19:14" } },
  { id: "tsade", glyph: "צ", alt: "ץ", name: "tsade", nativeName: "צַדִי", translit: "ts", sound: "“ts”, de tsunami", note: "No fim da palavra: ץ.", example: { word: "צֶדֶק", translit: "tsedeq", meaning: "justiça", ref: "Salmo 23:3" } },
  { id: "qof", glyph: "ק", name: "qof", nativeName: "קוֹף", translit: "q", sound: "“k” do fundo da boca", example: { word: "קֹדֶשׁ", translit: "qodesh", meaning: "santidade", ref: "Êxodo 3:5" } },
  { id: "resh", glyph: "ר", name: "resh", nativeName: "רֵישׁ", translit: "r", sound: "“r” de rato", example: { word: "רוּחַ", translit: "ruaḥ", meaning: "espírito, vento", ref: "Gênesis 1:2" } },
  { id: "shin", glyph: "ש", name: "shin / sin", nativeName: "שִׁין", translit: "sh / s", sound: "“sh” com ponto à direita (שׁ), “s” à esquerda (שׂ)", example: { word: "שָׁלוֹם", translit: "shalom", meaning: "paz", ref: "Números 6:26" } },
  { id: "tav", glyph: "ת", name: "tav", nativeName: "תָּו", translit: "t", sound: "“t” de teto", example: { word: "תּוֹרָה", translit: "torah", meaning: "instrução, lei", ref: "Salmo 1:2" } }
];

export const ALPHABETS: Record<AlphabetId, Alphabet> = {
  grc: {
    id: "grc", title: "Alfabeto grego", direction: "ltr", letters: greekLetters,
    groups: [
      { title: "As primeiras", letters: ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"] },
      { title: "Sons novos", letters: ["eta", "theta", "iota", "kappa", "lambda", "mu"] },
      { title: "O meio do alfabeto", letters: ["nu", "xi", "omicron", "pi", "rho", "sigma"] },
      { title: "Até o ômega", letters: ["tau", "upsilon", "phi", "chi", "psi", "omega"] }
    ]
  },
  hbo: {
    id: "hbo", title: "Alfabeto hebraico", direction: "rtl", letters: hebrewLetters,
    groups: [
      { title: "As primeiras", letters: ["alef", "bet", "gimel", "dalet", "he", "vav"] },
      { title: "Sons da garganta", letters: ["zayin", "het", "tet", "yod", "kaf", "lamed"] },
      { title: "Formas finais", letters: ["mem", "nun", "samekh", "ayin", "pe", "tsade"] },
      { title: "Até o tav", letters: ["qof", "resh", "shin", "tav"] }
    ]
  }
};
