# Plano de recuperação do Bibliolingo Mobile

**Status:** proposta para aprovação  
**Data:** 2026-10-21  
**Branch de auditoria:** `audit/mobile-recovery-phase-1`  
**Base preservada:** `main@39a55600391324a8b434cf77217f7615b5a4e342`

Este plano não foi executado. Ele organiza a Fase 2 sem alterar a Web, remover recursos, redesenhar a identidade ou gerar APK na Fase 1.

## Objetivo

Entregar um mobile mensurável, responsivo e visualmente integrado, preservando:

- autenticação e modo visitante;
- sincronização e progresso;
- Bíblia, anotações e marcações;
- trilhas, formação, grego e aprofundamento;
- revisão, aprendizado adaptativo, metas, planos, missões e dashboard;
- Professor Noah;
- XP, corações, níveis, sequência e conquistas;
- identidade aprovada e regras de visibilidade.

## Princípios de execução

1. Medir antes e depois de cada grupo de mudanças.
2. Separar correções de desempenho de integração visual para localizar regressões.
3. Não alterar a Web; qualquer módulo compartilhado exige testes Web antes do merge.
4. Não apagar nem reinicializar dados locais/remotos.
5. Assets masters permanecem imutáveis; o mobile usa derivados.
6. Nenhuma APK será chamada de candidata sem teste em aparelho real.
7. Uma tela só será “integrada” se o asset aparecer, for legível e não degradar desempenho.
8. Fase 2 só começa após aprovação explícita deste diagnóstico.

## Matriz de prioridade

| ID | Problema | Impacto | Esforço | Prioridade |
|---|---|---|---|---|
| R-01 | Sem métricas de cold start/interactive/memória | alto | baixo | P0 |
| R-02 | Assets originais no caminho do bundle e pipeline inconsistente | crítico | médio | P0 |
| R-03 | Trabalho adaptativo e curricular na primeira tela | alto | médio/alto | P0 |
| R-04 | Notificações reconciliadas em mudanças não relacionadas | médio/alto | baixo/médio | P1 |
| R-05 | Progresso completo serializado em toda alteração | alto crescente | médio | P1 |
| R-06 | Home/Planos/Missões/Dashboard sem virtualização adequada | alto | médio | P1 |
| R-07 | Catálogo agregado de todas as áreas | médio/alto | alto | P1 |
| R-08 | Cenários e maior parte da Lumi sem integração | alto visual | médio | P1, após baseline |
| R-09 | Ícones RGB/fundos e dimensões excessivas | alto visual/performance | médio | P1 |
| R-10 | Histórico local sem compactação/paginação | médio crescente | médio/alto | P2 |
| R-11 | Bíblia/léxico com parse de JSON grande | médio por rota | médio | P2 após medição |
| R-12 | Documentação visual divergente do código | médio | baixo | P2 |

## Fase 2A — Baseline e reprodução

### Alterações planejadas

- Criar marcadores:
  - native/process start quando disponível;
  - JS entry;
  - auth hydrated;
  - progress hydrated;
  - first Home render;
  - adaptive start/end;
  - app interactive.
- Guardar métricas de diagnóstico localmente, sem dados pessoais.
- Adicionar modo de diagnóstico controlado por build/flag.
- Capturar falhas de inicialização e duração das etapas sem enviar conteúdo do usuário.
- Medir uma build release em aparelho físico.

### Procedimento mínimo

- Limpar processo, não necessariamente dados.
- Executar cinco cold starts.
- Executar cinco warm starts.
- Testar conta nova, visitante e conta com histórico.
- Registrar `adb shell am start -W`, logcat, Perfetto/FrameTimeline e memória.
- Reproduzir offline, rede lenta e sessão expirada.

### Metas propostas, não resultados atuais

Os limites finais devem ser aprovados depois do primeiro baseline. Como alvo inicial:

- first frame: até 1,5 s em Android intermediário de referência;
- Home interativa: até 2,5 s em cold start sem refresh de sessão;
- ausência de tela sem feedback por mais de 500 ms;
- nenhuma tarefa JS contínua acima de 100 ms no caminho crítico;
- nenhuma tela cinza infinita após erro de storage/rede;
- memória estável após abrir/fechar Conquistas, Bíblia e Planos.

