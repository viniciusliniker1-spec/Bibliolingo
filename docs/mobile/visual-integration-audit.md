# Auditoria de integração visual do Bibliolingo Mobile

**Data:** 2026-10-21  
**Branch:** `audit/mobile-recovery-phase-1`  
**Base auditada:** `main@39a55600391324a8b434cf77217f7615b5a4e342`

## Resultado executivo

A integração visual mobile está **parcial e insuficiente**. O pacote aprovado está presente, porém a maior parte das telas não o consome.

Fatos verificados:

- somente cinco módulos/componentes mobile importam `Image`: tab bar, autenticação, player, resultado e conquistas;
- nenhuma tela usa `ImageBackground`;
- os sete cenários existem, mas não são referenciados;
- das 20 poses Lumi, apenas três aparecem efetivamente: boas-vindas, determinada e orgulhosa;
- `mobile/assets/visualAssets.ts` registra 13 ícones e 17 poses, mas não possui consumidor;
- a tab bar usa cinco artes; Início, Bíblia e Perfil são RGB e não têm transparência real segundo o manifest;
- Conquistas referencia 28 artes. 01 e 13 usam fallback; várias regras ainda aguardam telemetria confiável;
- o ícone de Notificações continua ausente;
- Missões, Dashboard e Planos têm funcionalidades textuais, porém nenhuma integração visual aprovada.

Nenhuma identidade foi alterada nesta auditoria.

## Inventário relevante

### Lumi

- **20 arquivos** no manifest.
- Dimensão predominante: **1312×1199 px**.
- **17 RGBA**.
- Sem alfa utilizável: `lumi_02_alegre_aprovada_fundo_xadrez.png`, `lumi_06_carinhosa.png`, `lumi_20_agradecendo.png`.
- Registro amplo: 17 poses em `mobile/assets/visualAssets.ts`, sem consumidor.
- Registro de feedback: 5 poses em `mobile/assets/feedbackAssets.ts`.
- Renderizadas: 
  - `lumi_01_boas_vindas.png` em autenticação;
  - `lumi_12_determinada.png` em erro/tentativa;
  - `lumi_19_orgulhosa.png` em acerto/conclusão.
