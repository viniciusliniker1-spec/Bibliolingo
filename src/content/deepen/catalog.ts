import { genesisPilotStudies } from "../genesis/pilotStudies";
import type { BibleReference, Exercise, MultipleChoiceExercise } from "../../types/content";
import type { DeepenLesson, DeepenUnit } from "../../types/deepen";

const study = genesisPilotStudies["genesis-u01-l01"];
if (!study) throw new Error("Estudo editorial de Gênesis 1 não encontrado.");

const reference: BibleReference = study.baseText;
const communityStudy = genesisPilotStudies["genesis-u01-l04"];
if (!communityStudy) throw new Error("Estudo editorial de Gênesis 2 não encontrado.");

function question(
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  conceptId: string,
  objective: string,
  difficulty: "medium" | "hard" = "hard",
  questionReference: BibleReference = reference
): MultipleChoiceExercise {
  return {
    id,
    type: "multiple-choice",
    prompt,
    objective,
    explanation,
    reference: questionReference,
    conceptId,
    difficulty,
    options: options.map((text, index) => ({ id: id + "-o" + (index + 1), text })),
    correctOptionId: id + "-o" + (correctIndex + 1)
  };
}

const lessons: DeepenLesson[] = [
  {
    id: "deepen-genesis-u01-l01",
    contentVersion: 1,
    title: "Ler a arquitetura do relato",
    subtitle: "Texto-base, mundo antigo e organização literária",
    estimatedMinutes: 12,
    objective: "Reconhecer o argumento de Gênesis 1 por meio de sua estrutura e de seu contexto.",
    baseText: reference,
    blocks: study.blocks.slice(0, 3),
    exercises: [
      question(
        "deepen-genesis-u01-l01-q01",
        "Qual observação oferece a evidência literária mais forte de que Gênesis 1 apresenta uma criação ordenada?",
        ["A quantidade moderna de capítulos", "Os ciclos repetidos de fala, realização, avaliação e contagem dos dias", "A ausência de qualquer repetição", "O uso de nomes científicos"],
        1,
        "A repetição dos ciclos e a relação entre formar domínios e preenchê-los sustentam a leitura de ordem intencional.",
        "deepen-literary-structure",
        "Inferir o argumento a partir da forma literária"
      ),
      question(
        "deepen-genesis-u01-l01-q02",
        "Qual afirmação respeita melhor os limites históricos apresentados no estudo?",
        ["A data exata da composição é declarada em Gênesis 1", "Toda hipótese acadêmica deve ser tratada como erro", "O processo de composição é discutido e não deve ser apresentado como certeza textual", "O contexto do antigo Oriente Próximo torna o texto irrelevante"],
        2,
        "O estudo diferencia o que o texto afirma diretamente das hipóteses históricas debatidas.",
        "deepen-historical-method",
        "Distinguir dado textual de reconstrução histórica"
      ),
      question(
        "deepen-genesis-u01-l01-q03",
        "No contexto antigo descrito, qual contraste teológico é mais relevante?",
        ["Os astros aparecem como criadores", "Elementos associados a poderes divinos em culturas vizinhas aparecem como criaturas sob a palavra de Deus", "A matéria é considerada essencialmente má", "O mar governa o Criador"],
        1,
        "O relato subordina os elementos do mundo criado à iniciativa e à autoridade do único Criador.",
        "deepen-creation-theology",
        "Relacionar contexto histórico e afirmação teológica"
      )
    ]
  },
  {
    id: "deepen-genesis-u01-l02",
    contentVersion: 1,
    title: "Interpretar ordem e bondade",
    subtitle: "Explicação textual, conceitos e divergências",
    estimatedMinutes: 14,
    objective: "Explicar criação, ordem e bondade sem ultrapassar as afirmações do texto.",
    baseText: reference,
    blocks: study.blocks.slice(3, 6),
    exercises: [
      question(
        "deepen-genesis-u01-l02-q01",
        "O que a repetição de “bom” permite afirmar com maior segurança?",
        ["Que o mundo material corresponde ao propósito do Criador", "Que nenhuma possibilidade da criação ainda seria desenvolvida", "Que sofrimento e pecado já estavam presentes", "Que somente realidades espirituais possuem valor"],
        0,
        "A avaliação divina afirma positivamente a criação material e sua adequação ao propósito de Deus.",
        "deepen-goodness",
        "Delimitar a doutrina da bondade da criação"
      ),
      question(
        "deepen-genesis-u01-l02-q02",
        "Qual conclusão NÃO decorre, por si só, da fórmula “e disse Deus”?",
        ["Deus é apresentado com autoridade", "A criação depende da iniciativa divina", "Um mecanismo físico detalhado para cada etapa", "A palavra divina estrutura o relato"],
        2,
        "A fórmula sustenta a autoridade eficaz de Deus, mas não descreve sozinha mecanismos físicos detalhados.",
        "deepen-interpretive-limits",
        "Evitar extrapolação indevida"
      ),
      question(
        "deepen-genesis-u01-l02-q03",
        "Como o estudo trata as diferentes leituras cristãs sobre os dias da criação?",
        ["Declara uma única cronologia como tradução literal obrigatória", "Reconhece divergências e pede que cada leitura seja distinguida do que o texto afirma diretamente", "Evita mencionar qualquer interpretação", "Considera toda leitura equivalente e sem critérios"],
        1,
        "Comparação justa exige apresentar divergências e separar observação textual de conclusão interpretativa.",
        "deepen-interpretations",
        "Comparar interpretações de maneira responsável"
      )
    ]
  },
  {
    id: "deepen-genesis-u01-l03",
    contentVersion: 1,
    title: "Integrar teologia e prática",
    subtitle: "Aplicação responsável, síntese e fontes",
    estimatedMinutes: 12,
    objective: "Transformar a leitura em síntese teológica e aplicação sem manipular o texto.",
    baseText: reference,
    blocks: study.blocks.slice(6, 8),
    exercises: [
      question(
        "deepen-genesis-u01-l03-q01",
        "Qual aplicação preserva melhor a direção do texto estudado?",
        ["Usar Gênesis 1 para datar qualquer descoberta científica", "Reconhecer a criação como dádiva de Deus e exercer cuidado responsável", "Tratar o mundo material como descartável", "Evitar toda discussão por existir divergência"],
        1,
        "A aplicação deriva da bondade, do propósito e da responsabilidade presentes no argumento do relato.",
        "deepen-application",
        "Derivar aplicação coerente do argumento bíblico"
      ),
      question(
        "deepen-genesis-u01-l03-q02",
        "Por que a rastreabilidade das fontes é importante em um estudo avançado?",
        ["Para substituir a leitura do texto bíblico", "Para permitir verificar de onde vêm informações e interpretações", "Para transformar opiniões em tradução", "Para impedir qualquer conclusão do estudante"],
        1,
        "Fontes identificadas tornam afirmações verificáveis e ajudam a distinguir texto, história e interpretação.",
        "deepen-sources",
        "Compreender a função pedagógica das fontes"
      ),
      question(
        "deepen-genesis-u01-l03-q03",
        "Qual síntese integra melhor Gênesis 1 sem confundir texto e hipótese?",
        ["Deus inicia, ordena, preenche e avalia a criação; modelos cronológicos exigem argumentação adicional", "O capítulo fornece uma descrição científica exaustiva", "O texto não possui afirmação teológica", "Toda interpretação posterior está literalmente escrita no hebraico"],
        0,
        "A primeira alternativa resume o movimento textual e explicita o limite entre exegese e modelos interpretativos.",
        "deepen-synthesis",
        "Produzir síntese com limites explícitos"
      )
    ]
  },
  {
    id: "deepen-genesis-u01-l04",
    contentVersion: 1,
    title: "Comunhão e propósito",
    subtitle: "Trabalho, limite, parceria e unidade em Gênesis 2",
    estimatedMinutes: 16,
    objective: "Integrar a vocação no jardim e a comunhão humana sem ultrapassar os limites do texto.",
    baseText: communityStudy.baseText,
    blocks: communityStudy.blocks,
    exercises: [
      question(
        "deepen-genesis-u01-l04-q01",
        "Por que a expressão “auxílio correspondente” não deve ser usada automaticamente como prova de inferioridade?",
        ["Porque auxílio sempre significa liderança política", "Porque o contexto destaca correspondência, mesma humanidade e solução para a solidão", "Porque a mulher é criada fora da narrativa", "Porque a passagem não fala de relação humana"],
        1,
        "A sequência narrativa enfatiza parceria adequada, reconhecimento de mesma humanidade e resposta ao que não era bom.",
        "deepen-community",
        "Interpretar a expressão dentro da narrativa",
        "hard",
        communityStudy.baseText
      ),
      question(
        "deepen-genesis-u01-l04-q02",
        "Qual conclusão distingue corretamente texto e aplicação pastoral?",
        ["O texto celebra unidade; aplicações a estruturas atuais exigem diálogo com outras passagens", "Toda estrutura contemporânea aparece literalmente no versículo", "Unidade exige ignorar abuso", "Correspondência elimina qualquer diferença pessoal"],
        0,
        "Gênesis 2 sustenta unidade e correspondência; aplicações institucionais detalhadas precisam de argumentação bíblica adicional.",
        "deepen-relational-method",
        "Aplicar o texto sem transformar aplicação em tradução",
        "hard",
        communityStudy.baseText
      ),
      question(
        "deepen-genesis-u01-l04-q03",
        "Como Gênesis 2 relaciona propósito e dependência?",
        ["O ser humano cria o jardim e define todos os limites", "Deus oferece provisão, confia uma tarefa e estabelece um limite", "Trabalho surge apenas depois da queda", "Descanso elimina a vocação"],
        1,
        "Provisão, cultivo, cuidado e limite mostram atividade humana real dentro da dependência do Criador.",
        "deepen-vocation",
        "Integrar trabalho, provisão e limite",
        "medium",
        communityStudy.baseText
      )
    ]
  }
];

