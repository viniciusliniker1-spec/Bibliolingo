# Validação do Bibliolingo Mobile — Expo SDK 57

Data: 17 de outubro de 2026  
Branch: `feature/bibliolingo-mobile-full-parity`  
PR: [#43](https://github.com/viniciusliniker1-spec/Bibliolingo/pull/43)

## Versões

- Expo `~57.0.30`
- React Native `^0.86.3`
- React `19.2.3`
- Expo Router `~57.0.28`
- AsyncStorage `2.2.0`
- TypeScript `~6.0.3`

O SDK 57 foi preservado, conforme a versão já aberta pelo proprietário no Expo Go Android.

## CI validada

Commit validado: `b4e760ae2c221ad086d4c1fa4af13afbd3226f69`.

### Web

Workflow [CI #258](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/38974824036):

- `npm ci`: passou;
- auditoria de vulnerabilidades altas: passou;
- 123/123 testes: passaram;
- TypeScript + Vite production build: passaram;
- 157 módulos transformados.

O build mantém um aviso já conhecido de chunk principal acima de 500 kB; não foi introduzido por uma dependência Mobile.

### Mobile

Workflow [Mobile Expo CI #115](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/38974824055):

- instalação: passou;
- `npx expo install --fix`: nenhuma alteração necessária;
- `npx expo install --check`: dependências atualizadas;
- `npx expo-doctor`: 21/21 verificações passaram;
- 11/11 testes Mobile: passaram;
- TypeScript: passou;
- export Android: passou;
- Metro: 1.846 módulos;
- bundle Hermes Android: 5,5 MB;
- saída: `mobile/dist`.

## Cobertura funcional implementada

- entrada por login/cadastro ou visitante;
- jornada canônica e livro individual isolado;
- 66 livros, 1.189 capítulos, 1.067 lições e 266 checkpoints compartilhados;
- player único para Bíblia, Grego, Formação e Aprofundar;
- três formatos de exercício, correção editorial, resultados e retomada;
- XP, nível, streak, corações, atividade, conquistas e revisão;
- leitor bíblico nativo com busca, cache, notas, marcações, compartilhamento e grego NT;
- dicionário integral, vocabulário aprendido e Noah contextual;
- Formação, provas e simulado com código de sessão;
- perfil, preferências, backup/restauração, conta e sincronização;
- notificações locais configuráveis;
- EAS configurado para APK de teste e AAB de produção.

## O que a CI não comprova

A exportação Metro não equivale a instalar o aplicativo. Permanecem dependentes de validação física:

- toque, rolagem, teclado, safe areas e TalkBack nas diferentes telas;
- permissões e entrega de notificações conforme a política de bateria do Android;
- abertura de compartilhamento/arquivos;
- persistência após o sistema encerrar o Expo Go;
- comportamento offline prolongado;
- instalação de APK/AAB gerado pelo EAS;
- iOS, pois não houve aparelho iOS;
- OAuth Google/Facebook, que permanece oculto até configuração e teste reais;
- comunicação real de conta/sync/Noah quando o ambiente externo não estiver configurado.

O proprietário já confirmou anteriormente que o SDK 57 abre no Expo Go e que o Professor Noah responde. Isso não substitui uma nova passagem física sobre todas as rotas deste PR.

## Critério antes do merge

1. seguir o roteiro de [MOBILE_SETUP.md](./MOBILE_SETUP.md);
2. validar ao menos um fluxo por percurso no Android;
3. testar backup e uma sincronização real Web ↔ Mobile;
4. testar Noah, notas bíblicas e retorno da referência;
5. registrar qualquer falha;
6. somente então retirar o PR do modo rascunho e autorizar merge.
