import type { CompleteStudy } from "../../types/content";

const genesisReference = (label: string, chapter: number, startVerse: number, endVerse: number) => ({
  bookId: "genesis",
  startChapter: chapter,
  startVerse,
  endVerse,
  label
});

export const genesisPilotStudies: Record<string, CompleteStudy> = {
  "genesis-u01-l01": {
    id: "genesis-u01-l01-study-v1",
    estimatedWords: 760,
    objective: "Interpretar como Gênesis 1 apresenta Deus, organiza o relato e afirma a bondade da criação.",
    baseText: genesisReference("Gênesis 1:1–31", 1, 1, 31),
    blocks: [
      {
        id: "genesis-u01-l01-study-01",
        kind: "base-text-objective",
        title: "Texto-base e objetivo",
        body: "Leia Gênesis 1:1–31 observando repetições, separações, nomes e avaliações. O objetivo não é resolver em uma única lição todas as discussões científicas sobre origens, mas reconhecer o argumento teológico do capítulo: Deus inicia, ordena, preenche e avalia sua criação. Ao terminar, você deverá conseguir apontar no próprio texto as evidências para essa síntese.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-02",
        kind: "historical-context",
        title: "Contexto histórico",
        body: "Gênesis abre o Pentateuco e apresenta a identidade do Deus de Israel antes de narrar Abraão, o êxodo e a aliança. A data e o processo de composição são discutidos entre estudiosos; esta lição não transforma uma hipótese de autoria ou data em certeza textual. Para o leitor antigo, sol, lua, mares e animais podiam ser associados a poderes divinos em culturas vizinhas. O relato bíblico, porém, os coloca como criaturas sob a palavra de um único Criador.",
        sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"]
      },
      {
        id: "genesis-u01-l01-study-03",
        kind: "literary-context",
        title: "Contexto literário",
        body: "O capítulo possui ritmo deliberado. Deus fala, algo acontece, Deus vê, nomeia ou abençoa, e o dia é contado. Os primeiros movimentos formam domínios; os seguintes os preenchem. Essa organização ajuda o leitor a perceber propósito em vez de acaso. Gênesis 1:1–2 funciona como abertura; Gênesis 1:31 encerra a sequência com a avaliação ‘muito bom’. O sétimo dia, em Gênesis 2:1–3, completa o movimento e será estudado adiante.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-04",
        kind: "text-explanation",
        title: "Explicação do texto",
        body: "Primeiro, Deus é o sujeito principal: a criação depende de sua iniciativa. Segundo, sua palavra estabelece distinções — luz e trevas, águas e firmamento, terra e mares — e torna o mundo habitável. Terceiro, a repetição de ‘bom’ avalia positivamente o mundo material. A bondade não significa que cada possibilidade já esteja desenvolvida, mas que a criação corresponde ao propósito do Criador. A humanidade aparece no clímax do sexto dia, dentro da comunidade das criaturas e com uma vocação particular.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-05",
        kind: "essential-concepts",
        title: "Conceitos essenciais",
        body: "Criação designa a dependência do mundo em relação a Deus. Ordem descreve relações e limites que tornam a vida possível. Bondade é a avaliação divina da obra. Esses conceitos vêm do argumento do capítulo, não de uma etimologia isolada. A fórmula ‘e disse Deus’ destaca autoridade eficaz; ela não autoriza concluir, sem outros argumentos, um mecanismo físico específico para cada etapa.",
        sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"]
      },
      {
        id: "genesis-u01-l01-study-06",
        kind: "interpretations-limits",
        title: "Interpretações e limites",
        body: "Cristãos divergem sobre a relação entre os dias do relato e a cronologia física: há leituras de dias solares, estruturas literárias e outras propostas. O ponto compartilhado que esta lição cobra é mais limitado: o texto apresenta Deus como Criador, a criação como ordenada e sua obra como boa. Nenhuma dessas leituras deve ser apresentada como tradução automática do hebraico. Questões científicas exigem diálogo próprio e não são resolvidas por um quiz breve.",
        sourceIds: ["bibliolingo-editorial-v1"]
      },
      {
        id: "genesis-u01-l01-study-07",
        kind: "application",
        title: "Aplicação",
        body: "Se o mundo é dádiva boa e ordenada, a resposta coerente é gratidão, cuidado e humildade. A aplicação nasce do sentido do texto: criaturas não ocupam o lugar do Criador e não tratam sua obra como descartável. Isso orienta trabalho, consumo e cuidado ambiental sem transformar Gênesis 1 em um manual moderno de políticas públicas.",
        sourceIds: ["biblical-text-genesis"]
      },
      {
        id: "genesis-u01-l01-study-08",
        kind: "summary-sources",
        title: "Síntese e fontes",
        body: "Gênesis 1 apresenta Deus como origem e autoridade; organiza a narrativa por palavra, separação e preenchimento; e chama a criação de boa. Guarde o argumento, não uma lista de respostas. Fonte primária: Gênesis 1:1–31. Critério editorial: Bibliolingo, base editorial e fontes, versão 1. Materiais externos do catálogo permanecem referências para leitura e não foram copiados para esta lição.",
        sourceIds: ["biblical-text-genesis", "bibliolingo-editorial-v1"]
      }
    ]
  }
};
