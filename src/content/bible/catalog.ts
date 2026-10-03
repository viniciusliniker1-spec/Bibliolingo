export type BibleTestament = "old" | "new";

export interface BibleBookMeta {
  id: string;
  osis: string;
  name: string;
  abbreviation: string;
  testament: BibleTestament;
  chapters: number;
}

export const bibleBooks: BibleBookMeta[] = [
  { id: "genesis", osis: "Gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 50 },
  { id: "exodus", osis: "Exod", name: "Êxodo", abbreviation: "Êx", testament: "old", chapters: 40 },
  { id: "leviticus", osis: "Lev", name: "Levítico", abbreviation: "Lv", testament: "old", chapters: 27 },
  { id: "numbers", osis: "Num", name: "Números", abbreviation: "Nm", testament: "old", chapters: 36 },
  { id: "deuteronomy", osis: "Deut", name: "Deuteronômio", abbreviation: "Dt", testament: "old", chapters: 34 },
  { id: "joshua", osis: "Josh", name: "Josué", abbreviation: "Js", testament: "old", chapters: 24 },
  { id: "judges", osis: "Judg", name: "Juízes", abbreviation: "Jz", testament: "old", chapters: 21 },
  { id: "ruth", osis: "Ruth", name: "Rute", abbreviation: "Rt", testament: "old", chapters: 4 },
  { id: "1-samuel", osis: "1Sam", name: "1 Samuel", abbreviation: "1Sm", testament: "old", chapters: 31 },
  { id: "2-samuel", osis: "2Sam", name: "2 Samuel", abbreviation: "2Sm", testament: "old", chapters: 24 },
  { id: "1-kings", osis: "1Kgs", name: "1 Reis", abbreviation: "1Rs", testament: "old", chapters: 22 },
  { id: "2-kings", osis: "2Kgs", name: "2 Reis", abbreviation: "2Rs", testament: "old", chapters: 25 },
  { id: "1-chronicles", osis: "1Chr", name: "1 Crônicas", abbreviation: "1Cr", testament: "old", chapters: 29 },
  { id: "2-chronicles", osis: "2Chr", name: "2 Crônicas", abbreviation: "2Cr", testament: "old", chapters: 36 },
  { id: "ezra", osis: "Ezra", name: "Esdras", abbreviation: "Ed", testament: "old", chapters: 10 },
  { id: "nehemiah", osis: "Neh", name: "Neemias", abbreviation: "Ne", testament: "old", chapters: 13 },
  { id: "esther", osis: "Esth", name: "Ester", abbreviation: "Et", testament: "old", chapters: 10 },
  { id: "job", osis: "Job", name: "Jó", abbreviation: "Jó", testament: "old", chapters: 42 },
  { id: "psalms", osis: "Ps", name: "Salmos", abbreviation: "Sl", testament: "old", chapters: 150 },
  { id: "proverbs", osis: "Prov", name: "Provérbios", abbreviation: "Pv", testament: "old", chapters: 31 },
  { id: "ecclesiastes", osis: "Eccl", name: "Eclesiastes", abbreviation: "Ec", testament: "old", chapters: 12 },
  { id: "song", osis: "Song", name: "Cânticos", abbreviation: "Ct", testament: "old", chapters: 8 },
  { id: "isaiah", osis: "Isa", name: "Isaías", abbreviation: "Is", testament: "old", chapters: 66 },
  { id: "jeremiah", osis: "Jer", name: "Jeremias", abbreviation: "Jr", testament: "old", chapters: 52 },
  { id: "lamentations", osis: "Lam", name: "Lamentações", abbreviation: "Lm", testament: "old", chapters: 5 },
  { id: "ezekiel", osis: "Ezek", name: "Ezequiel", abbreviation: "Ez", testament: "old", chapters: 48 },
  { id: "daniel", osis: "Dan", name: "Daniel", abbreviation: "Dn", testament: "old", chapters: 12 },
  { id: "hosea", osis: "Hos", name: "Oseias", abbreviation: "Os", testament: "old", chapters: 14 },
  { id: "joel", osis: "Joel", name: "Joel", abbreviation: "Jl", testament: "old", chapters: 3 },
  { id: "amos", osis: "Amos", name: "Amós", abbreviation: "Am", testament: "old", chapters: 9 },
  { id: "obadiah", osis: "Obad", name: "Obadias", abbreviation: "Ob", testament: "old", chapters: 1 },
  { id: "jonah", osis: "Jonah", name: "Jonas", abbreviation: "Jn", testament: "old", chapters: 4 },
  { id: "micah", osis: "Mic", name: "Miqueias", abbreviation: "Mq", testament: "old", chapters: 7 },
  { id: "nahum", osis: "Nah", name: "Naum", abbreviation: "Na", testament: "old", chapters: 3 },
  { id: "habakkuk", osis: "Hab", name: "Habacuque", abbreviation: "Hc", testament: "old", chapters: 3 },
  { id: "zephaniah", osis: "Zeph", name: "Sofonias", abbreviation: "Sf", testament: "old", chapters: 3 },
  { id: "haggai", osis: "Hag", name: "Ageu", abbreviation: "Ag", testament: "old", chapters: 2 },
  { id: "zechariah", osis: "Zech", name: "Zacarias", abbreviation: "Zc", testament: "old", chapters: 14 },
  { id: "malachi", osis: "Mal", name: "Malaquias", abbreviation: "Ml", testament: "old", chapters: 4 },
  { id: "matthew", osis: "Matt", name: "Mateus", abbreviation: "Mt", testament: "new", chapters: 28 },
  { id: "mark", osis: "Mark", name: "Marcos", abbreviation: "Mc", testament: "new", chapters: 16 },
  { id: "luke", osis: "Luke", name: "Lucas", abbreviation: "Lc", testament: "new", chapters: 24 },
  { id: "john", osis: "John", name: "João", abbreviation: "Jo", testament: "new", chapters: 21 },
  { id: "acts", osis: "Acts", name: "Atos", abbreviation: "At", testament: "new", chapters: 28 },
  { id: "romans", osis: "Rom", name: "Romanos", abbreviation: "Rm", testament: "new", chapters: 16 },
  { id: "1-corinthians", osis: "1Cor", name: "1 Coríntios", abbreviation: "1Co", testament: "new", chapters: 16 },
  { id: "2-corinthians", osis: "2Cor", name: "2 Coríntios", abbreviation: "2Co", testament: "new", chapters: 13 },
  { id: "galatians", osis: "Gal", name: "Gálatas", abbreviation: "Gl", testament: "new", chapters: 6 },
  { id: "ephesians", osis: "Eph", name: "Efésios", abbreviation: "Ef", testament: "new", chapters: 6 },
  { id: "philippians", osis: "Phil", name: "Filipenses", abbreviation: "Fp", testament: "new", chapters: 4 },
  { id: "colossians", osis: "Col", name: "Colossenses", abbreviation: "Cl", testament: "new", chapters: 4 },
  { id: "1-thessalonians", osis: "1Thess", name: "1 Tessalonicenses", abbreviation: "1Ts", testament: "new", chapters: 5 },
  { id: "2-thessalonians", osis: "2Thess", name: "2 Tessalonicenses", abbreviation: "2Ts", testament: "new", chapters: 3 },
  { id: "1-timothy", osis: "1Tim", name: "1 Timóteo", abbreviation: "1Tm", testament: "new", chapters: 6 },
  { id: "2-timothy", osis: "2Tim", name: "2 Timóteo", abbreviation: "2Tm", testament: "new", chapters: 4 },
  { id: "titus", osis: "Titus", name: "Tito", abbreviation: "Tt", testament: "new", chapters: 3 },
  { id: "philemon", osis: "Phlm", name: "Filemom", abbreviation: "Fm", testament: "new", chapters: 1 },
  { id: "hebrews", osis: "Heb", name: "Hebreus", abbreviation: "Hb", testament: "new", chapters: 13 },
  { id: "james", osis: "Jas", name: "Tiago", abbreviation: "Tg", testament: "new", chapters: 5 },
  { id: "1-peter", osis: "1Pet", name: "1 Pedro", abbreviation: "1Pe", testament: "new", chapters: 5 },
  { id: "2-peter", osis: "2Pet", name: "2 Pedro", abbreviation: "2Pe", testament: "new", chapters: 3 },
  { id: "1-john", osis: "1John", name: "1 João", abbreviation: "1Jo", testament: "new", chapters: 5 },
  { id: "2-john", osis: "2John", name: "2 João", abbreviation: "2Jo", testament: "new", chapters: 1 },
  { id: "3-john", osis: "3John", name: "3 João", abbreviation: "3Jo", testament: "new", chapters: 1 },
  { id: "jude", osis: "Jude", name: "Judas", abbreviation: "Jd", testament: "new", chapters: 1 },
  { id: "revelation", osis: "Rev", name: "Apocalipse", abbreviation: "Ap", testament: "new", chapters: 22 }
];

export const bibleBookByOsis = new Map(bibleBooks.map((book) => [book.osis, book]));
