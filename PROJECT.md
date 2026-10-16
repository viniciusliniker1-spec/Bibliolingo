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

Gênesis mantém todos os IDs publicados. Êxodo, Levítico, Números e Deuteronômio usam IDs estáveis por livro. A sequência é uma recomendação pedagógica, não uma trava sobre o leitor bíblico. A jornada canônica do Antigo Testamento soma 191 unidades, 767 lições e 191 checkpoints, cobrindo os 39 livros e seus 929 capítulos. A matriz editorial proporcional estabelece o mínimo de 191 unidades e 766 lições; todos os 39 livros atingiram a meta. A lição adicional preserva um ID de Salmos publicado anteriormente.ndo os 39 livros e seus 929 capítulos. Os dez primeiros livros preservam sua granularidade publicada; os 29 livros seguintes entram como primeira edição panorâmica, com uma unidade e quatro lições temáticas por livro.

O contrato editorial passa a ser **Trilha → Unidade → Lição → Competência → Revisão → Checkpoint**. Bíblia, Teologia, Formação Ministerial e trilha Nazarena permanecem percursos independentes e convergem na aba Estudar. `CompleteStudy` guarda estudos de 600–1.000 palavras quando necessário em oito tipos de bloco retomável. A adoção é incremental: o primeiro estudo completo é Gênesis 1; conteúdo antigo continua funcional e fica marcado para revisão humana.

`SourceReference` contém a ficha de rastreabilidade definida na base editorial, inclusive licença, orientação, cobertura lida, divergências, limitações e estado. Nenhum link ou acesso gratuito é tratado como licença para incorporar material protegido.

### Livro avulso sem duplicar a jornada

A Home oferece dois contextos sobre o mesmo catálogo: `canonical` e `individual`. Ao escolher um livro diferente do próximo recomendado, um diálogo acessível permite iniciar o livro isoladamente ou retomar a jornada. O modo individual usa query string para navegação e campos opcionais em `ActiveSession` para retomada persistente; estados antigos continuam válidos e são tratados como canônicos.

O desbloqueio individual exige todas as atividades anteriores dentro do livro selecionado. O desbloqueio canônico exige todas as atividades anteriores de `orderedActivityIds`, impedindo que conclusões fora de ordem atravessem a rota. IDs, conclusão, XP, revisão e achievements permanecem compartilhados: não há cópia de conteúdo nem um segundo sistema de progresso.

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

### Noah contextual online

O Professor Noah 2.0 usa o Cloudflare Worker existente; Gemini Flash é o provedor primário e Groq é a contingência quando ambos foram explicitamente configurados. Uma sessão anônima curta, vinculada por hash ao identificador aleatório da instalação, protege o endpoint. O provedor bem-sucedido mantém afinidade de sessão. CORS restringe origens, entradas e histórico têm limites, há timeout, uma retentativa transitória, limites diário por instalação+IP e global por tokens, opção Turnstile e chave de desligamento. O Worker não registra conversas. Como não há autenticação, o isolamento atual é por instalação anônima e IP resumido; autenticação ou Durable Objects são necessários para garantias fortes em escala.

O cliente envia contexto pedagógico mínimo e histórico somente da sessão. A IA não avalia gabaritos, não concede XP e não modifica o estado. A ausência de IA nunca bloqueia conteúdo determinístico.

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
- 1 Reis a Malaquias em 29 unidades panorâmicas, 116 lições e 29 checkpoints;
- cobertura canônica automatizada dos 39 livros e 929 capítulos do Antigo Testamento;
- jornada visual agrupada por livro, seletor focado e prévia de unidades bloqueadas;
- estudo avulso de qualquer livro, com popup de escolha, progressão interna, retomada persistente e isolamento do desbloqueio canônico;
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
- Perfil permite alterar objetivo, meta diária de XP e nível bíblico sem reiniciar o progresso;
- calendário de atividade de 28 dias possui datas, seleção por toque/teclado, detalhe diário, tooltip e legenda de intensidade;
- layout do shell reserva a altura real da barra inferior e safe areas em todas as telas aninhadas;
- Home mantém a jornada bíblica como ação principal; Aprofundar aparece somente para o nível avançado e a Formação Nazarena fica exclusivamente em Estudar;
- perfil, estatísticas e backup;
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

