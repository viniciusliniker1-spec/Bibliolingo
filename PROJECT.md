# PROJECT — Memória técnica

## Visão

Bibliolingo transforma estudo bíblico em uma jornada progressiva: aprender, compreender, responder, receber feedback, progredir e revisar. A identidade teológica principal é wesleyana/arminiana, sempre distinguindo texto bíblico, história, interpretação teológica e aplicação.

## Decisões arquiteturais

### Aplicação estática local-first

React, TypeScript e Vite produzem uma PWA sem backend obrigatório. A hospedagem pode ser estática e o custo mensal obrigatório permanece zero.

### Persistência versionada

IndexedDB é a fonte de verdade local por meio da camada em `src/storage`. O schema 5 inclui localização de leitura, notas, marcações, som, vibração e lembrete diário, com migração automática dos schemas 0–4. Backups usam envelope validado por Zod e incluem todo o progresso e as configurações.

### Conteúdo como dados e jornada com múltiplos livros

Livros, unidades, lições, passos e exercícios têm IDs estáveis e `contentVersion`. Componentes apenas interpretam os contratos. `journeyBooks` define a ordem canônica atual e `orderedActivityIds` produz uma sequência única de desbloqueio entre livros. A engine garante ensino imediatamente antes de cada exercício de lição; checkpoints permanecem avaliações diretas.

Gênesis mantém todos os IDs publicados. Êxodo, Levítico, Números e Deuteronômio usam IDs estáveis por livro e começam somente depois do checkpoint final do livro anterior. A jornada completa soma 35 unidades, 142 lições e 35 checkpoints.

### Bíblia e licença

O leitor usa Almeida 1819 (Bíblia Livre), declarada em domínio público, de uma revisão fixada do Midvash Bible Data. Os 66 livros são carregados sob demanda e livros visitados entram no cache offline. ARA, NAA, NVI e outras traduções modernas não serão incorporadas sem licença explícita.

### Gamificação, revisão e áudio

XP, metas, corações e níveis ficam centralizados em `src/config/gamification.ts`. Streak usa a data civil local. Erros alimentam uma fila determinística de revisão espaçada. Achievements são condições avaliadas pela engine.

O feedback sonoro é sintetizado localmente por Web Audio, com composições próprias, duração curta e volume moderado. A vibração usa padrões próprios e breves, respeita `prefers-reduced-motion` e pode ser desligada separadamente. Ambos são progressivos: falhas das APIs nunca interferem na aprendizagem.

### Lembrete diário

A configuração persistida usa horário civil local e registra a última data avisada para evitar duplicação. O shell verifica o lembrete quando está ativo e ao retornar ao primeiro plano, usando Notification API e um aviso interno. Como navegadores móveis não garantem execução de JavaScript com o PWA encerrado, o perfil também gera um arquivo ICS recorrente para o calendário do aparelho. A solução permanece sem servidor e sem custo obrigatório.

### Noah

Noah gera prompts contextuais, copia antes de abrir o ChatGPT e não usa API paga. Navegadores não permitem colar automaticamente em outro site; a colagem continua sendo ação explícita do usuário.

## Funcionalidades existentes

- onboarding, meta diária, Home e retomada exata;
- Gênesis 1–50 em 10 unidades, 42 lições e 10 checkpoints;
- Êxodo 1–40 em 8 unidades, 32 lições e 8 checkpoints;
- Levítico 1–27 em 5 unidades, 20 lições e 5 checkpoints;
- Números 1–36 em 6 unidades, 24 lições e 6 checkpoints;
- Deuteronômio 1–34 em 6 unidades, 24 lições e 6 checkpoints;
- jornada visual agrupada por livro, seletor focado e prévia de unidades bloqueadas;
- introdução de atividade com objetivos, passagens, duração e XP;
- prévia bíblica em painel com nota e marcação sem abandonar a tarefa;
- ensino antes de cada exercício, três formatos objetivos e feedback explicativo;
- sons e vibração originais de acerto e erro, além de fanfarra curta de conquista, todos opcionais;
- conclusão com domínio de conceitos, conquista e próximo passo;
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
- Noah com sete tipos de prompt;
- PWA, instalação, cache offline básico e atualização automática;
- CI com testes, auditoria e build.

## Limitações conhecidas

- O conteúdo de Gênesis 4–50, Êxodo, Levítico, Números e Deuteronômio precisa de revisão editorial bíblica e teológica humana;
- a busca textual ainda opera dentro do capítulo aberto;
- não há sincronização entre dispositivos;
- livros bíblicos precisam ser abertos uma vez online antes de ficarem disponíveis offline;
- ícones PWA em PNG ainda dependem do futuro pacote de marca;
- Web Audio e Vibration API dependem do suporte do navegador e de interação do usuário;
- o catálogo ainda importa os cinco livros estaticamente; a divisão em chunks é prioridade antes de ampliar além do Pentateuco;
- notificações exatas com o PWA completamente fechado dependem das políticas do navegador; o calendário recorrente cobre esse cenário.

## Próximas decisões

- fluxo editorial e aprovação teológica do conteúdo;
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
