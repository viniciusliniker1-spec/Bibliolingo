export type CrossReferenceKind = "quotation" | "parallel" | "echo" | "theme";

export interface BibleCrossReference {
  id: string;
  from: { bookOsis: string; chapter: number };
  to: { bookOsis: string; chapter: number; verse?: number; label: string };
  kind: CrossReferenceKind;
  note: string;
}

const references: BibleCrossReference[] = [
  { id: "gen-1-john-1", from: { bookOsis: "Gen", chapter: 1 }, to: { bookOsis: "John", chapter: 1, verse: 1, label: "João 1:1–3" }, kind: "echo", note: "João retoma a linguagem da criação para apresentar o Verbo." },
  { id: "gen-12-gal-3", from: { bookOsis: "Gen", chapter: 12 }, to: { bookOsis: "Gal", chapter: 3, verse: 8, label: "Gálatas 3:8" }, kind: "theme", note: "Paulo relaciona a promessa a Abraão à bênção das nações." },
  { id: "deut-6-mark-12", from: { bookOsis: "Deut", chapter: 6 }, to: { bookOsis: "Mark", chapter: 12, verse: 29, label: "Marcos 12:29–30" }, kind: "quotation", note: "Jesus cita o Shemá ao resumir o primeiro mandamento." },
  { id: "ps-22-matt-27", from: { bookOsis: "Ps", chapter: 22 }, to: { bookOsis: "Matt", chapter: 27, verse: 46, label: "Mateus 27:46" }, kind: "quotation", note: "O relato da crucificação cita e ecoa este salmo de lamento." },
  { id: "ps-110-heb-7", from: { bookOsis: "Ps", chapter: 110 }, to: { bookOsis: "Heb", chapter: 7, verse: 17, label: "Hebreus 7:17" }, kind: "quotation", note: "Hebreus desenvolve o tema sacerdotal a partir deste salmo." },
  { id: "isa-53-acts-8", from: { bookOsis: "Isa", chapter: 53 }, to: { bookOsis: "Acts", chapter: 8, verse: 32, label: "Atos 8:32–35" }, kind: "quotation", note: "Filipe anuncia Jesus a partir da passagem lida pelo oficial etíope." },
  { id: "jer-31-heb-8", from: { bookOsis: "Jer", chapter: 31 }, to: { bookOsis: "Heb", chapter: 8, verse: 8, label: "Hebreus 8:8–12" }, kind: "quotation", note: "Hebreus cita a promessa da nova aliança." },
  { id: "hab-2-rom-1", from: { bookOsis: "Hab", chapter: 2 }, to: { bookOsis: "Rom", chapter: 1, verse: 17, label: "Romanos 1:17" }, kind: "quotation", note: "Paulo cita Habacuque ao apresentar a justiça de Deus revelada no evangelho." },
  { id: "matt-4-luke-4", from: { bookOsis: "Matt", chapter: 4 }, to: { bookOsis: "Luke", chapter: 4, verse: 1, label: "Lucas 4:1–13" }, kind: "parallel", note: "Narrativa paralela da tentação, com organização literária própria." },
  { id: "mark-12-luke-21", from: { bookOsis: "Mark", chapter: 12 }, to: { bookOsis: "Luke", chapter: 21, verse: 1, label: "Lucas 21:1–4" }, kind: "parallel", note: "Relato paralelo da oferta da viúva no contexto da crítica ao templo." },
  { id: "luke-4-isa-61", from: { bookOsis: "Luke", chapter: 4 }, to: { bookOsis: "Isa", chapter: 61, verse: 1, label: "Isaías 61:1–2" }, kind: "quotation", note: "Jesus lê Isaías na sinagoga e aplica a passagem à sua missão." },
  { id: "john-1-gen-1", from: { bookOsis: "John", chapter: 1 }, to: { bookOsis: "Gen", chapter: 1, verse: 1, label: "Gênesis 1:1–3" }, kind: "echo", note: "O prólogo de João começa com um eco deliberado da criação." },
  { id: "rom-4-gen-15", from: { bookOsis: "Rom", chapter: 4 }, to: { bookOsis: "Gen", chapter: 15, verse: 6, label: "Gênesis 15:6" }, kind: "quotation", note: "Paulo interpreta a fé de Abraão no argumento sobre justificação." },
  { id: "rev-21-isa-65", from: { bookOsis: "Rev", chapter: 21 }, to: { bookOsis: "Isa", chapter: 65, verse: 17, label: "Isaías 65:17–25" }, kind: "echo", note: "A visão da nova criação reúne imagens proféticas de Isaías." },
  { id: "rev-22-gen-2", from: { bookOsis: "Rev", chapter: 22 }, to: { bookOsis: "Gen", chapter: 2, verse: 9, label: "Gênesis 2:9–10" }, kind: "echo", note: "Árvore e rio retomam o jardim e encerram o arco canônico." }
];

const reverseReferences = references.map((reference) => ({
  ...reference,
  id: reference.id + "-reverse",
  from: { bookOsis: reference.to.bookOsis, chapter: reference.to.chapter },
  to: {
    bookOsis: reference.from.bookOsis,
    chapter: reference.from.chapter,
    label: reference.from.bookOsis + " " + reference.from.chapter
  },
  note: "Passagem de origem ou paralelo relacionado: " + reference.note
}));

export function crossReferencesForChapter(bookOsis: string, chapter: number) {
  return [...references, ...reverseReferences].filter(
    (reference) => reference.from.bookOsis === bookOsis && reference.from.chapter === chapter
  );
}
