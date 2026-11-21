import { W, type ReaderPassage } from "./types";

/**
 * Leitor de hebraico bíblico: textos da Bíblia Hebraica (pontuação vocálica do códice de Leningrado,
 * sem acentos de cantilação), com transliteração simplificada e sentido literal palavra a palavra.
 * As palavras estão na ordem de leitura (da direita para a esquerda).
 */
const YHWH = W("יְהוָה", "Adonai", "o SENHOR", "o nome de Deus (YHWH); por reverência, lê-se “Adonai”");

export const HEBREW_READER: ReaderPassage[] = [
  {
    id: "hbo-w1", level: 1, kind: "words", title: "Deus e a criação", ref: "",
    focus: "Leia da direita para a esquerda; os pontos embaixo são as vogais",
    words: [
      W("אֱלֹהִים", "Elohím", "Deus", "termina em ־ִים, como um plural de majestade"),
      YHWH,
      W("אוֹר", "or", "luz", "וֹ com ponto em cima = “o”"),
      W("אֶרֶץ", "érets", "terra", "ץ é a forma final do tsade"),
      W("שָׁמַיִם", "shamáyim", "céus", "שׁ com ponto à direita = “sh”"),
      W("יוֹם", "yom", "dia", "ם é a forma final do mem")
    ],
    translation: "Deus · o SENHOR · luz · terra · céus · dia"
  },
  {
    id: "hbo-w2", level: 1, kind: "words", title: "Palavras do coração", ref: "",
    focus: "ח soa “rr” da garganta; ךְ é o kaf final",
    words: [
      W("שָׁלוֹם", "shalóm", "paz, bem-estar"),
      W("טוֹב", "tov", "bom"),
      W("לֵב", "lev", "coração"),
      W("דָּבָר", "davár", "palavra", "o ponto dentro do ד (dagesh) não muda o som aqui"),
      W("חֶסֶד", "ḥésed", "amor leal, bondade"),
      W("מֶלֶךְ", "mélekh", "rei")
    ],
    translation: "paz · bom · coração · palavra · amor leal · rei"
  },
  {
    id: "hbo-w3", level: 1, kind: "words", title: "Pessoas e lugares", ref: "",
    focus: "בּ com ponto = “b”; ב sem ponto = “v”",
    words: [
      W("אָדָם", "adám", "ser humano, Adão"),
      W("יִשְׂרָאֵל", "Yisraél", "Israel", "שׂ com ponto à esquerda = “s”"),
      W("דָּוִד", "Davíd", "Davi"),
      W("עַם", "am", "povo", "ע não tem som próprio"),
      W("בַּיִת", "báyit", "casa"),
      W("תּוֹרָה", "Torá", "instrução, Lei")
    ],
    translation: "ser humano · Israel · Davi · povo · casa · instrução"
  },
  {
    id: "hbo-f1", level: 2, kind: "text", title: "Haja luz", ref: "Gênesis 1:3",
    focus: "וַ no início = “e” + passado narrativo; o maqef (־) liga duas palavras",
    words: [W("וַיֹּאמֶר", "vayómer", "e disse"), W("אֱלֹהִים", "Elohím", "Deus"), W("יְהִי", "yehí", "haja, seja"), W("אוֹר", "or", "luz"), W("וַיְהִי־", "vayhí", "e houve"), W("אוֹר", "or", "luz")],
    translation: "E disse Deus: Haja luz. E houve luz."
  },
  {
    id: "hbo-f2", level: 2, kind: "text", title: "O Senhor é o meu pastor", ref: "Salmo 23:1",
    focus: "Sufixo ־ִי = “meu”; לְ = “para, de”",
    words: [W("מִזְמוֹר", "mizmór", "salmo"), W("לְדָוִד", "leDavíd", "de Davi", "לְ = “de, para”"), YHWH, W("רֹעִי", "roí", "meu pastor", "־ִי = “meu”"), W("לֹא", "lo", "não"), W("אֶחְסָר", "eḥsár", "terei falta")],
    translation: "Salmo de Davi. O SENHOR é o meu pastor; nada me faltará."
  },
  {
    id: "hbo-f3", level: 2, kind: "text", title: "Ouve, Israel", ref: "Deuteronômio 6:4",
    focus: "Frases sem o verbo “ser”: “o SENHOR [é] um”; ־ֵינוּ = “nosso”",
    words: [W("שְׁמַע", "shemá", "ouve"), W("יִשְׂרָאֵל", "Yisraél", "Israel"), YHWH, W("אֱלֹהֵינוּ", "Elohénu", "nosso Deus", "־ֵינוּ = “nosso”"), YHWH, W("אֶחָד", "eḥád", "um, único")],
    translation: "Ouve, Israel: o SENHOR, nosso Deus, é o único SENHOR."
  },
  {
    id: "hbo-f4", level: 2, kind: "text", title: "O princípio da sabedoria", ref: "Provérbios 1:7",
    focus: "Estado construto: “temor de”, “princípio de” (duas palavras ligadas)",
    words: [W("יִרְאַת", "yirát", "o temor de", "construto: termina em ־ַת"), YHWH, W("רֵאשִׁית", "reshít", "princípio de"), W("דָּעַת", "dáat", "conhecimento")],
    translation: "O temor do SENHOR é o princípio do conhecimento."
  },
  {
    id: "hbo-v1", level: 3, kind: "text", title: "No princípio", ref: "Gênesis 1:1",
    focus: "בְּ = “em”; הַ = “o” (artigo); אֵת marca o objeto e não se traduz",
    words: [W("בְּרֵאשִׁית", "bereshít", "no princípio", "בְּ = “em” + רֵאשִׁית “princípio”"), W("בָּרָא", "bará", "criou"), W("אֱלֹהִים", "Elohím", "Deus"), W("אֵת", "et", "(objeto)", "marca o objeto direto"), W("הַשָּׁמַיִם", "hashamáyim", "os céus", "הַ = artigo “o”"), W("וְאֵת", "veét", "e (objeto)", "וְ = “e”"), W("הָאָרֶץ", "haárets", "a terra")],
    translation: "No princípio, criou Deus os céus e a terra."
  },
  {
    id: "hbo-v2", level: 3, kind: "text", title: "Lâmpada para os meus pés", ref: "Salmo 119:105",
    focus: "Sufixos: ־ִי “meu”, ־ֶךָ “teu”; paralelismo da poesia hebraica",
    words: [W("נֵר־", "ner", "lâmpada"), W("לְרַגְלִי", "leraglí", "para o meu pé", "לְ + רֶגֶל + ־ִי"), W("דְבָרֶךָ", "devarékha", "a tua palavra", "־ֶךָ = “teu”"), W("וְאוֹר", "veór", "e luz"), W("לִנְתִיבָתִי", "lintivatí", "para o meu caminho")],
    translation: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."
  },
  {
    id: "hbo-v3", level: 3, kind: "text", title: "O seu amor dura para sempre", ref: "Salmo 136:1",
    focus: "כִּי = “porque”; ־וֹ = “dele”",
    words: [W("הוֹדוּ", "hodú", "rendei graças"), W("לַיהוָה", "laAdonai", "ao SENHOR", "לַ = “a, para”"), W("כִּי־", "ki", "porque"), W("טוֹב", "tov", "bom"), W("כִּי", "ki", "porque"), W("לְעוֹלָם", "leolám", "para sempre"), W("חַסְדּוֹ", "ḥasdó", "o seu amor leal", "חֶסֶד + ־וֹ “dele”")],
    translation: "Rendei graças ao SENHOR, porque ele é bom; o seu amor dura para sempre."
  },
  {
    id: "hbo-v4", level: 3, kind: "text", title: "A palavra permanece", ref: "Isaías 40:8",
    focus: "Verbos no início da frase; וּ = “e” antes de certas consoantes",
    words: [W("יָבֵשׁ", "yavésh", "seca"), W("חָצִיר", "ḥatsír", "a erva"), W("נָבֵל", "navél", "murcha"), W("צִיץ", "tsits", "a flor"), W("וּדְבַר־", "udvar", "mas a palavra de", "וּ = “e, mas”"), W("אֱלֹהֵינוּ", "Elohénu", "nosso Deus"), W("יָקוּם", "yaqúm", "permanece"), W("לְעוֹלָם", "leolám", "para sempre")],
    translation: "Seca-se a erva, e murcha a flor, mas a palavra do nosso Deus permanece para sempre."
  },
  {
    id: "hbo-v5", level: 3, kind: "text", title: "Muito bom", ref: "Gênesis 1:31",
    focus: "כָּל = “tudo”; אֲשֶׁר = “que”; הִנֵּה = “eis”",
    words: [W("וַיַּרְא", "vayár", "e viu"), W("אֱלֹהִים", "Elohím", "Deus"), W("אֶת־", "et", "(objeto)"), W("כָּל־", "kol", "tudo"), W("אֲשֶׁר", "ashér", "que"), W("עָשָׂה", "asá", "fizera"), W("וְהִנֵּה־", "vehinné", "e eis que"), W("טוֹב", "tov", "bom"), W("מְאֹד", "meód", "muito")],
    translation: "E viu Deus tudo o que tinha feito, e eis que era muito bom."
  },
  {
    id: "hbo-p0", level: 4, kind: "text", title: "Pastos verdejantes", ref: "Salmo 23:1–2",
    focus: "Sufixo ־ֵנִי = “me”: o pastor age em favor de quem fala",
    words: [
      W("מִזְמוֹר", "mizmór", "salmo"), W("לְדָוִד", "leDavíd", "de Davi"), YHWH, W("רֹעִי", "roí", "meu pastor"), W("לֹא", "lo", "não"), W("אֶחְסָר", "eḥsár", "terei falta"),
      W("בִּנְאוֹת", "binót", "em pastagens de"), W("דֶּשֶׁא", "déshe", "relva verde"), W("יַרְבִּיצֵנִי", "yarbitséni", "me faz deitar", "־ֵנִי = “me”"), W("עַל־", "al", "junto a"), W("מֵי", "me", "águas de"), W("מְנֻחוֹת", "menuḥót", "descanso"), W("יְנַהֲלֵנִי", "yenahaléni", "me conduz")
    ],
    translation: "Salmo de Davi. O SENHOR é o meu pastor; nada me faltará. Em verdes pastos me faz repousar; conduz-me junto às águas tranquilas."
  },
  {
    id: "hbo-p1", level: 4, kind: "text", title: "A bênção sacerdotal", ref: "Números 6:24–26",
    focus: "Verbos com sufixo ־ְךָ “te”; o mesmo padrão repetido três vezes",
    words: [
      W("יְבָרֶכְךָ", "yevarekhekhá", "te abençoe"), YHWH, W("וְיִשְׁמְרֶךָ", "veyishmerékha", "e te guarde"),
      W("יָאֵר", "yaér", "faça resplandecer"), YHWH, W("פָּנָיו", "panáv", "o seu rosto"), W("אֵלֶיךָ", "eléikha", "sobre ti"), W("וִיחֻנֶּךָּ", "viḥunnékka", "e tenha misericórdia de ti"),
      W("יִשָּׂא", "yissá", "levante"), YHWH, W("פָּנָיו", "panáv", "o seu rosto"), W("אֵלֶיךָ", "eléikha", "sobre ti"), W("וְיָשֵׂם", "veyasém", "e ponha"), W("לְךָ", "lekhá", "em ti"), W("שָׁלוֹם", "shalóm", "paz")
    ],
    translation: "O SENHOR te abençoe e te guarde; o SENHOR faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o SENHOR levante o seu rosto sobre ti e te dê a paz."
  },
  {
    id: "hbo-p2", level: 4, kind: "text", title: "Shemá", ref: "Deuteronômio 6:4–5",
    focus: "בְּכָל = “com todo”; ־ְךָ = “teu”: veja como o sufixo se repete",
    words: [
      W("שְׁמַע", "shemá", "ouve"), W("יִשְׂרָאֵל", "Yisraél", "Israel"), YHWH, W("אֱלֹהֵינוּ", "Elohénu", "nosso Deus"), YHWH, W("אֶחָד", "eḥád", "um"),
      W("וְאָהַבְתָּ", "veahavtá", "e amarás"), W("אֵת", "et", "(objeto)"), YHWH, W("אֱלֹהֶיךָ", "Elohéikha", "teu Deus"), W("בְּכָל־", "bekhol", "com todo"), W("לְבָבְךָ", "levavkhá", "o teu coração"), W("וּבְכָל־", "uvkhol", "e com toda"), W("נַפְשְׁךָ", "nafshekhá", "a tua alma, vida"), W("וּבְכָל־", "uvkhol", "e com toda"), W("מְאֹדֶךָ", "meodékha", "a tua força")
    ],
    translation: "Ouve, Israel: o SENHOR, nosso Deus, é o único SENHOR. Amarás o SENHOR, teu Deus, de todo o teu coração, de toda a tua alma e de toda a tua força."
  }
];
