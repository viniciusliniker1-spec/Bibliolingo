# Bibliolingo

PWA mobile-first para estudo bíblico progressivo e gamificado. A jornada canônica inicial cobre **Gênesis 1–50 e Êxodo 1–40** em 18 unidades, 74 lições e 18 checkpoints.

## Stack

- React 19, TypeScript e Vite
- IndexedDB com `idb`
- Zod para backups
- Web Audio API para feedback sonoro original
- service worker sem backend
- Vitest e GitHub Actions

Não existe API paga, chave da OpenAI ou custo mensal obrigatório.

## Rodar localmente

Requer Node.js 22 ou versão LTS compatível.

```bash
npm install
npm run dev
```

Testes e build:

```bash
npm test
npm run build
npm run preview
```

## Instalar como PWA

1. Gere o build e sirva `dist/` por HTTPS.
2. Abra o aplicativo no Chrome/Android.
3. Use **Instalar** no cabeçalho quando o navegador oferecer a instalação.

O service worker guarda a interface, o conteúdo da jornada e os assets essenciais. Livros bíblicos visitados também ficam no cache. Depois do primeiro carregamento bem-sucedido, as atividades principais funcionam offline.

## Arquitetura

```text
src/
  app/             shell e navegação
  components/      componentes reutilizáveis
  config/          XP, metas, corações e progressão
  content/         livros, unidades, lições e exercícios
  domain/          regras puras de negócio
  features/        telas por área do produto
  services/        Noah, áudio e integrações sem estado
  state/           estado e ações da aplicação
  storage/         IndexedDB, backup e migrações
  types/           contratos de conteúdo e progresso
public/            manifest, service worker e ícone
```

A UI não acessa IndexedDB diretamente. O conteúdo não é escrito dentro de componentes React. A ordem global em `src/content/catalog.ts` conecta os livros e mantém o desbloqueio progressivo.

## Estrutura do conteúdo

Os contratos estão em `src/types/content.ts`. Cada entidade usa ID estável e `contentVersion`.

```text
exodus
exodus-u01
exodus-u01-l01
exodus-u01-l01-s01
exodus-u01-l01-q01
exodus-u01-checkpoint
```

Cada exercício de lição deve ser imediatamente precedido por um passo didático. Cada exercício também precisa incluir:

- objetivo pedagógico;
- resposta inequívoca;
- distratores plausíveis;
- explicação;
- referência;
- conceito;
- dificuldade.

### Criar uma lição

1. Abra o arquivo da unidade em `src/content/<livro>/`.
2. Adicione um `Lesson` com ID novo e estável.
3. Combine passos `learn` e exercícios objetivos.
4. Adicione o ID à ordem da unidade.
5. Rode os testes de integridade.

### Criar uma unidade

1. Crie ou amplie o arquivo versionado da unidade.
2. Declare conceitos e fontes.
3. Adicione lições e checkpoint.
4. Registre a unidade no carregador do livro.

### Adicionar um livro

1. Crie `src/content/<book-id>/`.
2. Defina unidades com IDs estáveis e cobertura explícita de capítulos.
3. Registre metadados e ordem em `journeyBooks`, dentro de `src/content/catalog.ts`.
4. Adicione testes de cobertura, formatos e desbloqueio.
5. Quando o catálogo crescer, mova cada livro para carregamento dinâmico sem alterar os contratos.

## Sons de resposta

Acertos e erros usam sequências próprias sintetizadas no navegador com Web Audio; nenhum ativo proprietário é copiado e nenhum arquivo ou serviço externo é necessário. A preferência **Perfil → Sons de resposta** é persistida, exportada no backup e pode ser desligada a qualquer momento. Uma falha de áudio nunca bloqueia a resposta.

## Gamificação

Todos os valores ficam em `src/config/gamification.ts`. Níveis são calculados por função, sem tabela manual. Streak usa a data civil local, evitando quebra por UTC.

Achievements ficam em `src/domain/achievements.ts`. Para criar um:

1. escolha um ID estável;
2. informe título, descrição e ícone;
3. use uma condição existente ou adicione um novo tipo com teste;
4. nunca derive progresso do texto exibido.

## Persistência e migrações

`src/storage/database.ts` contém o adaptador IndexedDB. Migrações incrementais ficam em `src/storage/migrations.ts`. O schema 3 acrescenta a preferência de áudio e migra automaticamente estados anteriores, preservando progresso, notas e marcações.

## Exportar e importar

Em **Perfil → Backup do progresso**:

- **Exportar progresso** baixa um JSON versionado.
- **Importar progresso** valida o arquivo antes de qualquer troca.
- Antes da substituição, o app baixa automaticamente um backup de recuperação.

## Estudar com Noah

Os atalhos geram um prompt a partir da lição atual, copiam para a área de transferência antes de abrir o ChatGPT e não usam API nem chave. Por segurança, navegadores não permitem que um site cole texto automaticamente dentro de outro; no ChatGPT, use **Colar**. A cópia usa fallback compatível com navegadores mobile.

## Texto bíblico e fontes

O leitor oferece os 66 livros da **Almeida 1819 (Bíblia Livre)**, declarada em domínio público, a partir de uma revisão fixada do [Midvash Bible Data](https://github.com/midvash/bible-data). Cada livro é carregado somente quando aberto e fica disponível no cache offline. O leitor aceita referências como **Êxodo 3:14**, permite marcar versículos e salvar notas no IndexedDB. Referências verdes das lições abrem diretamente o primeiro versículo citado e exibem **Voltar à tarefa na jornada**. A ARA não é incluída porque possui direitos autorais ativos; sua inclusão futura exige licença do titular.

Consulte [PROJECT.md](PROJECT.md) para decisões e limitações e [ROADMAP.md](ROADMAP.md) para as próximas fases.
