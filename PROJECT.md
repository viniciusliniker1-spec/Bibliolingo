# PROJECT — Memória técnica

## Visão

Bibliolingo transforma estudo bíblico em uma jornada progressiva: aprender, compreender, responder, receber feedback, progredir e revisar. A identidade teológica principal é wesleyana/arminiana, sempre distinguindo texto bíblico, história, interpretação teológica e aplicação.

## Decisões arquiteturais

### Aplicação estática local-first

React, TypeScript e Vite produzem uma PWA sem backend obrigatório. A hospedagem pode ser estática e o custo mensal obrigatório permanece zero.

### Persistência versionada

IndexedDB é a fonte de verdade local por meio da camada em `src/storage`. O schema 3 inclui localização de leitura, notas, marcações e preferência de som, com migração automática dos schemas 0–2. Backups usam envelope validado por Zod e incluem todo o progresso e as configurações.

### Conteúdo como dados e jornada com múltiplos livros

Livros, unidades, lições, passos e exercícios têm IDs estáveis e `contentVersion`. Componentes apenas interpretam os contratos. `journeyBooks` define a ordem canônica atual e `orderedActivityIds` produz uma sequência única de desbloqueio entre livros. A engine garante ensino imediatamente antes de cada exercício de lição; checkpoints permanecem avaliações diretas.

Gênesis mantém todos os IDs publicados. Êxodo usa IDs `exodus-uNN-lNN` e começa somente depois de `genesis-u10-checkpoint`.

### Bíblia e licença

O leitor usa Almeida 1819 (Bíblia Livre), declarada em domínio público, de uma revisão fixada do Midvash Bible Data. Os 66 livros são carregados sob demanda e livros visitados entram no cache offline. ARA, NAA, NVI e outras traduções modernas não serão incorporadas sem licença explícita.

### Gamificação, revisão e áudio

XP, metas, corações e níveis ficam centralizados em `src/config/gamification.ts`. Streak usa a data civil local. Erros alimentam uma fila determinística de revisão espaçada. Achievements são condições avaliadas pela engine.

O feedback sonoro é sintetizado localmente por Web Audio, com composições próprias, duração curta e volume moderado. É opcional, persistido e não depende de ativos ou serviços externos. Falha de áudio é silenciosa e não interfere na aprendizagem.

### Noah

Noah gera prompts contextuais, copia antes de abrir o ChatGPT e não usa API paga. Navegadores não permitem colar automaticamente em outro site; a colagem continua sendo ação explícita do usuário.

## Funcionalidades existentes

- onboarding, meta diária, Home e retomada exata;
- Gênesis 1–50 em 10 unidades, 42 lições e 10 checkpoints;
- Êxodo 1–40 em 8 unidades, 32 lições e 8 checkpoints;
- jornada visual agrupada por livro e desbloqueio contínuo;
- ensino antes de cada exercício, três formatos objetivos e feedback explicativo;
- sons originais de acerto e erro com opção para desativar;
- XP, níveis, streak, corações, revisão e achievements;
- conquistas de conclusão para Gênesis e Êxodo;
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

- Gênesis 4–50 e todo o conteúdo de Êxodo precisam de revisão editorial bíblica e teológica humana;
- a busca textual ainda opera dentro do capítulo aberto;
- não há sincronização entre dispositivos;
- livros bíblicos precisam ser abertos uma vez online antes de ficarem disponíveis offline;
- ícones PWA em PNG ainda dependem do futuro pacote de marca;
- Web Audio depende do suporte do navegador e de interação do usuário, como exigido pelas políticas móveis;
- o catálogo ainda importa os dois livros estaticamente; a divisão em chunks deve ocorrer antes de dezenas de livros.

## Próximas decisões

- fluxo editorial e aprovação teológica do conteúdo;
- testes de usabilidade mobile e calibração dos sons;
- índice local para busca textual global;
- carregamento dinâmico por livro;
- definição da rota de formação;
- sincronização opcional sem comprometer o modo local;
- política de múltiplas traduções licenciadas.

## Regra de evolução

Antes de alterar funcionalidades: ler este arquivo, preservar IDs, avaliar migração, implementar testes, corrigir regressões e atualizar documentação.
