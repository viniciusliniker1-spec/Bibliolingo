# PROJECT — Memória técnica

## Visão

Bibliolingo transforma estudo bíblico em uma jornada progressiva: aprender, compreender, responder, receber feedback, progredir e revisar. A identidade teológica principal é wesleyana/arminiana, sempre distinguindo texto bíblico, história, interpretação teológica e aplicação.

## Decisões arquiteturais

### Aplicação estática local-first

React, TypeScript e Vite produzem uma PWA sem backend obrigatório. A hospedagem pode ser estática e o custo mensal obrigatório permanece zero.

### Persistência versionada

IndexedDB é a fonte de verdade local por meio da camada em `src/storage`. O schema 7 inclui progresso e vocabulário grego, além de nível de conhecimento bíblico, localização de leitura, notas, marcações, som, vibração e lembrete diário, com migração automática dos schemas 0–6. Backups usam envelope validado por Zod e incluem todo o progresso e as configurações.

### Conteúdo como dados e jornada com múltiplos livros

Livros, unidades, lições, passos e exercícios têm IDs estáveis e `contentVersion`. Componentes apenas interpretam os contratos. `journeyBooks` define a ordem canônica atual e `orderedActivityIds` produz uma sequência única de desbloqueio entre livros. A engine garante ensino imediatamente antes de cada exercício de lição; checkpoints permanecem avaliações diretas.

Gênesis mantém todos os IDs publicados. Êxodo, Levítico, Números e Deuteronômio usam IDs estáveis por livro. A sequência é uma recomendação pedagógica, não uma trava sobre o leitor bíblico. A jornada canônica publicada soma 59 unidades, 238 lições e 59 checkpoints: Pentateuco, Josué, Juízes, Rute, 1 Samuel e 2 Samuel.

O contrato editorial passa a ser **Trilha → Unidade → Lição → Competência → Revisão → Checkpoint**. Bíblia, Teologia, Formação Ministerial e trilha Nazarena permanecem percursos independentes e convergem na aba Estudar. `CompleteStudy` guarda estudos de 600–1.000 palavras quando necessário em oito tipos de bloco retomável. A adoção é incremental: o primeiro estudo completo é Gênesis 1; conteúdo antigo continua funcional e fica marcado para revisão humana.

`SourceReference` contém a ficha de rastreabilidade definida na base editorial, inclusive licença, orientação, cobertura lida, divergências, limitações e estado. Nenhum link ou acesso gratuito é tratado como licença para incorporar material protegido.

### Jornada Aprofundar

O Perfil persiste `knowledgeLevel` como `beginner`, `intermediate` ou `advanced`. Selecionar Avançado abre a rota independente `/deepen`; níveis anteriores preservam todo o progresso avançado, apenas retiram sua recomendação da Home. A jornada usa IDs próprios, estudos completos em blocos, questões médias/difíceis, revisão dos erros e checkpoints com 80% de precisão. O piloto editorial cobre Gênesis 1–2 com quatro lições e um checkpoint de oito questões. A expansão depende de conteúdo e fontes revisados, não de geração em massa.

### Segunda jornada — Formação Pastoral

A Formação Pastoral é independente da sequência canônica e usa IDs autorais estáveis (`manual-01`, `artigos-01`, `wesleyana-01` etc.). O catálogo em `src/content/formation` contém 6 matérias, 58 lições, 174 questões, seis provas e um simulado final. A rota é carregada sob demanda para não aumentar o custo inicial da Home.

A engine reaproveita XP, streak, tentativas, feedback e arrays persistidos de conclusão. Provas são checkpoints com domínio mínimo de 80%. Questões são registradas com modo `formation`, não entram na revisão bíblica e não removem corações; provas reprovadas podem ser refeitas. Fontes, limites e o aviso de que o curso não substitui banca ou formação validada permanecem visíveis.

### Bíblia e licença

O leitor usa Almeida 1819 (Bíblia Livre), declarada em domínio público, de uma revisão fixada do Midvash Bible Data. Os 66 livros são carregados sob demanda e livros visitados entram no cache offline. ARA, NAA, NVI e outras traduções modernas não serão incorporadas sem licença explícita.

### Gamificação, revisão e áudio

XP, metas, corações e níveis ficam centralizados em `src/config/gamification.ts`. Streak usa a data civil local. Erros alimentam uma fila determinística de revisão espaçada. Achievements são condições avaliadas pela engine.

XP registra atividade; domínio estima aprendizagem e não deriva do total de XP. O cálculo por conceito valoriza acertos posteriores, variedade de questões, revisão e checkpoints, impedindo que repetição imediata da mesma questão seja chamada de domínio. Corações continuam opcionais, recuperáveis por revisão e nunca bloqueiam explicações. Ranking, quiz diário e recompensas adicionais ficam adiados.

