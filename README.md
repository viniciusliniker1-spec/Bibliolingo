# Bibliolingo

PWA mobile-first para estudo bíblico progressivo e gamificado.

## Stack

- React 19 + TypeScript + Vite
- IndexedDB para progresso local
- PWA estática com service worker
- Vitest para regras de domínio
- GitHub Actions para build e testes

## Desenvolvimento

```bash
npm install
npm run dev
```

Build e testes:

```bash
npm test
npm run build
```

## Arquitetura

O conteúdo é dado versionado em `src/content`. A engine em `src/domain` não conhece componentes React. A persistência fica atrás de `src/storage`, permitindo sincronização futura sem reescrever a experiência de estudo.

A primeira unidade cobre Gênesis 1–3 em seis lições e um checkpoint. O projeto não inclui uma tradução bíblica integral; referências e pequenas citações pedagógicas são mantidas separadas para que traduções licenciadas ou em domínio público possam ser adicionadas futuramente.

## Adicionar conteúdo

1. Crie IDs estáveis: `livro-uNN-lNN-qNN`.
2. Modele a unidade conforme `src/types/content.ts`.
3. Valide objetivo pedagógico, resposta inequívoca, distratores, explicação, referência, conceito e dificuldade.
4. Registre a unidade em `src/content/catalog.ts`.
5. Acrescente testes de integridade do conteúdo.

## Configuração

Valores de XP, corações, metas e progressão estão centralizados em `src/config/gamification.ts`.

## Backup

Em Perfil, use **Exportar progresso** para baixar JSON. A importação valida formato e versão antes de substituir o estado local.

Consulte [PROJECT.md](PROJECT.md) para decisões técnicas e [ROADMAP.md](ROADMAP.md) para as próximas fases.
