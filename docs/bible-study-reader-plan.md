# Leitor de estudo bíblico — arquitetura e fontes

Data: 2026-10-30  
Branch de planejamento: `fix/mobile-auth-sync-lumi-final`

## Escopo solicitado

- Leitura da Bíblia com uma edição King James em português brasileiro.
- Texto original hebraico, aramaico e grego com transliteração, morfologia e definições em português.
- Sentidos lexicais lado a lado, sem reduzir palavras polissêmicas a uma única glosa.
- Comentários por versículo de Calvino, Keil & Delitzsch e Catena Aurea.
- Caderno em painel adjacente ao capítulo, editor por blocos, passagens citáveis, comentários marginais, notas fixadas e sincronização por conta.
- Mais cores de destaque por versículo.
- Professor Noah fundamentado primeiro no texto bíblico e, secundariamente, em comentários identificados.

## Estado real do Bibliolingo

O leitor Android atual já oferece:

- Almeida 1819 identificada como domínio público;
- texto original embarcado por livro;
- hebraico/aramaico do WLC/OSHB e grego do Textus Receptus;
- transliteração, Strong e explicação morfológica;
- léxicos grego e hebraico/aramaico;
- modos Português, Original e Interlinear;
- referências cruzadas, marcação, nota simples, cópia, compartilhamento e memorização;
- posição de leitura persistida.

Lacunas:

- somente uma tradução portuguesa;
- nota simples em modal, sem editor por blocos;
- uma única aparência de marcação;
- ausência de âncoras de comentário por parágrafo;
- definições lexicais não aparecem sempre inline;
- ausência de corpus integral de comentários históricos;
- Noah recupera atualmente a Almeida 1819, não um índice de comentários aprovado.

## Regra editorial e jurídica

“KJ 1611 em português/BR” não identifica por si só um texto em domínio público. A KJV inglesa histórica e as traduções/adaptações modernas em português são obras distintas. Antes de distribuir uma edição portuguesa é obrigatório registrar:

- título editorial exato;
- editora/detentor;
- edição e revisão;
- arquivo-fonte autorizado;
- licença de distribuição, modificação, uso offline e uso como contexto de IA;
- atribuição obrigatória.

Não extrair texto do Bíblia Raízes nem presumir transferência da licença daquele produto.

Calvino, Keil & Delitzsch e Tomás de Aquino são autores históricos, mas traduções modernas em português podem ter direitos próprios. Podem ser incorporados textos portugueses licenciados ou traduções novas, revisadas editorialmente, produzidas a partir de fontes comprovadamente livres. Toda unidade deve guardar obra, autor, tradutor, edição, idioma-fonte, licença e localização.

## Arquitetura proposta

### Traduções bíblicas

Registro central de traduções com IDs estáveis. Conteúdo dividido por livro e carregado localmente sob demanda, sem importar toda a Bíblia no bundle JavaScript. Alternância e comparação paralela preservam referência e posição.

### Originais e léxico

Cada palavra deve apresentar:

- forma;
- lema;
- transliteração;
- idioma;
- Strong quando disponível;
- morfologia explicada em português;
- conjunto de sentidos, não uma tradução única;
- fonte lexical e licença;
- ocorrências e ligação ao dicionário.

Os sentidos devem ser rotulados como possibilidades lexicais. O contexto do versículo determina a tradução; a interface não deve afirmar que todos os sentidos se aplicam simultaneamente.

### Caderno

Modelo offline-first sincronizado por usuário:

- `study_notes`: título, capítulo associado, fixação, revisão e timestamps;
- `study_note_blocks`: parágrafo, título, lista, citação, tabela, imagem e passagem bíblica;
- `study_note_anchors`: vínculo entre bloco/comentário e trecho ou versículo;
- `verse_highlights`: cor, referência e atualização;
- outbox idempotente para mudanças offline.

Web/tablet: capítulo e nota lado a lado. Celular: leitor e caderno em painéis alternáveis ou bottom sheet, preservando a referência visível e sem esmagar o texto.

O bloco de passagem armazena referência canônica e tradução; a renderização resolve o texto autorizado. Respostas do Noah entram como citação com data, referências e aviso de que são conteúdo assistido por IA.

### Comentários históricos

Índice canônico por intervalo de versículos, com consulta imediata no capítulo aberto. Cada trecho exibe claramente autor, obra, tradição, edição e licença. Comentário não é apresentado como texto bíblico nem como consenso.

Para desempenho, os dados são separados por livro, comprimidos no APK e carregados apenas para o capítulo aberto. Índices pequenos permanecem em memória; textos extensos ficam fora do bundle JS.

### Noah fundamentado

Ordem de evidência:

1. texto bíblico autorizado recuperado;
2. idiomas originais e léxicos aprovados;
3. comentários históricos licenciados, sempre atribuídos;
4. aplicação pastoral prudente.

A resposta deve separar “texto bíblico”, “interpretação” e “aplicação”. Noah não pode alegar revelação divina, inventar citações ou apresentar um comentarista como autoridade final. Conselhos médicos, jurídicos, financeiros, risco de violência ou crise emocional exigem limites claros e encaminhamento humano apropriado. Notas privadas não entram no contexto sem ação explícita do aluno.

## Sequência de implementação

1. Registro multitradução e prova de licença.
2. Destaques multicoloridos sincronizados.
3. Caderno por blocos e painel responsivo.
4. Âncoras e comentários marginais.
5. Léxico inline com múltiplos sentidos.
6. Pipeline de ingestão e validação dos comentários.
7. Recuperação citável no Noah.
8. testes Android/Web, offline, RLS, conflitos entre dispositivos, acessibilidade e desempenho.

## Bloqueios de conteúdo

A estrutura funcional pode ser implementada sem os corpora. A integração final da KJ portuguesa e dos comentários em português permanece bloqueada até existirem arquivos e licenças verificáveis. Placeholders nunca devem ser apresentados como conteúdo concluído.
