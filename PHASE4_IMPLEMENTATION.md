# Bibliolingo Fase 4 — implementação

## Entregue nesta branch

### Professor Noah 2.0

- Reutiliza o Worker Cloudflare e os provedores existentes.
- Web: mantém o perfil limitado às 40 tentativas recentes e acrescenta uma prioridade pedagógica.
- Android: envia fila de revisão, erros recorrentes e conceito atual como contexto autorizado.
- Nova ação “O que devo revisar?” nas duas plataformas.
- Noah continua sem permissão para corrigir gabaritos, conceder XP ou modificar progresso.

### Revisão inteligente

- Nova aba **Revisar** no Android.
- Mesmos intervalos da Web: 0, 1, 3, 7, 14 e 30 dias.
- Erros recorrentes e itens atrasados recebem prioridade.
- Questões são reutilizadas do catálogo editorial existente.
- Ajuda contextual do Noah após correção.
- Histórico remoto de respostas reconstrói a fila em Web e Mobile.
- Mesclagem usa a revisão mais recente por questão e não duplica XP.

### Notificações

- Preferências por categoria: diária, sequência, inatividade e revisão.
- Horário principal e horário de silêncio.
- Política testada que:
  - não lembra quando a meta foi cumprida;
  - não alerta sequência depois de estudo no dia;
  - aguarda três dias para inatividade;
  - evita repetição da mesma categoria no mesmo dia;
  - prioriza revisão pendente;
  - não usa linguagem de culpa.
- Web: Notification API e link para a rota relevante enquanto o PWA/navegador permite execução.
- Android: tela e persistência local das preferências.

#### Notificações locais Android

- `expo-notifications ~57.0.23`, versão declarada pelo SDK 57.
- Plugin configurado no `app.json`.
- Canal Android `study-reminders`.
- Permissão solicitada somente após a ação “Salvar e programar”.
- Programações anteriores são canceladas antes de reagendar.
- No máximo um aviso por dia para os próximos sete dias.
- Reagendamento ao abrir o app, retornar ao primeiro plano ou alterar o progresso.
- Toque abre Início ou Revisar conforme a categoria.
- Push remoto permanece fora de escopo e não está ativado.
- A entrega exata em segundo plano ainda precisa de validação física, pois otimizações de bateria variam entre fabricantes.

### Gamificação

- Meta semanal derivada de cinco metas diárias.
- Desafios de constância e revisão calculados sobre o progresso existente.
- Nenhuma carteira, XP ou conquista paralela foi criada.
- Regras existentes de nível, XP, streak, corações, checkpoints e conquistas permanecem intactas.

### Design System e telas

A rota Web `#/phase4-preview` e a tela Mobile `/phase4-preview` oferecem uma prévia isolada das nove propostas:

1. Início
2. Trilhas
3. Lição
4. Revisar
5. Professor Noah
6. Conquistas
7. Comunidade
8. Perfil
9. Notificações

A prévia utiliza #21A675, #244B72, #F5BC47, #F7F9F8 e #24312D. Nenhum layout principal foi substituído.

### Comunidade

Foram preparados contratos de grupo, membros, papéis, convites e desafios. O acesso ao progresso exige consentimento `shareProgress` e papel compatível. Não há banco, convite ativo, mensagens privadas ou botão fingindo uma funcionalidade pronta.

## Como testar no Android

```bash
cd /workspaces/Bibliolingo
git fetch origin
git switch feature/bibliolingo-phase-4
cd mobile
npm install
npx expo start --tunnel --clear
```

No Expo Go:

1. Entre com a conta.
2. Erre uma questão existente.
3. Abra a aba **Revisar**.
4. Faça a revisão e abra Noah após um erro.
5. Em Perfil, abra **Configurar notificações**.
6. Em Perfil, abra **Prévia visual da Fase 4**.
7. Feche e reabra o aplicativo para verificar persistência.

## Teste Web

```bash
cd /workspaces/Bibliolingo
npm install
npm run test
npm run build
```

Abra `#/profile`, configure notificações e acesse a prévia isolada. A rota atual dos 66 livros deve continuar inalterada.

## Segurança e privacidade

- Nenhuma chave foi adicionada ao cliente.
- O contexto pedagógico não inclui e-mail, nome ou histórico completo de conversa.
- Preferências de notificação são locais.
- Comunidade não publica dados nesta etapa.
- Conteúdo editorial, gabaritos e rotas bíblicas não foram modificados.
