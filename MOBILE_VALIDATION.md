# Validação da primeira entrega mobile

Data: 15 de outubro de 2026  
Branch: `feature/bibliolingo-expo`  
Pull request: [#36](https://github.com/viniciusliniker1-spec/Bibliolingo/pull/36)

## Resultado automatizado

Execução final do workflow **Mobile Expo CI**: [run 38820205065](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/38820205065)

- instalação das dependências: passou;
- `expo install --check`: passou;
- testes do domínio mobile: 7/7 passaram;
- TypeScript (`tsc --noEmit`): passou;
- exportação Android pelo Metro: passou;
- bundle: 1.696 módulos, exportado para `dist`.

Os testes mobile cobrem:

- estado inicial do progresso;
- proteção contra resposta duplicada;
- XP de lição perfeita;
- aprovação/reprovação de checkpoint;
- streak no mesmo dia local;
- correção de múltipla escolha e completar frase;
- correção integral da ordem em blocos.

Execução final da CI Web no mesmo head: [run 38820205015](https://github.com/viniciusliniker1-spec/Bibliolingo/actions/runs/38820205015)

- 37 arquivos de teste passaram;
- 101 testes passaram;
- build Vite passou.

Isso confirma que a adição de `mobile/` não quebrou o build automatizado da versão web.

## Compatibilidade do SDK

A base usa Expo SDK 58.0.11 e as versões do template oficial Expo 58.0.20. O template oficial já fixa React Native 0.88.0, mas a tabela interna publicada junto ao CLI 58.0.11 ainda sinaliza temporariamente `0.88.0-rc.4`. Como a versão candidata entra em conflito com o peer range do AsyncStorage e o template oficial usa a versão estável, `react-native` foi explicitamente excluído apenas dessa comparação automática. TypeScript e o bundle Android com React Native 0.88.0 foram validados.

Essa exceção deve ser reavaliada quando o próximo patch do Expo atualizar sua tabela publicada.

## O que foi verificado por código/CI

- resolução do catálogo compartilhado fora de `mobile/`;
- navegação compilável com Expo Router;
- tipos de todas as telas;
- montagem do bundle Android;
- cálculos de XP e checkpoint;
- persistência modelada e validada;
- compatibilidade declarada das dependências Expo;
- preservação do build web;
- ausência de chaves de API no cliente mobile.

## O que não foi testado fisicamente

Não foi executado um aparelho Android real nesta sessão. Portanto, permanecem pendentes de validação manual:

- abertura do link `exp://` no Expo Go;
- toque, rolagem e legibilidade no aparelho do proprietário;
- retomada após o Android encerrar o processo;
- comportamento do túnel em rede móvel;
- desempenho do catálogo completo em aparelho de entrada;
- acessibilidade com TalkBack.

Não foi criado ou anunciado um QR Code permanente. O QR/link nasce apenas quando `npm run start:tunnel` está ativo em um Codespace.

## Limitações funcionais assumidas

- progresso mobile é local e não sincroniza com IndexedDB da web;
- não há autenticação no app mobile;
- Professor Noah mobile não foi ligado nesta etapa, evitando expor credenciais ou contornar CORS;
- conquistas, corações e revisão estão no roadmap mobile, sem telas próprias nesta primeira entrega;
- não há AAB/IPA nem publicação em loja;
- assets finais de loja ainda precisam ser produzidos.

## Critério para promover o PR

Antes de autorizar merge na `main`:

1. executar o roteiro de `MOBILE_SETUP.md` em Android;
2. concluir a primeira lição de Gênesis;
3. fechar e reabrir o Expo Go;
4. confirmar XP, progresso e desbloqueio;
5. registrar qualquer falha com captura e passos;
6. somente depois retirar o PR do modo rascunho.
