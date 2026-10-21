# Auditoria de desempenho do Bibliolingo Mobile

**Data:** 2026-10-21  
**Branch:** `audit/mobile-recovery-phase-1`  
**Base auditada:** `main@39a55600391324a8b434cf77217f7615b5a4e342`  
**Escopo:** somente diagnóstico. Nenhuma correção funcional, alteração da Web ou geração de APK foi realizada.

## Resumo executivo

A lentidão relatada em aparelho real é compatível com riscos concretos encontrados no código, mas o tempo de inicialização e o consumo de memória ainda não possuem instrumentação. Portanto, esta auditoria não atribui um tempo ou uma causa única sem medição.

Os maiores riscos verificáveis são:

1. O pacote de assets-fonte soma aproximadamente **126 MiB** segundo `VISUAL_INTEGRATION.md`, dentro de um repositório que a API do GitHub reporta com **134.238 KiB**. O aplicativo referencia imagens diretamente de `design-assets/`.
2. A otimização física dos PNGs só existe em `.github/workflows/android-test-apk.yml`, um workflow limitado à antiga branch `feature/bibliolingo-mobile-full-parity`. Ela não faz parte de `mobile/package.json` e, portanto, não é garantida em builds EAS ou builds de outras branches.
3. Na abertura, o layout raiz monta autenticação, progresso e notificações. Em seguida, a Home importa o catálogo curricular compartilhado e calcula catálogo adaptativo e recomendações de modo síncrono.
4. O progresso completo é serializado para um único JSON no AsyncStorage a cada mudança. O coordenador de notificações também reconcilia agendamentos sempre que o objeto de progresso muda.
5. Telas extensas como Home e Planos usam `ScrollView` e constroem listas completas. Trilhas e Conquistas já usam `FlatList`, o que é uma prática melhor.

A tela cinza infinita e os tempos percebidos no aparelho **não foram reproduzidos nem medidos neste ambiente**. Eles permanecem defeitos de produção confirmados pelo relato do usuário e precisam ser medidos em uma build release instalada em dispositivo físico na Fase 2.

## Método e fontes

Foram inspecionados:

- configuração Expo, Metro e Android;
- layout raiz e árvore Expo Router;
- providers de autenticação e progresso;
- persistência AsyncStorage/SecureStore;
- sincronização e notificações;
- Home, Bíblia, trilhas, atividades, planos, missões, dashboard e conquistas;
- registros estáticos de imagens e manifests do pacote visual;
- workflow de build Android existente.

Não foi possível executar comandos locais, Android Profiler, Perfetto, `adb`, Metro analyzer ou uma build release nesta fase. Toda métrica ausente está marcada como pendência.

## Métricas verificadas

| Métrica | Valor observado | Fonte/observação |
|---|---:|---|
| Tamanho lógico do repositório | 134.238 KiB | Metadado da API GitHub em 2026-10-21 |
| Assets-fonte visuais | ~126 MiB | `VISUAL_INTEGRATION.md`; estimativa já registrada no projeto |
| Ícones de navegação disponíveis | 19 + 1 ausente | `design-assets/manifest.json`; Notificações não possui arquivo seguro |
| Dimensão dos ícones de navegação | 1254×1254 px | Manifest; vários são muito maiores que a exibição de 28×28 px |
| Ícones carregados pela tab bar | 5 | Início, Bíblia, Estudos, Conquistas e Perfil |
| Expressões Lumi no pacote | 20 | `design-assets/manifest (2).json` |
| Expressões com alfa utilizável segundo manifest | 17 | 02, 06 e 20 não possuem canal alfa |
| Poses registradas em `feedbackAssets` | 5 | welcome, encouragement, loading, achievement, proud |
| Poses efetivamente renderizadas | 3 | welcome, encouragement e proud |
| Cenários disponíveis | 7 | 940/941×1671/1672 px, todos RGB |
| Cenários usados no mobile | 0 | Nenhuma referência e nenhum `ImageBackground` no mobile |
| Artes de conquistas referenciadas | 28 de 30 | 01 e 13 usam fallback por ausência de transparência |
| Dependências runtime declaradas | 26 | `mobile/package.json`; presença não significa importação no startup |
| Versão declarada | 0.1.0 | `mobile/package.json` e `mobile/app.json` |
| Tempo cold start | **não medido** | Requer release física + `adb am start -W`/Perfetto |
| Tempo até primeira interação | **não medido** | Não existe marcador de app ready |
| Pico de memória/RSS | **não medido** | Requer Android Profiler/Perfetto |
| Tamanho do JS bundle e APK desta base | **não medido** | Não foi gerada APK nesta fase |
| FPS/jank por tela | **não medido** | Requer FrameTimeline/Profiler em aparelho |

### Estimativa de pressão de memória por imagem

