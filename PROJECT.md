# PROJECT — Memória técnica

## Visão

Bibliolingo transforma estudo bíblico em uma jornada progressiva. Cada lição ensina antes de testar, usa exercícios objetivos, feedback explicativo, revisão espaçada e progressão visível.

A identidade teológica principal é wesleyana/arminiana. O produto deve sempre distinguir texto bíblico, contexto histórico, interpretação teológica e aplicação.

## Decisões

### Aplicação estática local-first

React, TypeScript e Vite produzem uma PWA sem backend obrigatório. Isso mantém custo operacional zero e permite hospedagem estática.

### Persistência

IndexedDB é a fonte de verdade local. A UI não acessa IndexedDB diretamente; usa a camada em `src/storage`. Cada mudança incrementa `storageRevision` e é gravada com transação.

Backups usam envelope versionado e validação Zod. Antes de importar, o app baixa automaticamente uma cópia do estado atual.

### Conteúdo como dados

Livros, unidades, lições, passos e exercícios usam IDs estáveis e `contentVersion`. Componentes renderizam uniões discriminadas, portanto novos livros não exigem mudanças na engine.

Catálogo futuro: metadados leves carregados inicialmente; unidades importadas sob demanda. O piloto permanece pequeno nesta fase.

### Gamificação

XP, metas, corações e curva de níveis ficam em `src/config/gamification.ts`. Streak usa a data civil local do dispositivo. Achievements são definições com condições avaliadas pela engine.

### Revisão

Erros criam `ReviewItem`. O agendamento usa intervalos determinísticos e prioridade por atraso, reincidência e resultado recente. A interface pode substituir o algoritmo mantendo o mesmo contrato.

### Texto bíblico

Nenhuma tradução integral protegida está incluída. O conteúdo usa referências e pequenas formulações pedagógicas. Futuras traduções terão metadados de licença e carregamento independente.

## Funcionalidades existentes

- onboarding de objetivo e meta;
- Home com continuar, XP, nível, streak e meta;
- jornada de Gênesis 1–3;
- seis lições e checkpoint;
- múltipla escolha, completar frase e blocos;
- feedback explicativo e referências;
- corações opcionais e recuperação por revisão;
- IndexedDB e retomada de sessão;
- achievements baseados em condições;
- perfil, estatísticas e calendário;
- backup validado;
- prompts contextuais do Noah;
- manifest, service worker e cache offline básico;
- tratamento de rotas, renderização e falhas de armazenamento;
- CI com instalação determinística, auditoria de severidade alta, testes e build.

## Limitações conhecidas

- apenas Gênesis 1–3 possui conteúdo;
- a área Bíblia ainda não contém uma tradução integral;
- não há sincronização entre dispositivos;
- ícone PWA é SVG; PNGs dedicados serão adicionados com o pacote de marca;
- revisão ainda não estima domínio por conceito em modelos estatísticos;
- áudio está somente previsto arquiteturalmente.

## Próximas decisões

- selecionar traduções com licença compatível;
- definir a rota de formação;
- definir política de migração quando exercícios mudarem;
- decidir sincronização opcional sem comprometer o modo local;
- validar conteúdo com revisão bíblica e teológica humana.

## Regra de evolução

Antes de alterar funcionalidades: ler este arquivo, preservar IDs e dados existentes, avaliar migração, implementar testes e atualizar documentação.
