import type { LumiRarity, LumiSkinId } from "../../src/domain/lumi";

/**
* Skins da Bíblia: uma por livro, sem preço. A skin é liberada quando a pessoa conclui o livro correspondente
* (todas as lições e checkpoints). Lamentações e Ezequiel ainda não têm arte e ficam fora por enquanto.
* `legacyAchievementId` mantém o critério antigo das cinco primeiras (quem já tinha a conquista continua liberando).
*/
export interface BibleSkin {
  skinId: LumiSkinId;
  /** Id do livro na jornada (src/content/catalog). */
  bookId: string;
  /** Título do livro, como aparece na jornada. */
  title: string;
  name: string;
  rarity: LumiRarity;
  testament: "old" | "new";
  legacyAchievementId?: string;
}

export const BIBLE_SKINS: readonly BibleSkin[] = [
  { skinId: "lumi_eva", bookId: "genesis", title: "Gênesis", name: "Lumi Jardim do Éden", rarity: "rare", testament: "old", legacyAchievementId: "genesis-complete" },
  { skinId: "lumi_moises", bookId: "exodus", title: "Êxodo", name: "Lumi Moisés", rarity: "epic", testament: "old", legacyAchievementId: "exodus-complete" },
  { skinId: "lumi_levitico", bookId: "leviticus", title: "Levítico", name: "Lumi Sacerdotal", rarity: "epic", testament: "old", legacyAchievementId: "leviticus-complete" },
  { skinId: "lumi_numeros", bookId: "numbers", title: "Números", name: "Lumi Peregrina", rarity: "epic", testament: "old", legacyAchievementId: "numbers-complete" },
  { skinId: "lumi_deuteronomio", bookId: "deuteronomy", title: "Deuteronômio", name: "Lumi da Aliança", rarity: "legendary", testament: "old", legacyAchievementId: "deuteronomy-complete" },
  { skinId: "lumi_joshua", bookId: "joshua", title: "Josué", name: "Lumi Josué", rarity: "rare", testament: "old" },
  { skinId: "lumi_judges", bookId: "judges", title: "Juízes", name: "Lumi Juízes", rarity: "rare", testament: "old" },
  { skinId: "lumi_ruth", bookId: "ruth", title: "Rute", name: "Lumi Rute", rarity: "common", testament: "old" },
  { skinId: "lumi_1_samuel", bookId: "1-samuel", title: "1 Samuel", name: "Lumi 1 Samuel", rarity: "epic", testament: "old" },
  { skinId: "lumi_2_samuel", bookId: "2-samuel", title: "2 Samuel", name: "Lumi 2 Samuel", rarity: "epic", testament: "old" },
  { skinId: "lumi_1_kings", bookId: "1-kings", title: "1 Reis", name: "Lumi 1 Reis", rarity: "epic", testament: "old" },
  { skinId: "lumi_2_kings", bookId: "2-kings", title: "2 Reis", name: "Lumi 2 Reis", rarity: "epic", testament: "old" },
  { skinId: "lumi_1_chronicles", bookId: "1-chronicles", title: "1 Crônicas", name: "Lumi 1 Crônicas", rarity: "epic", testament: "old" },
  { skinId: "lumi_2_chronicles", bookId: "2-chronicles", title: "2 Crônicas", name: "Lumi 2 Crônicas", rarity: "epic", testament: "old" },
  { skinId: "lumi_ezra", bookId: "ezra", title: "Esdras", name: "Lumi Esdras", rarity: "rare", testament: "old" },
  { skinId: "lumi_nehemiah", bookId: "nehemiah", title: "Neemias", name: "Lumi Neemias", rarity: "rare", testament: "old" },
  { skinId: "lumi_esther", bookId: "esther", title: "Ester", name: "Lumi Ester", rarity: "rare", testament: "old" },
  { skinId: "lumi_job", bookId: "job", title: "Jó", name: "Lumi Jó", rarity: "epic", testament: "old" },
  { skinId: "lumi_psalms", bookId: "psalms", title: "Salmos", name: "Lumi Salmos", rarity: "legendary", testament: "old" },
  { skinId: "lumi_proverbs", bookId: "proverbs", title: "Provérbios", name: "Lumi Provérbios", rarity: "epic", testament: "old" },
  { skinId: "lumi_ecclesiastes", bookId: "ecclesiastes", title: "Eclesiastes", name: "Lumi Eclesiastes", rarity: "rare", testament: "old" },
  { skinId: "lumi_song_of_songs", bookId: "song-of-songs", title: "Cântico dos Cânticos", name: "Lumi Cânticos", rarity: "common", testament: "old" },
  { skinId: "lumi_isaiah", bookId: "isaiah", title: "Isaías", name: "Lumi Isaías", rarity: "legendary", testament: "old" },
  { skinId: "lumi_jeremiah", bookId: "jeremiah", title: "Jeremias", name: "Lumi Jeremias", rarity: "legendary", testament: "old" },
  { skinId: "lumi_daniel", bookId: "daniel", title: "Daniel", name: "Lumi Daniel", rarity: "rare", testament: "old" },
  { skinId: "lumi_hosea", bookId: "hosea", title: "Oseias", name: "Lumi Oseias", rarity: "rare", testament: "old" },
  { skinId: "lumi_joel", bookId: "joel", title: "Joel", name: "Lumi Joel", rarity: "common", testament: "old" },
  { skinId: "lumi_amos", bookId: "amos", title: "Amós", name: "Lumi Amós", rarity: "rare", testament: "old" },
  { skinId: "lumi_obadiah", bookId: "obadiah", title: "Obadias", name: "Lumi Obadias", rarity: "common", testament: "old" },
  { skinId: "lumi_jonah", bookId: "jonah", title: "Jonas", name: "Lumi Jonas", rarity: "common", testament: "old" },
  { skinId: "lumi_micah", bookId: "micah", title: "Miqueias", name: "Lumi Miqueias", rarity: "common", testament: "old" },
  { skinId: "lumi_nahum", bookId: "nahum", title: "Naum", name: "Lumi Naum", rarity: "common", testament: "old" },
  { skinId: "lumi_habakkuk", bookId: "habakkuk", title: "Habacuque", name: "Lumi Habacuque", rarity: "common", testament: "old" },
  { skinId: "lumi_zephaniah", bookId: "zephaniah", title: "Sofonias", name: "Lumi Sofonias", rarity: "common", testament: "old" },
  { skinId: "lumi_haggai", bookId: "haggai", title: "Ageu", name: "Lumi Ageu", rarity: "common", testament: "old" },
  { skinId: "lumi_zechariah", bookId: "zechariah", title: "Zacarias", name: "Lumi Zacarias", rarity: "rare", testament: "old" },
  { skinId: "lumi_malachi", bookId: "malachi", title: "Malaquias", name: "Lumi Malaquias", rarity: "common", testament: "old" },
  { skinId: "lumi_matthew", bookId: "matthew", title: "Mateus", name: "Lumi Mateus", rarity: "epic", testament: "new" },
  { skinId: "lumi_mark", bookId: "mark", title: "Marcos", name: "Lumi Marcos", rarity: "rare", testament: "new" },
  { skinId: "lumi_luke", bookId: "luke", title: "Lucas", name: "Lumi Lucas", rarity: "epic", testament: "new" },
  { skinId: "lumi_john", bookId: "john", title: "João", name: "Lumi João", rarity: "rare", testament: "new" },
  { skinId: "lumi_acts", bookId: "acts", title: "Atos", name: "Lumi Atos", rarity: "epic", testament: "new" },
  { skinId: "lumi_romans", bookId: "romans", title: "Romanos", name: "Lumi Romanos", rarity: "rare", testament: "new" },
  { skinId: "lumi_1_corinthians", bookId: "1-corinthians", title: "1 Coríntios", name: "Lumi 1 Coríntios", rarity: "rare", testament: "new" },
  { skinId: "lumi_2_corinthians", bookId: "2-corinthians", title: "2 Coríntios", name: "Lumi 2 Coríntios", rarity: "rare", testament: "new" },
  { skinId: "lumi_galatians", bookId: "galatians", title: "Gálatas", name: "Lumi Gálatas", rarity: "common", testament: "new" },
  { skinId: "lumi_ephesians", bookId: "ephesians", title: "Efésios", name: "Lumi Efésios", rarity: "common", testament: "new" },
  { skinId: "lumi_philippians", bookId: "philippians", title: "Filipenses", name: "Lumi Filipenses", rarity: "common", testament: "new" },
  { skinId: "lumi_colossians", bookId: "colossians", title: "Colossenses", name: "Lumi Colossenses", rarity: "common", testament: "new" },
  { skinId: "lumi_1_thessalonians", bookId: "1-thessalonians", title: "1 Tessalonicenses", name: "Lumi 1 Tessalonicenses", rarity: "common", testament: "new" },
  { skinId: "lumi_2_thessalonians", bookId: "2-thessalonians", title: "2 Tessalonicenses", name: "Lumi 2 Tessalonicenses", rarity: "common", testament: "new" },
  { skinId: "lumi_1_timothy", bookId: "1-timothy", title: "1 Timóteo", name: "Lumi 1 Timóteo", rarity: "common", testament: "new" },
  { skinId: "lumi_2_timothy", bookId: "2-timothy", title: "2 Timóteo", name: "Lumi 2 Timóteo", rarity: "common", testament: "new" },
  { skinId: "lumi_titus", bookId: "titus", title: "Tito", name: "Lumi Tito", rarity: "common", testament: "new" },
  { skinId: "lumi_philemon", bookId: "philemon", title: "Filemom", name: "Lumi Filemom", rarity: "common", testament: "new" },
  { skinId: "lumi_hebrews", bookId: "hebrews", title: "Hebreus", name: "Lumi Hebreus", rarity: "rare", testament: "new" },
  { skinId: "lumi_james", bookId: "james", title: "Tiago", name: "Lumi Tiago", rarity: "common", testament: "new" },
  { skinId: "lumi_1_peter", bookId: "1-peter", title: "1 Pedro", name: "Lumi 1 Pedro", rarity: "common", testament: "new" },
  { skinId: "lumi_2_peter", bookId: "2-peter", title: "2 Pedro", name: "Lumi 2 Pedro", rarity: "common", testament: "new" },
  { skinId: "lumi_1_john", bookId: "1-john", title: "1 João", name: "Lumi 1 João", rarity: "common", testament: "new" },
  { skinId: "lumi_2_john", bookId: "2-john", title: "2 João", name: "Lumi 2 João", rarity: "common", testament: "new" },
  { skinId: "lumi_3_john", bookId: "3-john", title: "3 João", name: "Lumi 3 João", rarity: "common", testament: "new" },
  { skinId: "lumi_jude", bookId: "jude", title: "Judas", name: "Lumi Judas", rarity: "common", testament: "new" },
  { skinId: "lumi_revelation", bookId: "revelation", title: "Apocalipse", name: "Lumi Apocalipse", rarity: "epic", testament: "new" }
];

export const bibleSkinByBook = (bookId: string) => BIBLE_SKINS.find((skin) => skin.bookId === bookId);
export const bibleSkinById = (skinId: string) => BIBLE_SKINS.find((skin) => skin.skinId === skinId);