Uma imagem RGBA de 1254×1254 ocupa aproximadamente **6,0 MiB** quando totalmente decodificada (`1254 × 1254 × 4`), independentemente do tamanho comprimido do PNG. Cinco ícones nessa resolução podem representar até aproximadamente **30 MiB** de pixels decodificados se o pipeline nativo mantiver todos simultaneamente em tamanho integral. Uma medalha de 1312×1199 corresponde a aproximadamente **6,0 MiB**; a janela inicial de cinco conquistas pode chegar à mesma ordem de grandeza.

Isso é uma estimativa superior de pixels, não uma medição de heap: React Native/Android pode redimensionar, reciclar ou liberar bitmaps de forma diferente. Ainda assim, usar arquivos de 1254 px para uma área de 28 px é desperdício verificável.

## Caminho de inicialização atual

1. `mobile/app/_layout.tsx` monta `SafeAreaProvider`.
2. `MobileAuthProvider` inicia quatro operações: sessão do SecureStore, modo visitante, preferência biométrica e disponibilidade biométrica.
3. `MobileProgressProvider` monta mesmo antes da decisão login/visitante e lê, em paralelo, o JSON completo de progresso e os metadados de sincronização.
4. `MobileNotificationCoordinator` consulta a última resposta de notificação; depois da hidratação, reconcilia notificações.
5. `mobile/app/index.tsx` mantém um indicador enquanto `auth.loading` for verdadeiro.
6. Após autenticação/visitante, ocorre redirect para tabs.
7. A Home mantém outro indicador enquanto `progress.hydrated` for falso.
8. Na renderização da Home são resolvidos catálogo, livro/unidades, nível, atividade seguinte, catálogo adaptativo e até três recomendações.
9. A Home cria todos os cabeçalhos de unidade do livro selecionado dentro de um `ScrollView`.

Há, portanto, dois gates visuais consecutivos e trabalho curricular síncrono na primeira tela útil.

## Achados priorizados

### P0 — Alto impacto

#### PERF-01 — Ausência de observabilidade de startup

- **Evidência:** não há marcadores de cold start, first render, hydration complete ou interactive.
- **Impacto:** impede separar atraso nativo, carregamento JS, autenticação, storage, assets e renderização.
- **Esforço:** baixo.
- **Ação recomendada:** instrumentar marcadores monotônicos e medir cinco cold starts de build release em aparelho de referência. Complementar com `adb shell am start -W`, Perfetto e FrameTimeline.
- **Status:** pendente; nenhum número deve ser apresentado como real antes disso.

#### PERF-02 — Pipeline de assets não é determinístico entre builds

- **Evidência:** `mobile/scripts/optimize-assets.mjs` é chamado somente pelo workflow `android-test-apk.yml`, cujo gatilho de push aponta para uma branch antiga. `mobile/package.json` não possui `prebuild`, `postinstall` ou outro hook de otimização.
- **Impacto:** EAS e builds locais podem empacotar originais muito maiores que os arquivos redimensionados pelo workflow.
- **Esforço:** médio.
- **Ação recomendada:** manter masters fora do caminho do bundle e criar um diretório mobile derivado, versionado ou gerado deterministicamente antes de todo tipo de build. Não sobrescrever os masters aprovados.

#### PERF-03 — Imagens muito acima da dimensão de exibição

- **Evidência:** ícones 1254×1254 são exibidos a 28×28; medalhas próximas de 1312×1199 são exibidas a 68×68; Lumi próxima de 1312×1199 é exibida entre 92 e 154 px.
- **Impacto:** maior APK, leitura, decodificação e pressão de memória.
- **Esforço:** médio.
- **Ação recomendada:** variantes por uso/densidade, preservando masters e identidade. Ex.: navegação 32/64/96 px, medalhas 96/144/216 px, Lumi por superfície, cenários com resolução-alvo.

#### PERF-04 — Trabalho global antes e durante a primeira tela

- **Evidência:** providers globais hidratam autenticação/progresso e inicializam notificações; Home importa `src/content/catalog`, `adaptiveCatalog`, pré-requisitos e executa recomendações no primeiro render útil.
- **Impacto:** bloqueio potencial do thread JS e atraso até interação.
- **Esforço:** médio/alto.
- **Ação recomendada:** entregar primeiro frame com snapshot mínimo; adiar recomendação e notificações para após interação; carregar índices curriculares mínimos e dados detalhados por rota.

### P1 — Alto/médio impacto

#### PERF-05 — Persistência integral a cada mutação

- **Evidência:** `saveProgress` executa `JSON.stringify(progress)` e grava uma única chave; o effect do provider é disparado para cada alteração pós-hidratação.
- **Impacto:** custo crescente com tentativas, eventos, planos, missões e anotações.
- **Esforço:** médio.
- **Ação recomendada:** debounce/coalescência com flush seguro, particionamento por domínio e migração compatível. Preservar idempotência e sincronização.