- O conteúdo de Gênesis 4–50 e dos demais livros do Antigo Testamento precisa de revisão editorial bíblica e teológica humana; os 29 livros de 1 Reis a Malaquias são uma primeira edição panorâmica e ainda precisam ser desdobrados em mais unidades antes de uma edição aprofundada;
- a jornada Aprofundar possui engine própria e quatro estudos completos em Gênesis 1–2; Gênesis 3 e as unidades seguintes ainda precisam de redação, fontes e revisão humana;
- a busca textual ainda opera dentro do capítulo aberto;
- não há sincronização entre dispositivos;
- livros bíblicos precisam ser abertos uma vez online antes de ficarem disponíveis offline;
- ícones PWA em PNG ainda dependem do futuro pacote de marca;
- O Noah online depende do Worker implantado e de cota disponível; as trilhas permanecem independentes da IA;
- Web Audio e Vibration API dependem do suporte do navegador e de interação do usuário;
- o catálogo bíblico ainda importa os 66 livros da jornada estaticamente; a Formação Pastoral usa carregamento de rota sob demanda;
- notificações exatas com o PWA completamente fechado dependem das políticas do navegador; o calendário recorrente cobre esse cenário.

## Próximas decisões

- revisão editorial, teológica e denominacional do Pentateuco e da Formação Pastoral;
- testes de usabilidade mobile, calibração dos sons e validação do feedback tátil;
- índice local para busca textual global;
- carregamento dinâmico por livro;
- definição da rota de formação;
- sincronização opcional sem comprometer o modo local;
- política de múltiplas traduções licenciadas.

## Ajustes de UX mobile — outubro de 2026

A barra inferior usa uma altura compartilhada pelo shell, que reserva espaço adicional em todas as telas. O botão flutuante do Noah respeita a mesma altura e os recuos laterais seguros em 375 px e 414 px. Preferências de objetivo e meta diária são persistidas na camada de estado existente, sem novo schema. O calendário expõe datas e intensidade por texto, foco e toque; toggles vinculam título e descrição por ARIA.

## Regra de evolução

Antes de alterar funcionalidades: ler este arquivo, preservar IDs, avaliar migração, implementar testes, corrigir regressões e atualizar documentação.


### Decisão UX — avanço contínuo

Na conclusão, **Começar próximo passo** limpa o estado da atividade encerrada, cria imediatamente a sessão seguinte e abre seu primeiro passo didático. Isso evita que a mesma tela de resultado permaneça montada enquanto o identificador da rota avança. Toda conclusão aprovada toca uma fanfarra curta de conquista quando o som está habilitado; checkpoints reprovados não tocam celebração.

### Decisão UX — foco sem perda de contexto

A Home renderiza em detalhe somente o livro escolhido para evitar rolagem excessiva quando a jornada crescer. Livros bloqueados podem ser inspecionados, mas a sequência de desbloqueio permanece canônica. Referências dentro das lições usam uma prévia limitada a oito versículos; passagens longas oferecem acesso ao capítulo completo e preservam o retorno exato. Notas feitas na prévia usam a mesma entidade `BibleAnnotation` do leitor.


### Decisão editorial — primeiros livros históricos

Josué, Juízes, Rute e 1–2 Samuel foram integrados pela mesma engine de conteúdo, sem lógica específica na interface. A expansão cobre todos os capítulos em 24 unidades e usa 96 lições curtas. Checkpoints históricos exigem 80%. Passagens de conquista, violência, abuso e monarquia incluem limites interpretativos explícitos: narrativa não equivale a aprovação, e guerras de Israel não são tratadas como mandato para a igreja. Os dados são autorais e baseados nas referências bíblicas; continuam marcados para revisão humana.


### Publicação do backend Noah

O Worker é publicado automaticamente quando arquivos em `worker/**` mudam na `main`, ou manualmente pelo Actions. O workflow injeta o binding KV a partir de `CLOUDFLARE_KV_NAMESPACE_ID` em configuração efêmera e envia `GROQ_API_KEY` como secret do Worker. A PWA consome apenas a URL pública definida em `VITE_NOAH_API_URL`; nenhuma credencial é exposta no bundle.


O endpoint de produção atual é `https://bibliolingo-noah.vinicius-liniker1.workers.dev`. O workflow faz smoke test de saúde e provedor após publicar; o Pages injeta essa URL pública no build, com possibilidade de override por variável do repositório.


### Confiabilidade bíblica do Noah

O Worker agora resolve referências dos 66 livros, rejeita deterministicamente capítulos inexistentes, recupera sob demanda a Almeida 1819 da revisão fixa já usada pelo leitor e entrega o texto ao modelo em uma única chamada. A pergunta atual prevalece tematicamente sobre a lição. Referências explícitas da resposta passam por validação canônica; uma passagem existente, porém, não é tratada automaticamente como prova semântica.