Esses valores são objetivos de engenharia, não métricas alcançadas.

### Gate de saída

- Relatório reproduzível com hardware, Android, build, cinco amostras e mediana/p95.
- Causa da tela cinza localizada ou falha instrumentada com recuperação visível.
- Bundle/APK/assets inventariados em bytes.

## Fase 2B — Pipeline mobile de assets

### Estratégia

- Manter `design-assets/` como masters aprovados.
- Criar diretório derivado exclusivo, por exemplo `mobile/assets/generated/`.
- Gerar variantes determinísticas por classe:
  - tab bar;
  - cards/menu;
  - Lumi pequena/média;
  - medalhas;
  - cenários por densidade.
- Preservar alfa; bloquear automaticamente RGB quando a superfície exigir transparência.
- Gerar manifest com hash, dimensão, formato, bytes e origem.
- Fazer todo build local, CI e EAS consumir os mesmos derivados.
- Falhar a validação se um asset referenciado estiver ausente ou acima do limite definido.

### Validação

- comparar pixels/recorte com master;
- medir bytes e memória decodificada;
- testar Android nas densidades mdpi/xhdpi/xxhdpi;
- verificar ícone adaptativo separadamente;
- manter fallback para Notificações, 01 e 13 de conquistas e PNGs inválidos.

### Gate de saída

- nenhum master grande é incluído por engano no APK;
- manifest de assets empacotados confere com o bundle;
- identidade aprovada visualmente preservada;
- tamanho e memória comparados ao baseline.

## Fase 2C — Caminho crítico de startup

### Mudanças candidatas

1. Montar apenas serviços essenciais antes da tela de entrada.
2. Não bloquear a entrada pela hidratação de domínios que não aparecem nela.
3. Exibir Home estrutural antes do cálculo adaptativo.
4. Calcular recomendações depois do primeiro frame ou usar snapshot cacheado com revisão.
5. Adiar import/configuração de notificações até hidratação e idle.
6. Carregar índices curriculares leves; detalhes somente na rota correspondente.
7. Confirmar se `inlineRequires` reduz avaliação real por meio do profiler.
8. Implementar timeout e estado de erro recuperável para auth/storage, sem perder dados.

### Restrições

- não pular refresh de sessão necessário;
- não mostrar progresso incorreto;
- não iniciar sincronizações duplicadas;
- não trocar silenciosamente dados remotos por locais;
- não remover notificações, apenas mudar o momento/critério da reconciliação.

### Gate de saída

- melhora estatisticamente demonstrada nas mesmas condições do baseline;
- autenticação, visitante, biometria e deep links preservados;
- cold start offline funcional;
- nenhuma regressão Web em módulos compartilhados.

## Fase 2D — Renderização e persistência

### Renderização

- converter Home, Planos, Missões e Dashboard para `FlatList`/`SectionList`;
- paginar histórico;
- memorizar itens com props estáveis;
- evitar `indexOf` e filtros repetidos dentro de render de listas;
- pré-computar sets de IDs concluídos por snapshot;
- limitar calendário e catálogos ao necessário na tela.

### Persistência

- coalescer gravações rápidas;
- particionar progresso por domínio com migração versionada;
- manter flush em background/saída;
- preservar eventos idempotentes;
- definir retenção/agregação para históricos sem apagar evidência obrigatória;
- medir parse/stringify antes e depois.

### Notificações

- usar fingerprint apenas dos campos relevantes;
- reconciliar na hidratação, mudança de preferência e agenda;
- impedir reagendamento após cada resposta.

### Gate de saída

- scroll sem jank perceptível nas telas críticas;
- histórico extenso não degrada startup acima do orçamento definido;
- testes de migração e recuperação passam;
- sincronização concorrente permanece idempotente.

## Fase 2E — Integração visual mobile

Executar somente depois dos gates de desempenho anteriores.

### Ordem recomendada

