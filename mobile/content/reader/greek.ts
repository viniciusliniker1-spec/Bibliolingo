import { W, type ReaderPassage } from "./types";

/**
 * Leitor de grego koiné: textos do Novo Testamento (forma do NA28/SBLGNT, sem variantes entre colchetes),
 * com transliteração acadêmica simplificada e sentido literal palavra a palavra.
 */
export const GREEK_READER: ReaderPassage[] = [
  {
    id: "grc-w1", level: 1, kind: "words", title: "Nomes de Deus", ref: "",
    focus: "Ler letras juntas: θ = th, χ = ch, ου = u",
    words: [
      W("θεός", "theós", "Deus", "θ soa “th”"),
      W("λόγος", "lógos", "palavra, Verbo"),
      W("Ἰησοῦς", "Iēsoûs", "Jesus", "ου soa “u”; o sinal ᾿ no início não tem som"),
      W("Χριστός", "Christós", "Cristo, Ungido", "χ soa “ch” (k aspirado)"),
      W("κύριος", "kýrios", "Senhor"),
      W("πνεῦμα", "pneûma", "Espírito, vento", "o π e o ν soam juntos: pn")
    ],
    translation: "Deus · palavra · Jesus · Cristo · Senhor · Espírito"
  },
  {
    id: "grc-w2", level: 1, kind: "words", title: "Palavras da vida", ref: "",
    focus: "Vogais longas η (ē) e ω (ō); o espírito áspero ῾ soa “h”",
    words: [
      W("ζωή", "zōḗ", "vida"),
      W("φῶς", "phôs", "luz", "φ soa “f”"),
      W("ἀγάπη", "agápē", "amor"),
      W("κόσμος", "kósmos", "mundo"),
      W("πατήρ", "patḗr", "pai"),
      W("υἱός", "huiós", "filho", "῾ sobre a vogal soa “h”")
    ],
    translation: "vida · luz · amor · mundo · pai · filho"
  },
  {
    id: "grc-w3", level: 1, kind: "words", title: "Palavras do evangelho", ref: "",
    focus: "γγ soa “ng”; ditongos ευ e αι",
    words: [
      W("εὐαγγέλιον", "euangélion", "evangelho, boa notícia", "γγ soa “ng”"),
      W("χάρις", "cháris", "graça"),
      W("πίστις", "pístis", "fé"),
      W("ἀλήθεια", "alḗtheia", "verdade"),
      W("βασιλεία", "basileía", "reino"),
      W("ἐκκλησία", "ekklēsía", "igreja, assembleia")
    ],
    translation: "evangelho · graça · fé · verdade · reino · igreja"
  },
  {
    id: "grc-f1", level: 2, kind: "text", title: "Jesus chorou", ref: "João 11:35",
    focus: "O verbo pode vir antes do sujeito; ὁ é o artigo “o”",
    words: [W("ἐδάκρυσεν", "edákrysen", "chorou", "verbo: aoristo, 3ª pessoa"), W("ὁ", "ho", "o", "artigo masculino"), W("Ἰησοῦς", "Iēsoûs", "Jesus")],
    translation: "Jesus chorou."
  },
  {
    id: "grc-f2", level: 2, kind: "text", title: "Deus é amor", ref: "1 João 4:8",
    focus: "ἐστίν = “é”; o verbo “ser” costuma vir no fim",
    words: [W("ὁ", "ho", "o"), W("θεὸς", "theòs", "Deus", "o acento agudo vira grave antes de outra palavra"), W("ἀγάπη", "agápē", "amor"), W("ἐστίν", "estín", "é")],
    translation: "Deus é amor."
  },
  {
    id: "grc-f3", level: 2, kind: "text", title: "A luz do mundo", ref: "João 8:12",
    focus: "ἐγώ εἰμι = “eu sou”; τοῦ = “do” (genitivo)",
    words: [W("ἐγώ", "egṓ", "eu"), W("εἰμι", "eimi", "sou"), W("τὸ", "tò", "a", "artigo neutro"), W("φῶς", "phôs", "luz"), W("τοῦ", "toû", "do", "genitivo: indica posse"), W("κόσμου", "kósmou", "mundo")],
    translation: "Eu sou a luz do mundo."
  },
  {
    id: "grc-f4", level: 2, kind: "text", title: "O bom pastor", ref: "João 10:11",
    focus: "O adjetivo com artigo repetido dá ênfase: “o pastor, o bom”",
    words: [W("ἐγώ", "egṓ", "eu"), W("εἰμι", "eimi", "sou"), W("ὁ", "ho", "o"), W("ποιμὴν", "poimḕn", "pastor"), W("ὁ", "ho", "o"), W("καλός", "kalós", "bom")],
    translation: "Eu sou o bom pastor."
  },
  {
    id: "grc-f5", level: 2, kind: "text", title: "O caminho", ref: "João 14:6",
    focus: "καί = “e”; ἡ é o artigo feminino",
    words: [W("ἐγώ", "egṓ", "eu"), W("εἰμι", "eimi", "sou"), W("ἡ", "hē", "o", "artigo feminino"), W("ὁδὸς", "hodòs", "caminho"), W("καὶ", "kaì", "e"), W("ἡ", "hē", "a"), W("ἀλήθεια", "alḗtheia", "verdade"), W("καὶ", "kaì", "e"), W("ἡ", "hē", "a"), W("ζωή", "zōḗ", "vida")],
    translation: "Eu sou o caminho, e a verdade, e a vida."
  },
  {
    id: "grc-v1", level: 3, kind: "text", title: "O princípio do evangelho", ref: "Marcos 1:1",
    focus: "Cadeia de genitivos: “do evangelho de Jesus Cristo”",
    words: [W("Ἀρχὴ", "Archḕ", "princípio"), W("τοῦ", "toû", "do"), W("εὐαγγελίου", "euangelíou", "evangelho", "genitivo"), W("Ἰησοῦ", "Iēsoû", "de Jesus", "genitivo"), W("Χριστοῦ", "Christoû", "Cristo", "genitivo")],
    translation: "Princípio do evangelho de Jesus Cristo."
  },
  {
    id: "grc-v2", level: 3, kind: "text", title: "No princípio era o Verbo", ref: "João 1:1",
    focus: "ἦν = “era”; πρὸς τὸν θεόν = “junto de Deus”",
    words: [
      W("Ἐν", "En", "em, no"), W("ἀρχῇ", "archēi", "princípio", "dativo depois de ἐν; o ι subscrito não soa"), W("ἦν", "ên", "era", "imperfeito de εἰμί"), W("ὁ", "ho", "o"), W("λόγος", "lógos", "Verbo, Palavra"),
      W("καὶ", "kaì", "e"), W("ὁ", "ho", "o"), W("λόγος", "lógos", "Verbo"), W("ἦν", "ên", "estava"), W("πρὸς", "pròs", "junto de, voltado para"), W("τὸν", "tòn", "o", "acusativo"), W("θεόν", "theón", "Deus"),
      W("καὶ", "kaì", "e"), W("θεὸς", "theòs", "Deus", "predicativo sem artigo, vem primeiro para dar ênfase"), W("ἦν", "ên", "era"), W("ὁ", "ho", "o"), W("λόγος", "lógos", "Verbo")
    ],
    translation: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus."
  },
  {
    id: "grc-v3", level: 3, kind: "text", title: "O Verbo se fez carne", ref: "João 1:14",
    focus: "ἐγένετο = “tornou-se”; ἐν ἡμῖν = “entre nós”",
    words: [W("Καὶ", "Kaì", "e"), W("ὁ", "ho", "o"), W("λόγος", "lógos", "Verbo"), W("σὰρξ", "sàrx", "carne"), W("ἐγένετο", "egéneto", "se tornou", "aoristo de γίνομαι"), W("καὶ", "kaì", "e"), W("ἐσκήνωσεν", "eskḗnōsen", "habitou, armou tenda", "da palavra σκηνή, “tenda”"), W("ἐν", "en", "em, entre"), W("ἡμῖν", "hēmîn", "nós")],
    translation: "E o Verbo se fez carne e habitou entre nós."
  },
  {
    id: "grc-v4", level: 3, kind: "text", title: "Salvos pela graça", ref: "Efésios 2:8",
    focus: "τῇ χάριτι = “pela graça” (dativo de meio); διά + genitivo = “por meio de”",
    words: [W("Τῇ", "Tēi", "pela", "artigo no dativo"), W("γὰρ", "gàr", "pois", "posposto: vem em 2º lugar na frase"), W("χάριτί", "cháriti", "graça"), W("ἐστε", "este", "sois, estais"), W("σεσῳσμένοι", "sesōsménoi", "salvos", "particípio perfeito: salvos e permanecendo salvos"), W("διὰ", "dià", "por meio de"), W("πίστεως", "písteōs", "fé", "genitivo")],
    translation: "Pois pela graça sois salvos, por meio da fé."
  },
  {
    id: "grc-v5", level: 3, kind: "text", title: "O dom de Deus", ref: "Romanos 6:23",
    focus: "δέ = “mas” (posposto); ἐν Χριστῷ = “em Cristo”",
    words: [W("τὸ", "tò", "o"), W("δὲ", "dè", "mas"), W("χάρισμα", "chárisma", "dom gratuito"), W("τοῦ", "toû", "de"), W("θεοῦ", "theoû", "Deus"), W("ζωὴ", "zōḕ", "vida"), W("αἰώνιος", "aiṓnios", "eterna"), W("ἐν", "en", "em"), W("Χριστῷ", "Christōi", "Cristo", "dativo"), W("Ἰησοῦ", "Iēsoû", "Jesus"), W("τῷ", "tōi", "o"), W("κυρίῳ", "kyríōi", "Senhor"), W("ἡμῶν", "hēmôn", "nosso", "genitivo de ἡμεῖς")],
    translation: "Mas o dom gratuito de Deus é a vida eterna em Cristo Jesus, nosso Senhor."
  },
  {
    id: "grc-p1", level: 4, kind: "text", title: "A luz brilha nas trevas", ref: "João 1:4–5",
    focus: "Releia palavras conhecidas em contexto novo: ζωή, φῶς, ἦν",
    words: [
      W("ἐν", "en", "em"), W("αὐτῷ", "autōi", "ele"), W("ζωὴ", "zōḕ", "vida"), W("ἦν", "ên", "havia, era"), W("καὶ", "kaì", "e"), W("ἡ", "hē", "a"), W("ζωὴ", "zōḕ", "vida"), W("ἦν", "ên", "era"), W("τὸ", "tò", "a"), W("φῶς", "phôs", "luz"), W("τῶν", "tôn", "dos"), W("ἀνθρώπων", "anthrṓpōn", "homens, seres humanos", "genitivo plural"),
      W("καὶ", "kaì", "e"), W("τὸ", "tò", "a"), W("φῶς", "phôs", "luz"), W("ἐν", "en", "em"), W("τῇ", "tēi", "a"), W("σκοτίᾳ", "skotíāi", "escuridão"), W("φαίνει", "phaínei", "brilha", "presente: brilha agora"), W("καὶ", "kaì", "e"), W("ἡ", "hē", "a"), W("σκοτία", "skotía", "escuridão"), W("αὐτὸ", "autò", "a ela", "refere-se à luz (neutro)"), W("οὐ", "ou", "não"), W("κατέλαβεν", "katélaben", "venceu, alcançou")
    ],
    translation: "Nele estava a vida, e a vida era a luz dos homens. E a luz brilha nas trevas, e as trevas não a venceram."
  },
  {
    id: "grc-p2", level: 4, kind: "text", title: "Deus amou o mundo", ref: "João 3:16",
    focus: "ὥστε = “de modo que”; ἵνα = “para que”; πᾶς ὁ πιστεύων = “todo o que crê”",
    words: [
      W("Οὕτως", "Hoútōs", "assim, deste modo"), W("γὰρ", "gàr", "pois"), W("ἠγάπησεν", "ēgápēsen", "amou", "aoristo de ἀγαπάω"), W("ὁ", "ho", "o"), W("θεὸς", "theòs", "Deus"), W("τὸν", "tòn", "o"), W("κόσμον", "kósmon", "mundo", "acusativo: objeto"),
      W("ὥστε", "hṓste", "de modo que"), W("τὸν", "tòn", "o"), W("υἱὸν", "huiòn", "Filho"), W("τὸν", "tòn", "o"), W("μονογενῆ", "monogenê", "único"), W("ἔδωκεν", "édōken", "deu"),
      W("ἵνα", "hína", "para que"), W("πᾶς", "pâs", "todo"), W("ὁ", "ho", "o"), W("πιστεύων", "pisteúōn", "que crê", "particípio presente"), W("εἰς", "eis", "em"), W("αὐτὸν", "autòn", "ele"),
      W("μὴ", "mḕ", "não"), W("ἀπόληται", "apólētai", "pereça"), W("ἀλλ᾽", "all’", "mas"), W("ἔχῃ", "échēi", "tenha"), W("ζωὴν", "zōḕn", "vida"), W("αἰώνιον", "aiṓnion", "eterna")
    ],
    translation: "Porque Deus amou o mundo de tal maneira que deu o seu Filho único, para que todo o que nele crê não pereça, mas tenha a vida eterna."
  },
  {
    id: "grc-p3", level: 4, kind: "text", title: "Pai nosso", ref: "Mateus 6:9–11",
    focus: "Imperativos de 3ª pessoa: ἁγιασθήτω “seja santificado”, ἐλθέτω “venha”",
    words: [
      W("Πάτερ", "Páter", "Pai", "vocativo: forma de chamar"), W("ἡμῶν", "hēmôn", "nosso"), W("ὁ", "ho", "que estás"), W("ἐν", "en", "em"), W("τοῖς", "toîs", "os"), W("οὐρανοῖς", "ouranoîs", "céus"),
      W("ἁγιασθήτω", "hagiasthḗtō", "seja santificado"), W("τὸ", "tò", "o"), W("ὄνομά", "ónomá", "nome"), W("σου", "sou", "teu"),
      W("ἐλθέτω", "elthétō", "venha"), W("ἡ", "hē", "o"), W("βασιλεία", "basileía", "reino"), W("σου", "sou", "teu"),
      W("γενηθήτω", "genēthḗtō", "seja feita"), W("τὸ", "tò", "a"), W("θέλημά", "thélēmá", "vontade"), W("σου", "sou", "tua"), W("ὡς", "hōs", "como"), W("ἐν", "en", "no"), W("οὐρανῷ", "ouranōi", "céu"), W("καὶ", "kaì", "também"), W("ἐπὶ", "epì", "sobre"), W("γῆς", "gês", "a terra"),
      W("τὸν", "tòn", "o"), W("ἄρτον", "árton", "pão"), W("ἡμῶν", "hēmôn", "nosso"), W("τὸν", "tòn", "o"), W("ἐπιούσιον", "epioúsion", "de cada dia"), W("δὸς", "dòs", "dá"), W("ἡμῖν", "hēmîn", "nos"), W("σήμερον", "sḗmeron", "hoje")
    ],
    translation: "Pai nosso, que estás nos céus, santificado seja o teu nome; venha o teu reino; seja feita a tua vontade, assim na terra como no céu. O pão nosso de cada dia dá-nos hoje."
  }
];