A política pedagógica distingue texto, história, literatura, exegese, interpretação, perspectiva wesleyana/arminiana e aplicação. A profundidade e o teto de saída se adaptam à intenção. Fontes somente localizadas não são apresentadas como consultadas. O Manual Nazareno segue catalogado, mas não incorporado; Noah não pode inventar artigo ou paginação.

Respostas usam um renderizador Markdown próprio baseado em elementos React, sem HTML arbitrário, com tabelas roláveis no celular. Dez avaliações editoriais estão registradas separadamente dos testes automatizados. Consulte docs/NOAH_ACCURACY.md.


### Professor Noah 2.0 — decisão de outubro de 2026

A correção oficial permanece no reducer. Antes da resposta, o tutor recebe enunciado e alternativas, mas não recebe gabarito nem explicação editorial. Um erro abre automaticamente o painel somente depois de a tentativa, os corações e a revisão terem sido registrados. Um acerto oferece aprofundamento opcional.

O cliente envia um resumo mínimo de até 40 tentativas recentes e revisões pendentes; XP não é tratado como domínio e conversas completas não são persistidas. Mudar de questão cria outra sessão pedagógica. O painel usa lateral não bloqueante em desktop e bottom sheet com safe areas e `dvh` no mobile.

O Worker usa `gemini-3.8-flash` configurável como principal, Groq como contingência elegível e afinidade de provedor em KV. Tokens de sessão duram duas horas. A matriz editorial possui 30 casos; seus testes verificam a estrutura, não substituem avaliação bíblica, teológica e mobile humana. Consulte `docs/NOAH_2.md`.


### Decisão editorial — Antigo Testamento completo

A ordem canônica protestante foi completada de Gênesis a Malaquias sem alterar IDs publicados. Os 29 livros acrescentados usam um catálogo autoral compacto e a mesma engine determinística de ensino, exercícios, feedback e checkpoints. A cobertura de capítulos é validada contra os 39 livros e 929 capítulos. Esta entrega é panorâmica: cada novo livro possui quatro eixos didáticos e um checkpoint de 80%; livros extensos deverão ser desdobrados editorialmente em unidades menores sem renomear os IDs existentes.


### Expansão proporcional dos livros históricos

1–2 Reis, 1–2 Crônicas, Esdras, Neemias e Ester alcançaram a meta curricular definida por extensão e densidade. As unidades panorâmicas publicadas foram preservadas e novas unidades foram acrescentadas, totalizando 140 lições nesses sete livros. A ordem canônica, os checkpoints e o desbloqueio continuam na jornada principal.


### Expansão dos livros poéticos e sapienciais

Jó, Salmos, Provérbios, Eclesiastes e Cântico dos Cânticos atingiram a granularidade curricular planejada, respeitando diálogo, lamento, poesia, provérbio e reflexão sapiencial como gêneros distintos.


### Profetas completos na matriz proporcional

Isaías, Jeremias, Lamentações, Ezequiel, Daniel e os Profetas Menores atingiram as metas definidas. Oráculos, alegorias, narrativas e textos apocalípticos recebem tratamento distinto. Referências modernas especulativas não são apresentadas como sentido direto das visões.


### Seletor recolhível e fontes lexicais — outubro de 2026

A Home mantém somente o livro selecionado em foco. A lista completa dos 39 livros fica recolhida por padrão, é controlada por botão com `aria-expanded` e fecha após a seleção, reduzindo rolagem sem alterar ordem, desbloqueio ou progresso.

O dicionário grego mantém o TBESG sob CC BY 4.0 e importa sob demanda as 5.408 entradas do Dodson Greek Lexicon. O repositório de origem declara o léxico em domínio público e fornece licença CC0 1.0. O arquivo é fixado no commit `74f70358d4acfaf2f980bf2feb58ab7115cbbcbc`, validado por contagem mínima e armazenado pelo service worker após o primeiro acesso. A procedência e o idioma são exibidos na página e em cada verbete; definições inglesas não são apresentadas como traduções portuguesas revisadas. O Abbott-Smith (1922/TEI) também foi verificado como domínio público, mas não foi incorporado para evitar duplicação.

O Novo Testamento oferece estudo por versículo com o Textus Receptus de Robinson, Strong e morfologia, fixado no commit `7fd4d02c3e5adebd379ebfbc824040820dde10fc`. Cada livro é carregado somente ao primeiro uso e depois fica no cache. O painel apresenta a sequência grega e leva ao dicionário; não cria alinhamento automático com as palavras da Almeida 1819, pois diferenças de ordem e equivalência tornam essa associação editorialmente insegura.


### Decisão editorial — Novo Testamento completo