O feedback sonoro é sintetizado localmente por Web Audio, com composições próprias, duração curta e volume moderado. A vibração usa padrões próprios e breves, respeita `prefers-reduced-motion` e pode ser desligada separadamente. Ambos são progressivos: falhas das APIs nunca interferem na aprendizagem.

### Lembrete diário

A configuração persistida usa horário civil local e registra a última data avisada para evitar duplicação. O shell verifica o lembrete quando está ativo e ao retornar ao primeiro plano, usando Notification API e um aviso interno. Como navegadores móveis não garantem execução de JavaScript com o PWA encerrado, o perfil também gera um arquivo ICS recorrente para o calendário do aparelho. A solução permanece sem servidor e sem custo obrigatório.

### Noah remoto e local

O professor contextual remoto usa um Cloudflare Worker opcional; Groq é o provedor primário e Gemini o fallback somente quando ambos foram explicitamente configurados. CORS restringe origens, entradas e histórico têm limites, há timeout, uma retentativa transitória, limites diário por instalação+IP e global por tokens, opção Turnstile e chave de desligamento. O Worker não registra conversas. Como não há autenticação, o isolamento atual é por instalação anônima e IP resumido; autenticação ou Durable Objects são necessários para garantias fortes em escala.

O cliente envia contexto pedagógico mínimo e histórico somente da sessão. A IA não avalia gabaritos, não concede XP e não modifica o estado. O Noah local WebLLM permanece como alternativa opcional em aparelhos WebGPU. A ausência de IA nunca bloqueia conteúdo determinístico.

### Grego Bíblico

O curso é uma trilha independente carregada sob demanda: oito unidades, 32 lições, oito checkpoints e 96 exercícios determinísticos. O catálogo é conteúdo como dados em `src/content/greek`; aprovação de checkpoint exige 80%. A engine compartilha XP, streak, corações, tentativas, revisão e achievements, com modo de tentativa `greek`. O schema 7 registra habilidades por conceito e IDs de lexemas aprendidos sem apagar estados antigos.

O dicionário local contém uma edição inicial curada de 22 verbetes. Busca normalizada aceita grego com ou sem diacríticos, transliteração, glossas portuguesas e Strong. TBESG/STEP Bible Data é a fonte lexical, sob CC BY 4.0; as glossas portuguesas são resumos editoriais. Novas importações devem passar por adaptador e verificação de licença antes de entrar no bundle.

## Funcionalidades existentes

- onboarding, meta diária, Home e retomada exata;
- Gênesis 1–50 em 10 unidades, 42 lições e 10 checkpoints;
- Êxodo 1–40 em 8 unidades, 32 lições e 8 checkpoints;
- Levítico 1–27 em 5 unidades, 20 lições e 5 checkpoints;
- Números 1–36 em 6 unidades, 24 lições e 6 checkpoints;
- Deuteronômio 1–34 em 6 unidades, 24 lições e 6 checkpoints;
- Josué 1–24 em 5 unidades, 20 lições e 5 checkpoints;
- Juízes 1–21 em 5 unidades, 20 lições e 5 checkpoints;
- Rute 1–4 em 2 unidades, 8 lições e 2 checkpoints;
- 1 Samuel 1–31 em 6 unidades, 24 lições e 6 checkpoints;
- 2 Samuel 1–24 em 6 unidades, 24 lições e 6 checkpoints;
- jornada visual agrupada por livro, seletor focado e prévia de unidades bloqueadas;
- Formação Pastoral Nazareno em segunda jornada: 6 matérias, 58 lições, 174 questões, 6 provas e simulado final;
- introdução de atividade com objetivos, passagens, duração e XP;
- prévia bíblica em painel com nota e marcação sem abandonar a tarefa;
- ensino antes de cada exercício, três formatos objetivos e feedback explicativo;
- sons e vibração originais de acerto e erro, além de fanfarra curta de conquista, todos opcionais;
- conclusão com domínio de conceitos, conquista e próximo passo;
- domínio por assunto separado de XP, com evidência variada e posterior;
- jornada Aprofundar ativada pelo nível avançado do Perfil, com quatro lições piloto, revisão reformulada e checkpoint de oito questões em Gênesis 1–2;
- estudo completo retomável na aba Estudar, iniciado pelo piloto de Gênesis 1;
- ficha completa de fontes e licença no schema de conteúdo;
- explicação específica da alternativa escolhida nos exercícios enriquecidos;
- revisão com justificativa, métricas e sessões rápidas;
- XP, níveis, streak, corações, revisão e achievements;
- conquistas de conclusão para os cinco livros e para o Pentateuco;
- lembrete diário com horário local, notificação progressiva, aviso interno e calendário recorrente;
- perfil, calendário, estatísticas e backup;
- IndexedDB com migração e tratamento de falhas;
- leitor dos 66 livros da Almeida 1819;
- busca por referência como `Êxodo 3:14`, seleção por livro/capítulo e busca textual no capítulo;
- referências das lições abrem o versículo e preservam tarefa e índice para retorno exato;
- notas, marcações, última leitura, cópia e compartilhamento de versículos;
- Noah contextual remoto nas lições, dicionário e Formação, com oito modos pedagógicos;
- curso de Grego Bíblico com 8 unidades, 32 lições, 8 checkpoints e progresso integrado;
- dicionário grego offline com busca por grego, transliteração, português e Strong;
- PWA, instalação, cache offline básico e atualização automática;
- CI com testes, auditoria e build.