const checkpointExercises: Exercise[] = [
  question("deepen-genesis-u01-cp-q01", "Qual sequência resume melhor o movimento literário observado?", ["Acaso, conflito e abandono", "Fala, formação, preenchimento e avaliação", "Nascimento, exílio e retorno", "Lei, monarquia e profecia"], 1, "O relato progride pela palavra de Deus, organização dos domínios, preenchimento e avaliação.", "deepen-literary-structure", "Sintetizar a estrutura"),
  question("deepen-genesis-u01-cp-q02", "Uma reconstrução histórica responsável deve ser apresentada como:", ["Sinônimo do texto bíblico", "Hipótese avaliada por evidências e distinguida da afirmação textual", "Verdade denominacional automática", "Detalhe irrelevante sem fonte"], 1, "A honestidade editorial identifica o grau de certeza e a natureza de cada afirmação.", "deepen-historical-method", "Avaliar método histórico"),
  question("deepen-genesis-u01-cp-q03", "Qual afirmação une criação e bondade sem extrapolar?", ["Tudo o que existe já atingiu toda possibilidade futura", "A criação material é avaliada positivamente por Deus e depende dele", "A matéria se opõe necessariamente ao Criador", "Bondade significa ausência de limites criaturais"], 1, "O texto sustenta dependência e avaliação positiva, não todas as conclusões adicionais.", "deepen-goodness", "Integrar conceitos"),
  question("deepen-genesis-u01-cp-q04", "Quando cristãos divergem sobre os dias, qual procedimento é mais justo?", ["Ocultar as alternativas", "Chamar a própria leitura de tradução direta", "Expor as leituras relevantes, seus argumentos e seus limites", "Eliminar qualquer conclusão possível"], 2, "Comparação justa não apaga convicções, mas identifica argumentos e níveis de certeza.", "deepen-interpretations", "Comparar leituras"),
  question("deepen-genesis-u01-cp-q05", "Qual uso de fonte preserva a distinção entre Bíblia e teologia?", ["Citar a fonte e nomear a conclusão como interpretação quando for o caso", "Inserir toda conclusão dentro do texto bíblico", "Omitir autoria e localização", "Considerar qualquer link uma licença de reprodução"], 0, "Rastreabilidade e rotulagem impedem que interpretação denominacional seja apresentada como tradução.", "deepen-sources", "Aplicar rastreabilidade"),
  question("deepen-genesis-u01-cp-q06", "Qual conclusão demonstra melhor domínio do estudo?", ["Gênesis 1 deve responder sozinho a toda questão moderna", "O capítulo afirma o governo intencional de Deus e requer cautela em conclusões que ultrapassam seu argumento", "O contexto torna a passagem sem valor atual", "A existência de divergência impede compreender qualquer tema"], 1, "Domínio inclui compreender o argumento e reconhecer honestamente seus limites.", "deepen-synthesis", "Demonstrar domínio integrado"),
  question("deepen-genesis-u01-cp-q07", "Qual leitura reúne trabalho, descanso e limite em Gênesis 2?", ["São consequências exclusivas do pecado", "Expressam vocação ativa e dependente dentro da provisão de Deus", "O descanso torna o trabalho desnecessário", "O limite nega toda liberdade humana"], 1, "Antes da queda, o texto já reúne tarefa, descanso, abundância e responsabilidade.", "deepen-vocation", "Integrar vocação e dependência", "hard", communityStudy.baseText),
  question("deepen-genesis-u01-cp-q08", "Qual afirmação trata com maior responsabilidade a unidade de Gênesis 2:24?", ["A unidade apaga a dignidade pessoal", "A união permite ignorar violência", "A passagem celebra vínculo profundo, mas aplicações pastorais devem proteger dignidade e verdade", "O versículo resolve sozinho todo debate contemporâneo"], 2, "A aplicação responsável preserva a força da unidade sem usar o texto para encobrir abuso ou eliminar pessoalidade.", "deepen-relational-method", "Aplicar unidade com responsabilidade", "hard", communityStudy.baseText)
];