A rota canônica agora cobre os 66 livros e 1.189 capítulos. Mateus a Apocalipse acrescentam 75 unidades, 300 lições e 75 checkpoints, totalizando 266 unidades, 1.067 lições e 266 checkpoints. A matriz é proporcional: evangelhos, Atos, Romanos, Hebreus e Apocalipse têm granularidade maior; cartas curtas preservam quatro lições que percorrem seus eixos centrais.

`src/content/newTestament/books.ts` concentra a matriz declarativa. A engine existente gera passos didáticos, exercícios objetivos, feedback e checkpoint sem criar lógica por livro. IDs, ordem canônica, cobertura dos 260 capítulos e testamento são validados automaticamente. A entrega é uma primeira edição autoral sujeita a revisão editorial, exegética e teológica humana.

### Decisão de acesso — Formação Pastoral Nazarena

A Formação Pastoral foi removida da Home e permanece apenas na aba Estudar. As rotas do hub e do player passam por `FormationAccessGate`, que aceita a senha `12345` e guarda a liberação em `sessionStorage`. O bloqueio é intencionalmente uma barreira de interface; como a aplicação é estática, o valor pode ser inspecionado no bundle e não deve proteger conteúdo confidencial. Autenticação real exigirá backend.


## Cliente Expo — primeira entrega em branch (2026-10-15)

O cliente React Native foi iniciado em `mobile/` na branch `feature/bibliolingo-expo`, mantendo a PWA intacta. A arquitetura reutiliza catálogo, tipos, XP, streak e desbloqueio diretamente de módulos puros em `src/`; UI e persistência possuem implementações nativas.

Estado implementado na branch:

- Expo SDK 58, TypeScript e Expo Router;
- Início, Trilhas, detalhe do livro, Lição e Resultado;
- três formatos objetivos de exercício;
- feedback imediato, XP, nível, streak, checkpoints e desbloqueio;
- AsyncStorage com retomada de sessão e proteção contra respostas duplicadas;
- fluxo remoto Codespaces + Expo Go para proprietário com apenas Android;
- CI nativa com compatibilidade Expo, testes, TypeScript e export Android.

Decisões e limites:

- não existe sincronização entre AsyncStorage mobile e IndexedDB web;
- Noah não foi conectado no mobile até existir adapter seguro e política de origem/identidade adequada no Worker;
- conquistas, corações, revisão e telas adicionais permanecem no roadmap;
- nenhuma validação física foi alegada;
- PR #36 permanece rascunho e sem merge até autorização.

Detalhes: `MOBILE_AUDIT.md`, `MOBILE_SETUP.md` e `MOBILE_VALIDATION.md`.


### Compatibilidade Expo Go — SDK 54

A versão operacional do cliente mobile foi rebaixada de SDK 58 para SDK 54 para corresponder ao Expo Go distribuído nas lojas. O estado completo anterior permanece em `archive/bibliolingo-expo-sdk58`.

Matriz atual validada: Expo 54.0.37, React Native 0.81.5, React 19.1.0 e Expo Router 6.0.24. A CI executa `expo install --fix`, `expo install --check`, `expo-doctor`, testes, TypeScript e exportação Android. O Doctor passou em 18/18 verificações e o bundle Android foi gerado. A compatibilidade física permanece condicionada ao teste no aparelho do proprietário.


## Autenticação e sincronização multiplataforma — branch de desenvolvimento (2026-10-16)

A arquitetura escolhida usa Supabase Auth e PostgreSQL com RLS, sem substituir o Worker Cloudflare do Professor Noah. A PWA mantém IndexedDB; o cliente Expo SDK 57 mantém AsyncStorage para estudo e SecureStore para sessão. O modo visitante continua disponível.

A sincronização é orientada a eventos UUID idempotentes. O servidor deriva recompensas válidas, mantém dias de estudo, lições, checkpoints, conquistas, histórico e atividade em andamento, e restringe cada registro ao usuário autenticado. O primeiro login não apaga progresso local: a interface oferece mesclagem explícita e usa uma impressão determinística para não repetir a importação.

Cadastro, confirmação por e-mail, login, recuperação, troca de senha, logout, perfil compartilhado e exclusão de conta estão implementados. OAuth Web com PKCE foi preparado para Google e Facebook, mas os botões permanecem ocultos até que cada provedor tenha credenciais, redirects e testes reais. Login social no Expo Go e vinculação de identidades permanecem pendentes de validação externa.

A migration e os clientes estão implementados, porém ainda não foram aplicados a uma instância Supabase real. Até essa configuração, o app continua integralmente local e não se deve declarar sincronização entre dispositivos como validada. Consulte `AUTH_SYNC_AUDIT.md` e `AUTH_SYNC_SETUP.md`.