## Limitações conhecidas

- O Worker ainda precisa ser implantado e receber credenciais reais para validar uma conversa ao vivo; nenhuma credencial foi adicionada ao repositório;
- sem autenticação, o rate limit identifica instalações anônimas e IP resumido, não uma conta verificada;
- o dicionário inicial possui 22 verbetes curados e não pretende ser um léxico completo;
- as unidades de grego têm cobertura curricular funcional e progressiva, mas exigem revisão de um docente de grego koiné antes de uma edição acadêmica definitiva;
- testes automatizados não substituem validação manual em aparelhos Android/iOS reais;

- O conteúdo de Gênesis 4–50, Êxodo, Levítico, Números, Deuteronômio e dos cinco livros históricos adicionados precisa de revisão editorial bíblica e teológica humana;
- a jornada Aprofundar possui engine própria e quatro estudos completos em Gênesis 1–2; Gênesis 3 e as unidades seguintes ainda precisam de redação, fontes e revisão humana;
- a busca textual ainda opera dentro do capítulo aberto;
- não há sincronização entre dispositivos;
- livros bíblicos precisam ser abertos uma vez online antes de ficarem disponíveis offline;
- ícones PWA em PNG ainda dependem do futuro pacote de marca;
- Web Audio e Vibration API dependem do suporte do navegador e de interação do usuário;
- o catálogo bíblico ainda importa os dez livros da jornada estaticamente; a Formação Pastoral já usa carregamento de rota sob demanda;
- notificações exatas com o PWA completamente fechado dependem das políticas do navegador; o calendário recorrente cobre esse cenário.

## Próximas decisões

- revisão editorial, teológica e denominacional do Pentateuco e da Formação Pastoral;
- testes de usabilidade mobile, calibração dos sons e validação do feedback tátil;
- índice local para busca textual global;
- carregamento dinâmico por livro;
- definição da rota de formação;
- sincronização opcional sem comprometer o modo local;
- política de múltiplas traduções licenciadas.

## Regra de evolução

Antes de alterar funcionalidades: ler este arquivo, preservar IDs, avaliar migração, implementar testes, corrigir regressões e atualizar documentação.


### Decisão UX — avanço contínuo

Na conclusão, **Começar próximo passo** limpa o estado da atividade encerrada, cria imediatamente a sessão seguinte e abre seu primeiro passo didático. Isso evita que a mesma tela de resultado permaneça montada enquanto o identificador da rota avança. Toda conclusão aprovada toca uma fanfarra curta de conquista quando o som está habilitado; checkpoints reprovados não tocam celebração.

### Decisão UX — foco sem perda de contexto

A Home renderiza em detalhe somente o livro escolhido para evitar rolagem excessiva quando a jornada crescer. Livros bloqueados podem ser inspecionados, mas a sequência de desbloqueio permanece canônica. Referências dentro das lições usam uma prévia limitada a oito versículos; passagens longas oferecem acesso ao capítulo completo e preservam o retorno exato. Notas feitas na prévia usam a mesma entidade `BibleAnnotation` do leitor.


### Decisão editorial — primeiros livros históricos

Josué, Juízes, Rute e 1–2 Samuel foram integrados pela mesma engine de conteúdo, sem lógica específica na interface. A expansão cobre todos os capítulos em 24 unidades e usa 96 lições curtas. Checkpoints históricos exigem 80%. Passagens de conquista, violência, abuso e monarquia incluem limites interpretativos explícitos: narrativa não equivale a aprovação, e guerras de Israel não são tratadas como mandato para a igreja. Os dados são autorais e baseados nas referências bíblicas; continuam marcados para revisão humana.
