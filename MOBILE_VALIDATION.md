# Validação do Bibliolingo Mobile — Expo Go SDK 54

Data: 16 de outubro de 2026  
Branch operacional: `feature/bibliolingo-expo`  
Cópia preservada do SDK 58: `archive/bibliolingo-expo-sdk58`  
Pull request: [#36](https://github.com/viniciusliniker1-spec/Bibliolingo/pull/36)

## Motivo da alteração

A documentação oficial do Expo informa que cada build do Expo Go contém somente uma versão do SDK. Ela também registra que a distribuição das lojas pode permanecer no SDK 54 enquanto versões posteriores do SDK já existem. Como o Expo Go instalado pela Google Play não abriu o projeto em SDK 58, a branch operacional foi alinhada ao SDK 54.

A implementação SDK 58 não foi apagada. Seu estado anterior ao downgrade está preservado na branch `archive/bibliolingo-expo-sdk58`.

## Versões validadas

- Expo SDK: `~54.0.37`;
- React Native: `0.81.5`;
- React: `19.1.0`;
- Expo Router: `~6.0.24`;
- Expo Constants: `~18.0.14`;
- Expo Linking: `~8.0.12`;
- Expo Status Bar: `~3.0.9`;
- AsyncStorage: `2.2.0`;
- TypeScript: `~5.9.2`.

As versões vieram do template oficial `expo-template-default` 54.0.64 e do catálogo oficial de módulos da branch `sdk-54` do Expo.

## Resultado automatizado

Workflow **Mobile Expo CI**: [run 38833998732](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/38833998732)

- instalação das dependências: passou;
- `npx expo install --fix`: executado e não alterou `package.json`;
- `npx expo install --check`: passou, dependências atualizadas;
- `npx expo-doctor`: 18/18 verificações passaram;
- testes do domínio mobile: 7/7 passaram;
- TypeScript (`tsc --noEmit`): passou;
- exportação Android pelo Metro: passou;
- bundle Android: 1.424 módulos em aproximadamente 15 segundos;
- saída exportada para `dist`.

A CI web no mesmo estado também passou: [run 38833998682](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/38833998682). Isso confirma que o downgrade isolado de `mobile/` não quebrou a aplicação React/Vite.

## Funcionalidades preservadas

- Início, Trilhas, Livro, Lição e Resultado;
- catálogo bíblico compartilhado;
- lição funcional de Gênesis;
- múltipla escolha, completar frase e montar frase;
- XP e níveis;
- streak em data local;
- checkpoints e desbloqueio;
- feedback imediato;
- AsyncStorage;
- retomada de sessão sem duplicar resposta ou XP;
- aplicação web e sua persistência IndexedDB.

## O que foi verificado por código e CI

- resolução do catálogo compartilhado fora de `mobile/`;
- tipos e rotas do Expo Router;
- correção determinística dos três tipos de exercício;
- cálculos de XP e aprovação de checkpoint;
- montagem completa do bundle Android;
- alinhamento das dependências nativas com SDK 54;
- diagnóstico do projeto pelo Expo Doctor;
- ausência de chaves de API no cliente mobile;
- preservação dos testes e do build web.

## O que ainda exige aparelho físico

A CI não substitui o teste real no Expo Go da Google Play. Ainda devem ser validados no Android do proprietário:

- abertura efetiva do endereço `exp://`;
- navegação por toque;
- legibilidade e rolagem no aparelho;
- persistência depois de o Android encerrar e reabrir o Expo Go;
- comportamento do túnel em Wi-Fi e rede móvel;
- desempenho do catálogo completo;
- acessibilidade com TalkBack.

Não existe QR Code permanente. Ele só é gerado enquanto `npm run start:tunnel` estiver ativo em um Codespace.

## Limitações funcionais mantidas

- progresso mobile continua local e não sincroniza com IndexedDB da web;
- Professor Noah mobile permanece pendente de adapter seguro;
- conquistas, corações e revisão ainda não possuem telas mobile próprias;
- não há AAB/IPA nem publicação em loja nesta etapa.

## Critério para promover o PR

1. executar o roteiro de `MOBILE_SETUP.md` no Android;
2. concluir a primeira lição de Gênesis;
3. fechar e reabrir o Expo Go;
4. confirmar XP, progresso e desbloqueio;
5. registrar problemas com captura de tela e passos;
6. somente depois autorizar a retirada do PR do modo rascunho e eventual merge.