- Registradas mas não renderizadas: `lumi_14_tecnologica.png` e `lumi_15_conquista.png).

### Cenários

| Arquivo | Dimensão | Integração mobile |
|---|---:|---|
| `01_boas_vindas_noturnas.png` | 940×1672 | nenhuma |
| `02_jardim_do_aprendizado.png` | 941×1672 | nenhuma |
| `03_caminho_da_jornada.png` | 941×1671 | nenhuma |
| `04_biblioteca_do_conhecimento.png` | 941×1672 | nenhuma |
| `05_horizonte_dos_propositos.png` | 941×1672 | nenhuma |
| `06_santuario_da_constancia.png` | 941×1672 | nenhuma |
| `07_portal_da_jornada.png` | 941×1671 | nenhuma |

Todos são RGB. Antes da integração é necessário validar contraste, recorte, safe area e custo de memória em cada superfície.

### Navegação

- 19 arquivos encontrados, todos 1254×1254.
- 16 RGBA e 3 RGB entre os cinco usados.
- Cinco integrados na tab bar:
  - Início — integrado, mas RGB;
  - Bíblia — integrado, mas RGB;
  - Estudos — integrado e RGBA;
  - Conquistas — integrado e RGBA;
  - Perfil — integrado, mas RGB.
- `17_Notificacoes.png`: ausente.
- Os demais ícones são apenas registrados ou não usados.

### Conquistas

- 30 artes disponíveis.
- 28 referenciadas por `mobileAchievementAssets`.
- 01 e 13 não são usadas por ausência de transparência.
- A tela é virtualizada com `FlatList`.
- A conquista 09 permanece secreta na lógica pública, mas sua arte está no registro estático.
- O visual não substitui a ausência de telemetria: 09, 14–19, 27, 29 e 30 ainda têm dependências já registradas em `VISUAL_INTEGRATION.md`.

## Matriz tela por tela

Legenda: **Sim** = renderizado no fluxo atual; **Parcial** = somente parte do esperado; **Não** = nenhum asset aprovado consumido.

| Tela/rota | Elemento visual esperado | Asset existente | Integrado | Pendente | Problema identificado | Ação corretiva recomendada |
|---|---|---|---|---|---|---|
| Entrada/Login/Cadastro `/` | Lumi acolhedora; estado de carregamento/erro | Lumi 01, 04, 14, 16 | **Parcial** — Lumi 01 | Lumi de loading, retorno e falha | Spinner inicial não usa Lumi; biometria não usa arte; só boas-vindas aparece | Após baseline, usar poses por estado sem bloquear formulário |
| Callback OAuth `/auth/callback` | Loading e falha contextual | Lumi 04 e 14 | **Não** | ambas | Tela funcional sem arte contextual | Integrar arte pequena somente após medir callback |
| Layout de abas | Ícones aprovados com estados selecionado/inativo | 01, 03, 06, 11, 15 | **Sim**, com ressalvas | variantes transparentes de 01, 03, 15 | Três PNGs RGB podem exibir blocos/fundos e todos são 1254 px para 28 px | Exportar variantes transparentes e tamanhos por densidade |
| Jornada/Home `/(tabs)` | Lumi por saudação/retorno, cenário, cards visuais de jornada | Lumi 01/16/17; cenários 02/03/07 | **Não** | todos | Tela é composta apenas por texto, cards e emojis; nenhum asset importado | Definir mapa semântico aprovado e aplicar fundo com contraste e carregamento tardio |
| Trilhas `/(tabs)/tracks` | Ícone Trilhas e ambientação da jornada | 02_Trilhas; cenários 03/07 | **Não** | todos | Cards usam badge textual | Integrar ícone/thumbnail otimizado sem prejudicar `FlatList` |
| Livro `/book/[bookId]` | Identidade do livro/unidades e cenário de caminho | cenários 03/07; ícones existentes | **Não** | associação editorial | Nenhuma arte específica por livro; 66 ilustrações estão fora deste escopo | Usar somente ambientação geral aprovada; não simular ilustrações dos 66 livros |
| Lição bíblica `/lesson/[activityId]` | Lumi no início, acerto, erro e conclusão | Lumi 05, 12, 19, 17 | **Parcial** — 12 e 19 via player | 05 e 17 | Não há pose no início; conclusão especial não distingue rota/checkpoint | Integrar poses por evento depois de otimizar variantes |
| Atividade genérica `/activity/[kind]/[activityId]` | Mesmo feedback contextual em Grego/Formação/Aprofundar | Lumi 05, 12, 19 | **Parcial** | Lumi de início e conclusão por contexto | Reutiliza somente duas poses de feedback | Reaproveitar player com mapa semântico único |
| Resultado `/result` | Celebração, tentativa e conclusão de rota | Lumi 12, 17, 19; cenário 05/07 | **Parcial** — 12 e 19 | 17 e ambientação | Toda aprovação usa Lumi 19; não há conclusão especial de rota | Selecionar evento real antes da pose, sem celebração prematura |
| Bíblia `/(tabs)/bible` | Ícone Bíblia e possível biblioteca, mantendo legibilidade | 03_Biblia; cenário 04 | **Parcial** — apenas ícone da aba | cenário e ícone transparente | Ícone RGB; leitor não usa cenário, o que pode ser correto para legibilidade | Não cobrir texto bíblico; limitar cenário a cabeçalho/estado vazio após teste |
| Revisões `/(tabs)/review` | Lumi de reforço/ideia e ícone Revisão | Lumi 12/13; 09_Revisao | **Não** | todos | Fluxo pedagógico sem arte | Integrar uma pose pequena por estado, sem distrair exercícios |
| Estudar `/(tabs)/study` | Ícones das áreas | 04, 06, 07 | **Parcial** — apenas 06 na aba | ícones dos cards | Hub usa letras/símbolos textuais | Mapear cada card para asset otimizado |
| Formação `/formation` | Ícone Formação e Lumi contextual | 07_Formacao_Pastoral; Lumi 09 | **Não** | todos | Nenhuma imagem; acesso secreto deve continuar protegido | Integrar somente após autorização real; nunca revelar conquista 09 |
| Grego `/greek` | Ícone Grego e Lumi explicando | 04_Grego_Biblico; Lumi 09 | **Não** | todos | Hub textual | Integrar ícone e pose sem carregar léxico junto |
| Dicionário grego `/greek/dictionary` | Ícone Dicionário; estados loading/erro | 05_Dicionario; Lumi 04/14 | **Não** | todos | Carga de 5.000+ itens sem arte de estado | Integrar após medir; não usar imagem pesada durante parse |
| Aprofundar `/deepen` | Ambientação teológica e Lumi explicando | Lumi 09; cenários possíveis | **Não** | associação editorial | Nenhum asset específico aprovado para a rota | Solicitar/validar associação; não inventar cenário |
| Planos `/plans` | Ícone Planos, calendário e estado vazio | 13_Plano_de_Estudos; Lumi 13 | **Não** | ambos | Tela muito extensa e textual | Primeiro virtualizar; depois integrar cabeçalho/empty state |
| Missões `/missions` | Identidade de desafio, Lumi encorajadora/conquista | Lumi 12/15; não há ícone exclusivo aprovado | **Não** | pose e definição do ícone | Nenhuma arte; associação de ícone ainda não definida | Usar Lumi por evento real; pedir aprovação para ícone específico |
| Dashboard `/dashboard` | Ícone Aprendizado, Lumi orientadora e visualizações acessíveis | 12_Progresso; Lumi 09/13 | **Não** | todos | Indicadores são somente texto/cards | Integrar ícone de cabeçalho e estados; gráficos devem ter descrição textual |
| Conquistas `/(tabs)/achievements` | Medalhas, Lumi em nova conquista | 30 medalhas; Lumi 15 | **Parcial** — 28 medalhas | 01, 13 e celebração Lumi | Duas artes inválidas; Lumi 15 registrada mas nunca renderizada | Manter fallback; celebrar somente após concessão confirmada e idempotente |
| Perfil `/(tabs)/profile` | Ícone Perfil e Lumi acolhedora | 15_Perfil; Lumi 16 | **Parcial** — só aba | ambos na tela/variante alfa | Ícone da aba é RGB; perfil sem arte | Exportar alfa e integrar pose apenas em cabeçalho/retorno |
| Notificações `/notification-settings` | Ícone Notificações e estados claros | arquivo 17 ausente | **Não** | asset oficial | Não há arquivo seguro; substituir por outra arte violaria o pacote aprovado | Manter ícone atual/fallback e registrar pendência |
| Professor Noah (modal) | Identidade do Noah separada da Lumi | 08_Professor_Noah (RGB) | **Não** | variante adequada | Modal não usa o asset; não deve confundir Noah com Lumi | Integrar versão transparente/otimizada mantendo papéis separados |
| Não encontrada `/+not-found` | Lumi pensativa e ação de retorno | Lumi 04 | **Não** | Lumi 04 | Tela textual | Usar pose otimizada como estado vazio |
| Erro de conexão/sincronização | Lumi preocupada/neutra | Lumi 04 | **Não** | Lumi 04 | Não existe superfície visual centralizada para erro | Criar estado reutilizável na Fase 2 sem esconder diagnóstico |
| Loading global | Lumi tecnológica quando apropriado | Lumi 14 | **Não** | Lumi 14 | Asset está no registro, mas nenhum consumidor | Carregar sob demanda; spinner simples pode permanecer quando mais rápido |

## Inconsistências documentais e técnicas

1. `VISUAL_INTEGRATION.md` afirma que Início, Bíblia e Perfil mantêm ícones anteriores por falta de transparência. O código atual, porém, referencia diretamente `01_Inicio.png`, `03_Biblia.png` e `15_Perfil.png`. O documento e a implementação divergem.
2. O mesmo documento afirma que o ícone principal foi ligado a `03_icone_app.png`, mas `app.json` aponta para `mobile/assets/icon.png` e `adaptive-icon.png`. Sem inspeção binária não é possível confirmar se são cópias idênticas.
3. `mobile/assets/visualAssets.ts` parece um catálogo preparado para integração, mas nenhuma tela o importa. A existência do registro não equivale a integração.
4. `feedbackAssets.ts` registra loading e achievement, porém não há consumidor para essas duas chaves.
5. Os assets de conquistas ficam em caminhos raiz como `design-assets/02_10_licoes.png`, enquanto o manifest registra `conquistas/...`. O código funciona conforme os arquivos atuais, mas a organização documental precisa ser normalizada na Fase 2.

## Critérios visuais para a correção

- Não mudar desenho, cores ou significado dos assets.
- Preservar os masters aprovados.
- Gerar derivados adequados para cada tamanho/densidade.
- Nunca colocar cenário atrás do texto bíblico sem camada de contraste validada.
- Safe areas e teclado devem ser verificados em Android pequeno.
- Lumi não pode cobrir pergunta, alternativa, campo ou botão.
- Poses devem responder a eventos confirmados, não à simples abertura.
- Noah e Lumi permanecem personagens com funções diferentes.
- Assets RGB com fundo indesejado não entram em superfícies que exigem transparência.
- O ícone ausente de Notificações permanece fallback até entrega aprovada.

## Pendências de validação visual

1. Capturas de todas as telas em Android pequeno, médio e grande.
2. Tema claro/escuro, pois `userInterfaceStyle` está como `automatic` e os assets não possuem variantes declaradas.
3. Contraste WCAG dos cenários com conteúdo real.
4. Recorte em diferentes razões de tela e barras do sistema.
5. Decodificação/memória de cada classe de imagem.
6. Aparência real dos PNGs RGB em fundo da aplicação.
7. Confirmação binária dos ícones `mobile/assets/icon.png` e `adaptive-icon.png`.
8. Semântica final cenário → tela e pose Lumi → evento.
9. Verificação da conquista secreta 09 em API, contador e cache.
10. Teste de celebração única após sincronização e reinstalação.

## Conclusão

A percepção de que “nenhuma imagem aparece” é coerente com o fluxo principal: Home, Trilhas, Missões, Dashboard, Planos, Bíblia e hubs educacionais não renderizam assets aprovados. O que existe hoje fica concentrado em login, abas, feedback de exercício, resultado e conquistas. A integração completa deve ocorrer somente após o baseline de desempenho definido no plano de recuperação.
