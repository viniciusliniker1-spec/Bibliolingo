# Publicar o Bibliolingo na Play Store (teste fechado)

Guia prático para levar o app à Play Store em **teste fechado** e depois à produção.
O APK gerado pelo CI serve para testar em aparelhos; a Play Store pede um **AAB** assinado com a chave de envio.

## 1. Antes de começar

- Conta de desenvolvedor Google Play (taxa única) e o app criado no Play Console, pacote `com.bibliolingo.app`.
- Política de privacidade em uma página pública (o link é obrigatório). Ela precisa citar: login por e-mail/Google, progresso e perfil guardados na conta, foto de perfil, pedidos ao Professor Noah (IA), notificações de estudo e o funil de uso local.
- Contas pessoais criadas depois de novembro de 2023 precisam de **testadores no teste fechado** (hoje, pelo menos 12 pessoas por 14 dias seguidos) antes de pedir acesso à produção. Convide cedo.

## 2. Gerar o AAB assinado

1. `eas build -p android --profile production` (ou um workflow que rode `./gradlew bundleRelease` com `-PreactNativeArchitectures=arm64-v8a,armeabi-v7a`).
2. Use a assinatura do Google Play (Play App Signing). Guarde a *upload key* em local seguro; nunca a versione.
3. Aumente `versionCode` a cada envio (o CI já usa o número da execução).

## 3. Ficha da loja

- Nome, descrição curta (80 caracteres) e longa, ícone 512×512, imagem de destaque 1024×500.
- Capturas de tela de celular (mínimo 2): trilha com fundo do livro, tela de felicitações, cartão de compartilhar, Professor Noah, planos de leitura.
- Categoria: Educação. Classificação indicativa: responda o questionário (conteúdo religioso, sem violência gráfica).

## 4. Segurança dos dados (Data safety)

Declare, de forma coerente com a política de privacidade:

| Dado | Coletado | Compartilhado | Motivo |
|---|---|---|---|
| E-mail e nome | Sim (conta) | Não | Autenticação, ranking e perfil |
| Foto de perfil | Opcional | Não | Perfil e cartões |
| Progresso de estudo | Sim | Não | Sincronizar entre aparelhos |
| Mensagens ao Professor Noah | Sim | Provedor de IA (processamento) | Responder perguntas |
| Notificações | Local | Não | Lembretes de estudo |

Informe que os dados são criptografados em trânsito e que a pessoa pode pedir a exclusão da conta.

## 5. Pontos que costumam gerar dúvida na revisão

- **Ícone que muda:** o app troca o ícone da tela inicial conforme a frequência de acesso (Lumi feliz, triste ou brava). Isso é feito com *activity-alias* e não envia nada. Explique na descrição e nas notas de revisão para não parecer troca enganosa de marca.
- **Notificações:** o aviso de permissão só aparece depois da primeira lição (já é assim); mantenha o canal "Lembrete de estudo".
- **Tarefa em segundo plano:** usada apenas para atualizar o ícone; não consome rede.
- **Conteúdo religioso:** informe que é estudo bíblico e que não há compras reais (as moedas Lumi são ganhas estudando).

## 6. Roteiro do teste fechado (14 dias)

1. Dia 0: publicar a faixa de teste fechado e convidar testadores por e-mail ou grupo.
2. Dias 1–14: pedir que usem o app todo dia; acompanhar o **Funil de uso** (Perfil → Funil de uso) de alguns aparelhos e o Android vitals do Play Console (travamentos e ANR devem ficar abaixo de 1%).
3. Corrigir o que aparecer, subir novas versões na mesma faixa.
4. Dia 14+: solicitar acesso à produção, preencher o questionário e enviar para revisão.

## 7. Lista de verificação final

- [ ] Política de privacidade publicada e linkada
- [ ] Data safety preenchida
- [ ] Capturas de tela e ícone 512×512
- [ ] AAB assinado e versionado
- [ ] Testadores convidados (12+)
- [ ] Revisão de acessibilidade feita (leitor de tela, fonte grande, contraste)
- [ ] Chaves de serviços de terceiros revogadas e trocadas por segredos do ambiente