1. Corrigir ícones das abas com variantes transparentes/otimizadas.
2. Integrar Home: Lumi de saudação/retorno e um cenário aprovado.
3. Integrar hubs: Trilhas, Estudar, Grego, Formação e Planos.
4. Completar player: início, acerto, erro, checkpoint e conclusão de rota.
5. Integrar estados de Missões e Dashboard.
6. Integrar Lumi de nova conquista após confirmação persistida.
7. Integrar estados de loading, conexão e tela não encontrada.
8. Integrar Professor Noah com identidade própria, sem confundir com Lumi.
9. Avaliar cenários em Bíblia somente fora da área de leitura.

### Regras de associação

- uma pose por significado, não por conveniência;
- cenários dependem de contraste e safe area;
- nenhum asset sobre campo, questão ou controle;
- celebração apenas após evento confirmado;
- conquista 09 continua oculta sem entitlement real;
- as 66 ilustrações de livros continuam fora do escopo;
- Notificações mantém fallback até existir arquivo aprovado.

### Gate de saída

- matriz de `visual-integration-audit.md` atualizada com evidência por tela;
- screenshots de Android pequeno/médio/grande;
- comparação de memória com e sem cenário;
- teste de acessibilidade e contraste;
- aprovação visual humana antes da candidata APK.

## Fase 2F — Validação regressiva

### Testes automatizados

- typecheck e testes mobile existentes;
- auth, sessão, visitante e biometria;
- hidratação/migração de progresso;
- sync offline/online, duplicidade e conflito;
- eventos de revisão, planos, missões e conquistas;
- segredo da conquista 09;
- catálogo/rotas e deep links;
- manifesto e limites de assets;
- componentes de estado e fallback.

### Testes em dispositivo

- Android de referência com pouca/média memória;
- instalação limpa e atualização por cima da versão anterior;
- conta nova, conta antiga e visitante;
- offline, rede lenta e troca de rede;
- abrir repetidamente Home, Conquistas, Bíblia, Planos e Dashboard;
- teclado nas notas e campos do Noah;
- background/foreground e notificação;
- rotação permanece bloqueada em portrait conforme configuração;
- acessibilidade, fonte ampliada e leitor de tela.

### Web

A Web não será modificada. Como `src/` é compartilhado, qualquer alteração futura nessa pasta exige CI Web e smoke test da URL publicada antes do merge.

## Estratégia de branches e commits

- Branch atual de auditoria: `audit/mobile-recovery-phase-1`.
- Branch sugerida após aprovação: `fix/mobile-recovery-phase-2`, criada a partir do commit aprovado da auditoria ou do `main` vigente.
- Commits pequenos por domínio:
  1. observabilidade;
  2. asset pipeline;
  3. startup;
  4. persistência/notificações;
  5. virtualização;
  6. integração visual por grupo;
  7. testes/documentação.
- Não fazer push direto no `main`.
- Não misturar mudanças Web deliberadas.
- Antes do merge, revisar diff para garantir que apenas mobile, testes, workflow necessário e documentação foram alterados.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Migração corromper progresso | versionamento, backup lógico, testes com fixtures antigas e rollback |
| Lazy loading mudar ordem de currículo | índices derivados da mesma fonte autoritativa e testes de paridade |
| Debounce perder gravação | flush em AppState/background e fila transacional |
| Asset otimizado perder identidade | masters imutáveis, comparação visual e aprovação |
| Cenário reduzir legibilidade | overlay testado, contraste e fallback sem cenário |
| Separação de catálogos afetar Web | evitar mudanças compartilhadas quando possível; CI Web obrigatório |
| Notificação deixar de atualizar | fingerprint e testes de virada de dia/preferência |
| Métrica de debug distorcer release | medir build release sem ferramentas invasivas |
| APK menor continuar lento | profiler orienta CPU/storage/render; não usar tamanho como única explicação |

## Entregáveis esperados da Fase 2

1. Baseline com números reproduzíveis.
2. Inventário exato de bundle/APK/assets.
3. Correções com comparação antes/depois.
4. Matriz visual atualizada e capturas.
5. Testes automatizados e em aparelho.
6. Relatório de migração e compatibilidade.
7. Somente depois, uma APK candidata de teste com link real.

## Decisão solicitada

A Fase 1 termina com estes documentos. Nenhuma implementação ou APK foi iniciada. Para avançar, é necessária aprovação explícita para iniciar a Fase 2 pela etapa **2A — baseline e reprodução**, sem integrar novas funcionalidades nesse primeiro momento.
