export type OldTestamentSection =
  | "pentateuch"
  | "history"
  | "wisdom"
  | "major-prophets"
  | "minor-prophets";

export interface CurriculumTarget {
  bookId: string;
  title: string;
  chapters: number;
  targetUnits: number;
  targetLessons: number;
  section: OldTestamentSection;
  rationale: string;
}

export const OLD_TESTAMENT_CURRICULUM: CurriculumTarget[] = [
  { bookId:"genesis", title:"Gênesis", chapters:50, targetUnits:10, targetLessons:42, section:"pentateuch", rationale:"Quatro grandes ciclos narrativos e longa história patriarcal." },
  { bookId:"exodus", title:"Êxodo", chapters:40, targetUnits:8, targetLessons:32, section:"pentateuch", rationale:"Libertação, aliança, lei e tabernáculo." },
  { bookId:"leviticus", title:"Levítico", chapters:27, targetUnits:5, targetLessons:20, section:"pentateuch", rationale:"Sacrifícios, sacerdócio, pureza, santidade e festas." },
  { bookId:"numbers", title:"Números", chapters:36, targetUnits:6, targetLessons:24, section:"pentateuch", rationale:"Duas gerações, crises no deserto e preparação para a terra." },
  { bookId:"deuteronomy", title:"Deuteronômio", chapters:34, targetUnits:6, targetLessons:24, section:"pentateuch", rationale:"Discursos de renovação da aliança e despedida de Moisés." },
  { bookId:"joshua", title:"Josué", chapters:24, targetUnits:5, targetLessons:20, section:"history", rationale:"Entrada, conflitos, repartição e renovação da aliança." },
  { bookId:"judges", title:"Juízes", chapters:21, targetUnits:5, targetLessons:20, section:"history", rationale:"Ciclos de libertação e deterioração moral progressiva." },
  { bookId:"ruth", title:"Rute", chapters:4, targetUnits:2, targetLessons:8, section:"history", rationale:"Narrativa curta, densa em lealdade, resgate e inclusão." },
  { bookId:"1-samuel", title:"1 Samuel", chapters:31, targetUnits:6, targetLessons:24, section:"history", rationale:"Samuel, Saul, ascensão de Davi e transição para a monarquia." },
  { bookId:"2-samuel", title:"2 Samuel", chapters:24, targetUnits:6, targetLessons:24, section:"history", rationale:"Reinado, aliança davídica, pecado, crise familiar e legado." },
  { bookId:"1-kings", title:"1 Reis", chapters:22, targetUnits:6, targetLessons:24, section:"history", rationale:"Salomão, templo, divisão do reino e ciclo de Elias." },
  { bookId:"2-kings", title:"2 Reis", chapters:25, targetUnits:6, targetLessons:24, section:"history", rationale:"Eliseu, queda de Samaria, reformas de Judá e exílio." },
  { bookId:"1-chronicles", title:"1 Crônicas", chapters:29, targetUnits:6, targetLessons:24, section:"history", rationale:"Genealogias, Davi, culto e preparação do templo." },
  { bookId:"2-chronicles", title:"2 Crônicas", chapters:36, targetUnits:7, targetLessons:28, section:"history", rationale:"Templo, reis de Judá, reformas, exílio e retorno." },
  { bookId:"ezra", title:"Esdras", chapters:10, targetUnits:3, targetLessons:12, section:"history", rationale:"Três movimentos: retorno, templo e reforma pela Palavra." },
  { bookId:"nehemiah", title:"Neemias", chapters:13, targetUnits:4, targetLessons:16, section:"history", rationale:"Reconstrução, oposição, leitura da Lei e reformas comunitárias." },
  { bookId:"esther", title:"Ester", chapters:10, targetUnits:3, targetLessons:12, section:"history", rationale:"Ascensão de Ester, ameaça de Hamã e reversão celebrada no Purim." },
  { bookId:"job", title:"Jó", chapters:42, targetUnits:8, targetLessons:32, section:"wisdom", rationale:"Prólogo, ciclos de diálogo, Eliú, resposta divina e epílogo." },
  { bookId:"psalms", title:"Salmos", chapters:150, targetUnits:15, targetLessons:60, section:"wisdom", rationale:"Cinco livros do Saltério e ampla variedade de gêneros e contextos." },
  { bookId:"proverbs", title:"Provérbios", chapters:31, targetUnits:8, targetLessons:32, section:"wisdom", rationale:"Discursos, coleções, palavras, relações, trabalho e liderança." },
  { bookId:"ecclesiastes", title:"Eclesiastes", chapters:12, targetUnits:3, targetLessons:12, section:"wisdom", rationale:"Investigação do Pregador, limites e conclusão sapiencial." },
  { bookId:"song-of-songs", title:"Cântico dos Cânticos", chapters:8, targetUnits:2, targetLessons:8, section:"wisdom", rationale:"Poesia curta que exige atenção às vozes, imagens e movimentos." },
  { bookId:"isaiah", title:"Isaías", chapters:66, targetUnits:12, targetLessons:48, section:"major-prophets", rationale:"Juízo, crise assíria, consolo, Servo e nova criação." },
  { bookId:"jeremiah", title:"Jeremias", chapters:52, targetUnits:11, targetLessons:44, section:"major-prophets", rationale:"Chamado, conflitos, sinais, queda de Jerusalém e nova aliança." },
  { bookId:"lamentations", title:"Lamentações", chapters:5, targetUnits:2, targetLessons:8, section:"major-prophets", rationale:"Cinco poemas densos de lamento, memória e esperança." },
  { bookId:"ezekiel", title:"Ezequiel", chapters:48, targetUnits:10, targetLessons:40, section:"major-prophets", rationale:"Visões, sinais, queda, restauração e templo final." },
  { bookId:"daniel", title:"Daniel", chapters:12, targetUnits:4, targetLessons:16, section:"major-prophets", rationale:"Narrativas de corte e visões apocalípticas exigem tratamento distinto." },
  { bookId:"hosea", title:"Oseias", chapters:14, targetUnits:4, targetLessons:16, section:"minor-prophets", rationale:"Sinal familiar, acusações da aliança e restauração." },
  { bookId:"joel", title:"Joel", chapters:3, targetUnits:2, targetLessons:8, section:"minor-prophets", rationale:"Livro curto, mas denso no dia do Senhor e derramamento do Espírito." },
  { bookId:"amos", title:"Amós", chapters:9, targetUnits:3, targetLessons:12, section:"minor-prophets", rationale:"Oráculos, discursos, visões e promessa final." },
  { bookId:"obadiah", title:"Obadias", chapters:1, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Oráculo curto concentrado em orgulho, violência e reino de Deus." },
  { bookId:"jonah", title:"Jonas", chapters:4, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Quatro movimentos narrativos claros e interdependentes." },
  { bookId:"micah", title:"Miqueias", chapters:7, targetUnits:2, targetLessons:8, section:"minor-prophets", rationale:"Alternância densa entre juízo, esperança messiânica e ética da aliança." },
  { bookId:"nahum", title:"Naum", chapters:3, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Queda de Nínive apresentada em quatro movimentos poéticos." },
  { bookId:"habakkuk", title:"Habacuque", chapters:3, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Diálogo, ais e salmo final formam uma unidade curta." },
  { bookId:"zephaniah", title:"Sofonias", chapters:3, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Dia do Senhor, busca, juízo e restauração." },
  { bookId:"haggai", title:"Ageu", chapters:2, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Quatro mensagens datadas e concentradas." },
  { bookId:"zechariah", title:"Zacarias", chapters:14, targetUnits:4, targetLessons:16, section:"minor-prophets", rationale:"Visões noturnas, questões de jejum e oráculos messiânicos e finais." },
  { bookId:"malachi", title:"Malaquias", chapters:4, targetUnits:1, targetLessons:4, section:"minor-prophets", rationale:"Seis disputas proféticas organizadas em quatro eixos didáticos." }
];

export const curriculumTargetByBookId = new Map(
  OLD_TESTAMENT_CURRICULUM.map((target) => [target.bookId, target])
);

export const OLD_TESTAMENT_TARGET_TOTALS = OLD_TESTAMENT_CURRICULUM.reduce(
  (totals, target) => ({
    books: totals.books + 1,
    chapters: totals.chapters + target.chapters,
    units: totals.units + target.targetUnits,
    lessons: totals.lessons + target.targetLessons
  }),
  { books: 0, chapters: 0, units: 0, lessons: 0 }
);
