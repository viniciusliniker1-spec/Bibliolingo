export type EvaluationCategory =
  | "biblical-interpretation"
  | "historical-context"
  | "nazarene-doctrine"
  | "koine-greek"
  | "objective-exercise"
  | "ambiguous-or-insufficient";

export interface NoahEvaluationCase {
  id: string;
  category: EvaluationCategory;
  question: string;
  mode: "ask" | "simple" | "explain" | "deepen" | "error" | "practice";
  required: string[][];
  forbidden?: RegExp[];
  note: string;
}

export const NOAH_EVALUATION_CASES: NoahEvaluationCase[] = [
  { id:"romans-9",category:"biblical-interpretation",question:"Explique Romanos 9 considerando os capítulos 10 e 11.",mode:"deepen",required:[["angúst"],["gentios"],["romanos 10"],["romanos 11"],["armini","wesley"],["calvin","reformad"]],note:"Texto, contexto canônico e divergência." },
  { id:"john-1-1",category:"biblical-interpretation",question:"Explique João 1:1 para um iniciante.",mode:"simple",required:[["verbo","logos","palavra"],["prólogo","início"]],note:"Resposta básica proporcional." },
  { id:"genesis-15-6",category:"biblical-interpretation",question:"O que Gênesis 15:6 afirma sobre Abrão?",mode:"explain",required:[["creu","fé"],["justiça"]],note:"Não substituir texto por analogia." },
  { id:"good-samaritan",category:"biblical-interpretation",question:"Explique a parábola do bom samaritano.",mode:"explain",required:[["lucas 10"],["próximo"]],note:"Pergunta prevalece sobre lição diferente." },
  { id:"romans-9-24",category:"biblical-interpretation",question:"Romanos 9:24 compara Deus a um pai escolhendo um filho?",mode:"ask",required:[["não"],["judeus"],["gentios"]],note:"Corrigir citação inexistente." },

  { id:"corinth-context",category:"historical-context",question:"Qual era o contexto da igreja em Corinto em 1 Coríntios?",mode:"explain",required:[["corinto"],["igreja","comunidade"],["paulo"]],note:"Distinguir fatos e hipóteses." },
  { id:"exile-daniel",category:"historical-context",question:"Em que contexto histórico começa Daniel?",mode:"explain",required:[["exílio","babil"],["judá","jerusalém"]],note:"Contextualização histórica." },
  { id:"pharisees",category:"historical-context",question:"Quem eram os fariseus no tempo de Jesus?",mode:"explain",required:[["juda"],["lei","torá"]],note:"Evitar caricatura religiosa." },
  { id:"roman-citizenship",category:"historical-context",question:"Por que a cidadania romana de Paulo era relevante em Atos?",mode:"explain",required:[["direito","proteção"],["romano"]],note:"Costume político relevante." },
  { id:"revelation-audience",category:"historical-context",question:"Quem eram os destinatários iniciais de Apocalipse?",mode:"explain",required:[["sete igrejas"],["ásia"]],note:"Destinatários e gênero." },

  { id:"prevenient-grace",category:"nazarene-doctrine",question:"Explique a graça preveniente na teologia wesleyana.",mode:"explain",required:[["graça"],["resposta","responder"],["irresist"]],note:"Formulação confessional identificada." },
  { id:"entire-sanctification",category:"nazarene-doctrine",question:"O que é inteira santificação para a Igreja do Nazareno?",mode:"explain",required:[["santifica"],["wesley","nazaren"],["graça","fé"]],note:"Não inventar artigo do Manual." },
  { id:"apostasy",category:"nazarene-doctrine",question:"A tradição wesleyana admite apostasia?",mode:"explain",required:[["sim","possib"],["graça"],["fé"]],note:"Perspectiva confessional." },
  { id:"assurance",category:"nazarene-doctrine",question:"Explique segurança da salvação na tradição wesleyana.",mode:"explain",required:[["segurança"],["fé","graça"]],note:"Distinguir de posições alternativas." },
  { id:"manual-page",category:"nazarene-doctrine",question:"Qual página exata do Manual Nazareno explica graça preveniente?",mode:"ask",required:[["edição","versão"],["não posso","limitação","documento"]],forbidden:[/página\s+\d+/i],note:"Reconhecer fonte insuficiente." },

  { id:"agape",category:"koine-greek",question:"Explique ἀγάπη no Novo Testamento.",mode:"explain",required:[["agápē","agape"],["substantiv"],["context"]],note:"Não fixar um único sentido." },
  { id:"logos",category:"koine-greek",question:"Explique λόγος em João 1:1.",mode:"explain",required:[["lógos","logos"],["context"],["joão"]],note:"Lema e uso contextual." },
  { id:"pistis",category:"koine-greek",question:"Qual a faixa de sentidos de πίστις?",mode:"explain",required:[["pístis","pistis"],["fé","fidelidade"],["context"]],note:"Faixa semântica." },
  { id:"verb-aspect",category:"koine-greek",question:"Tempo e aspecto são a mesma coisa no grego koiné?",mode:"explain",required:[["não"],["aspect"],["tempo"]],note:"Distinção gramatical." },
  { id:"strong-limit",category:"koine-greek",question:"Um número Strong prova a interpretação correta?",mode:"ask",required:[["não"],["context"]],note:"Limite de Strong e etimologia." },

  { id:"error-faith-works",category:"objective-exercise",question:"Por que minha resposta está errada?",mode:"error",required:[["obras"],["fé","creu"],["gênesis 15:6"]],note:"Usar resposta selecionada e gabarito fornecidos." },
  { id:"hint-creation",category:"objective-exercise",question:"Dê uma pista para a questão sobre quem criou os céus e a terra.",mode:"practice",required:[["pista","observe","texto"]],forbidden:[/a resposta (é|correta é)/i],note:"Não revelar gabarito antes da correção." },
  { id:"fill-choice",category:"objective-exercise",question:"Ajude-me a entender uma frase incompleta sobre a criação.",mode:"practice",required:[["context","frase","observe"]],note:"Pista progressiva para completar frase." },
  { id:"word-blocks",category:"objective-exercise",question:"Como posso ordenar os blocos sem você montar a frase por mim?",mode:"practice",required:[["sujeito","verbo","ordem","comece"]],note:"Estratégia sem resposta pronta." },
  { id:"correct-deepen",category:"objective-exercise",question:"Acertei que Abrão creu; aprofunde por quê.",mode:"deepen",required:[["fé","creu"],["justiça"]],note:"Aprofundar sem alterar correção." },

  { id:"invalid-john-25",category:"ambiguous-or-insufficient",question:"Explique João 25:10.",mode:"ask",required:[["não existe"],["21"]],note:"Referência canonicamente inválida." },
  { id:"unknown-author-hebrews",category:"ambiguous-or-insufficient",question:"Quem escreveu Hebreus?",mode:"ask",required:[["incert","não sabemos","desconhec"]],note:"Não atribuir autoria como fato." },
  { id:"missing-selected",category:"ambiguous-or-insufficient",question:"Por que eu errei?",mode:"error",required:[["resposta","alternativa"],["informe","preciso"]],note:"Não inventar resposta do aluno." },
  { id:"pending-editorial",category:"ambiguous-or-insufficient",question:"Complete todo o conteúdo ainda pendente desta lição.",mode:"ask",required:[["limitação","pendente","não posso"]],note:"Não inventar lacuna editorial." },
  { id:"ambiguous-reference",category:"ambiguous-or-insufficient",question:"Explique 3:16.",mode:"ask",required:[["livro","qual"]],note:"Pedir desambiguação." }
];
