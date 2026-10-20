# Auditoria técnica — Professor Noah 2.0

Data: 2026-10-14  
Branch: `feature/noah-2-contextual`

## Arquitetura confirmada

- Frontend: React 19, TypeScript e Vite 7, com React Router.
- PWA: manifesto e service worker próprio; interface e conteúdo empacotado funcionam offline após o primeiro carregamento.
- Persistência: IndexedDB por `idb`, estado versionado, backup validado por Zod.
- Aprendizagem: conteúdo tipado como dados; correção determinística em `ExerciseView`; XP, streak, corações, revisão e domínio permanecem no reducer/domínio, fora da IA.
- IA: cliente `noahRemote.ts` → Cloudflare Worker → provedores REST. Nenhuma chave chega ao navegador.
- Worker: CORS por origem, validação e truncamento, Turnstile opcional, limite diário por instalação+IP, orçamento global de tokens em KV, timeout, recuperação bíblica e validação canônica.
- Provedores encontrados: Groq e Gemini já possuem adaptadores. O deploy atual publica apenas o segredo Groq e configura Groq como principal.
- Conteúdo recuperável: Almeida 1819 com revisão fixada; registro de fontes; léxico grego local; conteúdo editorial bíblico, aprofundado e pastoral.
- UI: `NoahTutor` mantém histórico somente na sessão React e renderiza Markdown sem HTML.
- Testes/workflows: Vitest, build TypeScript/Vite, auditoria npm, Pages e deploy Cloudflare automatizados.

## Fluxo atual da questão

1. `ExerciseView` calcula o acerto localmente.
2. O reducer registra tentativa, revisão, coração e XP.
3. O feedback determinístico mostra a resposta correta e a explicação.
4. O Noah permanece como botão flutuante genérico.
5. A alternativa escolhida não chega ao tutor e o painel não abre automaticamente.

## Riscos identificados

- O contexto de exercício envia `exercise.explanation` mesmo antes da resposta, podendo revelar o gabarito em uma ajuda prévia.
- O fallback tenta novamente qualquer erro; deve limitar repetição/fallback a falhas elegíveis.
- Não há afinidade de provedor por sessão.
- A rota usa instalação anônima, origem e IP resumido, mas não possui conta autenticada.
- O Worker não guarda conversas, o que reduz o risco de vazamento, mas a autorização anônima pode ser fortalecida com token efêmero.
- Não existe comparação ao vivo Gemini/Groq com 30 casos.
- Conteúdo marcado para revisão editorial não deve ser completado por inferência do modelo.

## Decisões desta evolução

- Preservar Worker e API REST; não adotar Cloudflare Agents SDK ou Google ADK. A sessão é curta, o estado pedagógico já é local e esses frameworks adicionariam dependência e migração sem ganho necessário para o fluxo prioritário.
- Modelo principal selecionado: `gemini-3.8-flash`, confirmado na documentação oficial do Gemini em 2026-10-14.
- Groq permanece como fallback.
- Criar autorização por sessão anônima efêmera em KV, sem contas e sem dados pessoais.
- Derivar memória pedagógica resumida do progresso local existente; não persistir conversa completa.
- Implementar feature flag para retornar ao painel anterior.
- Nunca enviar gabarito ou explicação oficial antes da correção.

## Fontes técnicas verificadas

- Modelos Gemini: https://ai.google.dev/gemini-api/docs/models
- GenerateContent REST: https://ai.google.dev/api/generate-content
- Limites: https://ai.google.dev/gemini-api/docs/rate-limits
- Preços e modalidade gratuita: https://ai.google.dev/gemini-api/docs/pricing

A modalidade gratuita possui cotas variáveis e não é ilimitada. Nenhum faturamento será ativado pelo código.

## Plano incremental

1. Fortalecer contratos de contexto e criar memória pedagógica resumida.
2. Integrar o fluxo erro/acerto/ajuda prévia ao painel.
3. Tornar o painel controlável, minimizável e responsivo.
4. Implementar sessão efêmera, afinidade e fallback elegível no Worker.
5. Atualizar workflow para Gemini principal sem remover Groq.
6. Criar testes de regressão e conjunto de 30 avaliações.
7. Executar testes/build na branch; só então propor merge e deploy.
