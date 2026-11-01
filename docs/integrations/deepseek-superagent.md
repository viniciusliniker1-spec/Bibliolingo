# DeepSeek DSH Superagent | Bibliolingo

Status: preparação técnica. O agente **não está instalado nem executando**.

## Objetivo
Conectar o protótipo `deepseek-ai/dsh-superagent-prototype` ao GitHub do Bibliolingo, com autonomia ampliada para propor tarefas, implementar mudanças em branches isoladas, executar verificações e abrir Pull Requests. A publicação e o merge na `main` exigem aprovação humana.

## Arquitetura e limites
- Executar o DSH Superagent em serviço isolado, fora do PWA, do aplicativo mobile e do Cloudflare Worker do tutor Noah.
- Manter Gemini/Groq do tutor como estão. Não inserir credenciais do agente no frontend.
- Usar GitHub App com permissões mínimas, webhook validado e acesso restrito ao repositório `viniciusliniker1-spec/Bibliolingo`.
- Desabilitar merges automáticos, push direto na `main`, deploy e mudanças em segredos ou infraestrutura de produção.
- Permitir tarefas proativas somente conforme regras explicitamente aprovadas. Não permitir execução irrestrita disparada por comentários de terceiros.
- Isolar o workspace de execução, limitar rede, tempo e orçamento, e não disponibilizar segredos do usuário aos jobs.
- Antes de qualquer PR, executar `npm test` e `npm run build`; quando pertinente, testes de regressão mobile, autenticação e persistência.
- Preservar IDs e versões de conteúdo, progresso IndexedDB, migrações, XP, checkpoints, offline e editorial bíblico.

## Etapas para ativação
1. Revisar `README.md`, `SETUP.md` e documentação de autorização/deployment do protótipo.
2. Escolher host e estimar custos do runtime e do modelo. O projeto atual é local-first e não requer custo fixo.
3. Configurar GitHub App, webhooks e credenciais no host seguro. Nunca commitar tokens.
4. Instalar o protótipo em ambiente separado, seguindo instruções oficiais e fixando uma revisão auditada.
5. Testar um pedido inofensivo que produza um PR de documentação, sem merge automático.
6. Validar logs, controle de permissões, rollback e limites de consumo antes de habilitar ações proativas.

## Política de tarefas
O agente pode investigar issues, propor melhorias, criar branches e PRs e executar testes. Alterações de conteúdo bíblico, autenticação, pagamentos, dados pessoais, infraestrutura e dependências críticas exigem revisão explícita. Nenhum job pode publicar automaticamente.

## Referência
https://github.com/deepseek-ai/dsh-superagent-prototype

Este documento prepara a integração. Ele não declara que o serviço foi instalado, configurado ou testado.
