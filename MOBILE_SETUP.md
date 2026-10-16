# Bibliolingo Mobile — teste no Android com Expo Go

Esta primeira versão foi preparada para funcionar no Expo Go sem Android Studio, Xcode, emulador ou computador. O caminho recomendado usa um GitHub Codespace aberto no navegador do próprio celular.

 > A versão compatível com Expo Go está na branch `feature/bibliolingo-expo`. A implementação anterior em SDK 58 foi preservada em `archive/bibliolingo-expo-sdk58`. Nenhuma delas foi incorporada à `main`.

## 1. Preparar o Android

1. Instale o [Expo Go pela Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Confirme que o telefone possui conexão estável.
3. Entre na sua conta do GitHub pelo navegador.
4. Recomenda-se deixar o navegador e o Expo Go abertos na lista de aplicativos recentes.

A branch de teste usa o Expo SDK 54, compatível com a versão estável do Expo Go que permanece disponível nas lojas. Se a Play Store oferecer uma atualização do Expo Go, atualize antes do teste.

## 2. Criar o ambiente remoto

1. No navegador, abra a [página de Codespaces do Bibliolingo](https://github.com/viniciusliniker1-spec/Bibliolingo/codespaces).
2. Toque em **New codespace**.
3. Selecione a branch **feature/bibliolingo-expo**.
4. Mantenha a configuração padrão e crie o Codespace.
5. Aguarde a preparação. A primeira abertura instala as dependências de `mobile/` automaticamente.

O GitHub Codespaces possui cotas próprias. O Bibliolingo não controla nem promete disponibilidade gratuita ilimitada desse serviço.

## 3. Iniciar o Expo

No terminal do Codespace, execute:

```bash
cd mobile
npm install
npm run start:tunnel
```

Na primeira execução, o Expo pode pedir confirmação para instalar o suporte ao túnel. Confirme. Quando o Metro estiver pronto, ele exibirá um QR Code e um endereço iniciado por `exp://`.

Como o Codespace está no mesmo telefone:

1. toque no endereço `exp://`, se ele estiver clicável; ou
2. copie o endereço;
3. abra o Expo Go;
4. use a opção para abrir/inserir o endereço do projeto e cole-o.

O endereço só funciona enquanto o comando `npm run start:tunnel` e o Codespace permanecerem ativos. Este repositório não contém um QR Code fixo.

## 4. Fluxo de teste

Execute este roteiro:

1. abra **Início**;
2. confirme XP, sequência, nível e progresso;
3. toque em **Continuar estudando**;
4. leia os passos didáticos da primeira lição de Gênesis;
5. responda uma questão corretamente e outra incorretamente;
6. confira o feedback e a referência;
7. conclua a lição e confira a tela de resultado;
8. feche o Expo Go;
9. abra novamente pelo mesmo endereço;
10. confirme que XP e progresso foram preservados;
11. abra **Trilhas**, depois **Gênesis**, e confirme o desbloqueio da próxima atividade.

Os dados são salvos localmente pelo AsyncStorage do Expo Go. Eles não são sincronizados com o Bibliolingo Web nem com outro aparelho.

## 5. Identificar e relatar erros

Ao encontrar um problema, registre:

- tela e botão usados;
- passos exatos antes do erro;
- mensagem exibida no app ou terminal;
- modelo do aparelho e versão do Android;
- captura de tela, se possível;
- se ocorreu sempre ou apenas uma vez.

Abra uma issue no [repositório Bibliolingo](https://github.com/viniciusliniker1-spec/Bibliolingo/issues) e anexe essas informações. Nunca publique chaves, tokens, dados privados ou URLs que contenham credenciais.

## 6. Receber atualizações

Quando houver novos commits na branch, pare o Expo com **Ctrl+C** no terminal e execute:

```bash
git pull
cd mobile
npm install
npm run start:tunnel
```

Se o Metro mantiver arquivos antigos, inicie limpando o cache:

```bash
npx expo start --tunnel --clear
```

## Por que não usar Expo Snack?

O protótipo usa o catálogo real que vive em `src/content/`, regras compartilhadas fora da pasta mobile, configuração Metro e AsyncStorage. Copiar tudo para o Snack criaria uma segunda fonte de conteúdo e aumentaria o risco de divergência. Codespaces preserva a arquitetura real e ainda permite testar usando somente o Android.

## Limitações atuais

- Não há sincronização com o progresso da versão web.
- O Professor Noah mobile ainda depende de um adapter seguro e de revisão da política do Cloudflare Worker.
- A validação automatizada não substitui o teste em um aparelho físico.
- O projeto ainda não é um pacote AAB/IPA de loja; esta etapa é específica para Expo Go.