export const deepenGenesisUnit: DeepenUnit = {
  id: "deepen-genesis-u01",
  contentVersion: 1,
  title: "Criação e propósito",
  subtitle: "Gênesis 1–2: exegese, teologia e aplicação responsável",
  bookId: "genesis",
  lessons,
  checkpoint: {
    id: "deepen-genesis-u01-checkpoint",
    contentVersion: 1,
    title: "Checkpoint avançado: Criação e propósito",
    subtitle: "Demonstre leitura integrada com precisão mínima de 80%",
    passAccuracy: 0.8,
    exercises: checkpointExercises
  }
};

export const deepenActivityIds = [
  ...deepenGenesisUnit.lessons.map((lesson) => lesson.id),
  deepenGenesisUnit.checkpoint.id
];

export const deepenLessonById = new Map(deepenGenesisUnit.lessons.map((lesson) => [lesson.id, lesson]));

export function deepenActivity(id: string) {
  return deepenLessonById.get(id) ?? (id === deepenGenesisUnit.checkpoint.id ? deepenGenesisUnit.checkpoint : undefined);
}

export function deepenActivityComplete(id: string, completedLessons: string[], completedCheckpoints: string[]) {
  return completedLessons.includes(id) || completedCheckpoints.includes(id);
}

export function deepenActivityUnlocked(id: string, completedLessons: string[], completedCheckpoints: string[]) {
  const index = deepenActivityIds.indexOf(id);
  if (index < 0) return false;
  if (index === 0) return true;
  return deepenActivityComplete(deepenActivityIds[index - 1], completedLessons, completedCheckpoints);
}

export function nextDeepenActivity(completedLessons: string[], completedCheckpoints: string[]) {
  return deepenActivityIds.find((id) => !deepenActivityComplete(id, completedLessons, completedCheckpoints)) ?? deepenActivityIds[0];
}

const deepenExercises = [
  ...deepenGenesisUnit.lessons.flatMap((lesson) => lesson.exercises),
  ...deepenGenesisUnit.checkpoint.exercises
];

export const deepenExerciseById = new Map(deepenExercises.map((exercise) => [exercise.id, exercise]));

export const deepenReviewExerciseByQuestionId = new Map(
  deepenExercises.map((exercise) => [
    exercise.id,
    {
      ...exercise,
      id: exercise.id + "-review",
      prompt:
        "Nova formulação — considerando " +
        exercise.reference.label +
        ", " +
        exercise.prompt.charAt(0).toLocaleLowerCase("pt-BR") +
        exercise.prompt.slice(1)
    } satisfies Exercise
  ])
);