#### PERF-06 — Reconciliação de notificações acoplada ao objeto completo de progresso

- **Evidência:** callback `reconcile` depende de `progress`; seu effect roda a cada nova identidade do objeto.
- **Impacto:** leituras e reconciliações repetidas após respostas e atualizações não relacionadas a lembretes.
- **Esforço:** baixo/médio.
- **Ação recomendada:** depender apenas dos campos relevantes, usar fingerprint e reconciliar após hidratação/alteração de preferências/virada de agenda.

#### PERF-07 — Catálogos agregados estaticamente

- **Evidência:** `mobile/domain/activityCatalog.ts` importa catálogos bíblico, grego, aprofundamento e formação; Home, Missões, Dashboard e Planos importam serviços adaptativos compartilhados.
- **Impacto:** avaliação e retenção de estruturas grandes quando as rotas são carregadas; o benefício real de `inlineRequires` não foi medido.
- **Esforço:** alto.
- **Ação recomendada:** índices leves por área, módulos por rota e caches explícitos. Confirmar ganho com análise do bundle antes de alterar arquitetura.

#### PERF-08 — Telas extensas sem virtualização

- **Evidência:** `Screen` usa `ScrollView` por padrão. Home, Planos, Missões e Dashboard constroem coleções dentro dele. Planos monta catálogo, inscrições, passos, chips dos 66 livros e calendário.
- **Impacto:** mais elementos React, layout e memória; custo cresce com histórico.
- **Esforço:** médio.
- **Ação recomendada:** `FlatList`/`SectionList`, paginação de histórico e componentes memoizados. Manter estados e acessibilidade.

### P2 — Impacto progressivo

#### PERF-09 — Estruturas históricas sem política explícita de compactação

- **Evidência:** `attempts`, eventos de planos/missões e atividade diária fazem parte do mesmo objeto persistido; apenas algumas listas de recomendações têm limite.
- **Impacto:** degradação com uso prolongado.
- **Esforço:** médio/alto.
- **Ação recomendada:** definir retenção, agregações e paginação sem apagar evidências pedagógicas necessárias.

#### PERF-10 — Cache de Bíblia e léxico exige parse de documentos grandes

- **Evidência:** Bíblia é armazenada por livro em JSON; o léxico grego exige pelo menos 5.000 itens e é serializado integralmente.
- **Impacto:** atraso e memória ao abrir essas áreas, não necessariamente no cold start.
- **Esforço:** médio.
- **Ação recomendada:** medir por rota; considerar índice/paginação e formato segmentado somente com migração segura.

## Pontos positivos encontrados

- `inlineRequires: true` já está configurado no Metro.
- Bíblia e léxico são carregados sob demanda, não pelo layout raiz.
- Trilhas e Conquistas usam `FlatList`.
- Conquistas configuram janela e batches pequenos.
- Sincronização usa IDs de evento e fila persistente.
- Assets de feedback, navegação e conquistas foram separados em registros menores; o registro amplo `visualAssets.ts` não possui consumidor.

## Desenvolvimento versus produção

| Aspecto | Desenvolvimento | Produção/build atual |
|---|---|---|
| JS | Metro e ferramentas de desenvolvimento acrescentam overhead | Bundle fechado; precisa ser medido em release |
| Assets | Podem ser servidos/resolvidos pelo Metro | Entram no pacote conforme referências estáticas |
| Otimização de PNG | Não garantida | Garantida apenas no workflow antigo que chama o script |
| Cache | Metro/EAS podem reutilizar artefatos | `--clear-cache` não corrige dimensão/arquitetura |
| Logs/profiling | Mais fáceis, mas distorcem tempos | Perfetto/`adb` e build release são obrigatórios |
| Engine JS | Não declarada explicitamente | Engine efetiva da build não foi verificada nesta fase |

## Pendências de medição para a Fase 2

1. Cinco cold starts com processo morto.
2. Warm start e retorno do background.
3. First frame, auth hydrated, progress hydrated, Home interactive.
4. Tempo de cálculo de `buildAdaptiveActivityCatalog` e `recommendAdaptiveNext`.
5. Tamanho do bundle JS, assets empacotados, APK e instalação.
6. RSS/Java heap/native heap após abertura e após Conquistas/Bíblia/Planos.
7. Frames lentos na Home, Planos, Dashboard, Conquistas e Bíblia.
8. Perfil de AsyncStorage com conta nova e histórico extenso.
9. Comparação da mesma build com e sem variantes otimizadas.
10. Reprodução da tela cinza com captura de logcat e stack traces.

## Conclusão

O aplicativo não deve receber selo de desempenho aprovado nesta fase. Há evidências suficientes para priorizar pipeline de assets, startup, persistência, notificações e virtualização, mas não para declarar a tela cinza ou a lentidão resolvidas. A ordem de trabalho proposta está em `docs/mobile/recovery-plan.md`.
