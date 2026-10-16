# Auditoria Mobile — Bibliolingo

Data da auditoria: 15 de outubro de 2026  
Branch de trabalho: `feature/bibliolingo-expo`  
Base auditada: `main` em `6eedb34bc9745abf087a27ea7b0a6030193d4c04`

## Atualização de compatibilidade com Expo Go

A implementação original em Expo SDK 58 foi preservada integralmente na branch `archive/bibliolingo-expo-sdk58`. A branch de trabalho foi realinhada ao Expo SDK 54 porque cada build do Expo Go inclui somente uma versão do SDK e a distribuição estável das lojas ainda pode permanecer no SDK 54.

Versões móveis atuais:

- Expo `~54.0.37`;
- React Native `0.81.5`;
- React `19.1.0`;
- Expo Router `~6.0.24`;
- AsyncStorage `2.2.0`.

A matriz foi obtida do template e do arquivo `bundledNativeModules.json` oficiais da branch `sdk-54` do repositório Expo. `expo install --fix`, `expo install --check` e `expo-doctor` foram executados na CI.

## Resumo executivo

O Bibliolingo Web é uma aplicação React + TypeScript + Vite publicada como PWA no GitHub Pages. A versão mobile será mantida como um projeto Expo independente em `mobile/`, sem mover nem substituir os arquivos web. Conteúdo editorial, tipos e regras puras de gamificação poderão ser compartilhados diretamente; componentes visuais, roteamento, IndexedDB e APIs do navegador precisam de adaptadores nativos.

A primeira implementação utilizou Expo SDK 58 e foi arquivada. A versão operacional para o Expo Go das lojas usa SDK 54, React Native 0.81.5, Expo Router 6 e AsyncStorage. O projeto não exige Android Studio, Xcode nem build nativo personalizado nesta etapa.

## Estrutura atual

- `src/`: aplicação web, domínio, conteúdo, componentes, estado, serviços e persistência.
- `public/`: manifest, ícones, service worker e dados estáticos da PWA.
- `worker/`: Cloudflare Worker do Professor Noah, provedores Gemini/Groq, limites e KV.
- `.github/workflows/`: CI da aplicação web e publicação do Worker.
- `tests/` e testes próximos aos módulos: regras de domínio, conteúdo e interface.
- `README.md`, `PROJECT.md`, `ROADMAP.md`: documentação técnica e de produto.

A auditoria contou 66 livros no catálogo, 1.189 capítulos, 266 unidades, 1.067 lições e 266 checkpoints. O Novo Testamento possui 27 livros, 75 unidades e 300 lições.

## Aplicação web

- React 19.1, TypeScript 5.9, Vite 7 e React Router 7.
- Roteamento com `HashRouter`, adequado ao GitHub Pages.
- O layout principal e a navegação inferior ficam em `src/components/layout/AppShell.tsx` e componentes relacionados.
- Telas principais em `src/pages/`; lições em `src/features/lesson/`.
- Estilos globais e identidade visual em `src/styles/` e CSS dos componentes.
- PWA com manifest e service worker próprios.

A implementação web depende de DOM, CSS, `window`, `navigator`, `localStorage` e IndexedDB. Os componentes React Web não podem ser renderizados diretamente no React Native.

## Autenticação e dados do usuário

Não existe autenticação de usuário nem sincronização em nuvem. A proteção da Formação Nazarena é uma barreira de sessão no cliente e não equivale a autenticação.

O progresso é local e gerenciado pelo `AppContext`, com persistência em IndexedDB por meio de `idb`. O schema está versionado e possui migrações e validação de backup com Zod. São registrados XP, streak, corações, progresso, tentativas, revisão, conquistas e sessões.

Para o Expo Go, a primeira versão usará uma abstração equivalente baseada em AsyncStorage. Isso garante persistência no aparelho, mas não sincroniza dados com a versão web nem entre aparelhos.

## Conteúdo e trilhas

O conteúdo não está embutido nas telas. O catálogo e os arquivos estruturados ficam em `src/content/`, seguindo tipos de `src/types/content.ts`. As entidades possuem IDs estáveis, versões e referências. Gênesis já contém lições reais com passos didáticos e os três formatos objetivos aceitos:

- múltipla escolha;
- completar frase por alternativa;
- montar frase com blocos.

A primeira lição mobile reutilizará esse conteúdo. Nenhum texto demonstrativo genérico será necessário.

## Gamificação e progresso

As constantes de XP ficam em `src/config/gamification.ts`. Cálculos de nível, streak e desbloqueio estão em módulos puros de `src/domain/`. O reducer web centraliza efeitos e evita que componentes concedam pontos diretamente.

A implementação mobile reutilizará as mesmas constantes e funções puras. Um provider mobile será responsável por persistir e aplicar transições, evitando um sistema paralelo de pontuação.

Escopo inicial operacional:

- XP por exercício e conclusão;
- nível derivado do XP;
- streak em data local;
- lições e checkpoints concluídos;
- desbloqueio sequencial;
- retomada da lição em andamento;
- registro de erros para evolução posterior da revisão.

Conquistas avançadas, calendário, corações e revisão espaçada terão os dados preserváveis no schema mobile, mas não receberão telas próprias nesta primeira entrega.

## Professor Noah, APIs e Cloudflare

O cliente web chama o Cloudflare Worker por `src/services/noahRemote.ts`. O Worker mantém segredos no servidor, utiliza KV para limites e sessões e integra Gemini/Groq. Nenhuma chave está presente no frontend.

O serviço web usa APIs do navegador e `import.meta.env`, portanto requer um adaptador antes de ser importado pelo React Native. Além disso, a política atual de origens do Worker foi preparada para o domínio do GitHub Pages e precisa ser avaliada antes de aceitar requisições provenientes do Expo Go.

Decisão desta etapa: não copiar credenciais nem criar uma integração paralela. O tutor mobile fica documentado como próxima etapa; toda a experiência de lição, correção, XP e persistência funciona offline e sem IA.

## Módulos compartilháveis

| Módulo | Compartilhar agora | Observação |
| --- | --- | --- |
| `src/types/content.ts` | Sim | Tipos sem dependência de plataforma |
| `src/content/` | Sim | Catálogo e lições estruturadas |
| `src/config/gamification.ts` | Sim | Fonte única dos valores de XP |
| `src/domain/gamification.ts` | Sim | Cálculos puros |
| `src/domain/streak.ts` | Sim | Datas locais e streak |
| `src/domain/unlocks.ts` | Sim | Ordem e desbloqueio |
| Componentes web | Não | DOM e CSS; criar componentes RN equivalentes |
| `AppContext` web | Não diretamente | Acoplado ao IndexedDB e navegador |
| Persistência IndexedDB | Não | Substituir por adapter AsyncStorage |
| `noahRemote.ts` | Não diretamente | APIs web e CORS; criar adapter futuro |
| Service worker/PWA | Não | Expo possui ciclo de execução próprio |

Os arquivos compartilhados permanecerão em seus caminhos atuais nesta fase, evitando uma migração arriscada. O Metro será configurado para observá-los fora de `mobile/`. Uma futura extração para `shared/` poderá ocorrer quando houver testes de compatibilidade e consumidores suficientes.

## Arquitetura mobile escolhida

```text
mobile/
├── app/                 # rotas Expo Router
├── components/          # componentes React Native
├── domain/              # transições puras da sessão mobile
├── providers/           # estado e persistência
├── services/            # adapters de plataforma
├── theme/               # tokens visuais
├── types/               # estado específico mobile
├── package.json
├── app.json
├── metro.config.js
└── tsconfig.json
```

A versão web continuará usando o `package.json` raiz. O projeto mobile terá dependências e scripts isolados.

## Identidade visual

A interface atual usa navy `#10243e`, teal `#18a999`, fundo azul-claro `#eef4f8`, superfícies brancas, dourado de recompensa e vermelho para corações/erros. A versão mobile reutilizará esses tokens, cartões arredondados, botões grandes e hierarquia visual semelhante, sem aplicar um template genérico.

O ícone SVG existente permanece preservado. Ícones finais de loja em PNG são uma etapa distinta; o Expo Go não depende deles para testar a primeira versão.

## Expo Go e fluxo somente Android

O projeto completo não é um bom candidato ao Expo Snack porque depende do catálogo compartilhado do repositório, configuração Metro e persistência estruturada. O fluxo viável sem computador é:

1. abrir o repositório no GitHub Codespaces pelo navegador Android;
2. iniciar `mobile` com o script de túnel;
3. abrir o QR/link gerado no Expo Go;
4. manter o Codespace ativo durante o teste.

Esse fluxo usa serviços gratuitos dentro das cotas oferecidas por GitHub e Expo, sem promessa de disponibilidade ilimitada. Um link ou QR só existe enquanto o servidor Expo estiver realmente em execução; a documentação não apresentará um link fictício.

## Riscos e limites

- Expo Go e o projeto precisam usar a mesma versão do SDK; a branch operacional está alinhada ao SDK 54.
- O túnel depende de internet e do Codespace permanecer ativo.
- AsyncStorage não sincroniza o progresso web.
- Importar o catálogo inteiro pode aumentar tempo de bundle; a primeira validação medirá esse impacto.
- O tutor exige uma política segura para identificar/limitar clientes mobile no Worker.
- Testes automatizados e exportação Metro não substituem teste físico em Android.
- A publicação em lojas e EAS Build ficam fora desta primeira etapa.

## Regras de preservação

- A aplicação web, seus scripts e deploy não serão alterados para acomodar o mobile.
- Nenhuma migração destrutiva será executada.
- Nenhum segredo será adicionado ao aplicativo.
- A branch não será incorporada à `main` sem autorização explícita.
- Toda limitação não validada em aparelho físico será declarada como tal.
