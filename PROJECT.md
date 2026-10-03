# PROJECT — Memória técnica

## Visão

Bibliolingo transforma estudo bíblico em uma jornada progressiva: aprender, compreender, responder, receber feedback, progredir e revisar. A identidade teológica principal é wesleyana/arminiana, sempre distinguindo texto bíblico, história, interpretação teológica e aplicação.

## Decisões arquiteturais

### Aplicação estática local-first

React, TypeScript e Vite produzem uma PWA sem backend obrigatório. A hospedagem pode ser estática e o custo mensal obrigatório permanece zero.

### Persistência versionada

IndexedDB é a fonte de verdade local por meio da camada em `src/storage`. O schema 2 acrescentou localização de leitura, notas e marcações bíblicas, com migração automática dos schemas 0 e 1. Backups usam envelope validado por Zod e incluem todo o progresso e as anotações.

### Conteúdo como dados

Livros, unidades, lições, passos e exercícios têm IDs estáveis e `contentVersion`. Componentes apenas interpretam os contratos. A engine garante ensino imediatamente antes de cada exercício de lição; checkpoints permanecem avaliações diretas.

### Bíblia e licença

O leitor usa Almeida 1819 (Bíblia Livre), declarada em domínio público, de uma revisão fixada do Midvash Bible Data. Os 66 livros são carregados sob demanda e livros visitados entram no cache offline. ARA, NAA, NVI e outras traduções modernas não serão incorporadas sem licença explícita.

### Gamificação e revisão

XP, metas, corações e níveis ficam centralizados em `src/config/gamification.ts`. Streak usa a data civil local. Erros alimentam uma fila determinística de revisão espaçada. Achievements são condições avaliadas pela engine.

### Noah

Noah gera prompts contextuais, copia antes de abrir o ChatGPT e não usa API paga. Navegadores não permitem colar automaticamente em outro site; a colagem continua sendo ação explícita do usuário.

## Funcionalidades existentes

- onboarding, meta diária, Home e retomada exata;
- Gênesis 1–50 em 10 unidades, 42 lições e 10 checkpoints;
- ensino antes de cada exercício, três formatos objetivos e feedback explicativo;
- XP, níveis, streak, corações, revisão e achievements;
- perfil, calendário, estatísticas e backup;
- IndexedDB com migração e tratamento de falhas;
- leitor dos 66 livros da Almeida 1819;
- busca por referência como `João 3:16`, seleção por livro/capítulo e busca textual no capítulo;\n- referências das lições abrem o primeiro versículo citado e preservam um retorno seguro ao passo da tarefa;
- notas, marcações, última leitura e inclusão no backup;
- cópia e compartilhamento de versículos;
- Noah com sete tipos de prompt;
- PWA, instalação e cache offline básico;
- CI com testes, auditoria e build.

## Limitações conhecidas

- as unidades 2–10 de Gênesis precisam de revisão editorial bíblica e teológica humana;
- a busca textual ainda opera dentro do capítulo aberto; busca global será indexada futuramente;
- não há sincronização entre dispositivos;
- livros bíblicos precisam ser abertos uma vez online antes de ficarem disponíveis offline;
- ícones PWA em PNG ainda dependem do futuro pacote de marca;
- áudio permanece apenas previsto arquiteturalmente.

## Próximas decisões

- fluxo editorial e aprovação teológica do conteúdo;
- índice local para busca textual global sem carregar toda a Bíblia na memória;
- rota de formação e segundo livro;
- sincronização opcional sem comprometer o modo local;
- política de múltiplas traduções licenciadas.

## Regra de evolução

Antes de alterar funcionalidades: ler este arquivo, preservar IDs, avaliar migração, implementar testes, corrigir regressões e atualizar documentação.
