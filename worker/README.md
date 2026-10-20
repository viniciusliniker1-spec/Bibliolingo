# Backend seguro do Professor Noah 2.0

Cloudflare Worker do tutor contextual do Bibliolingo. Gemini é o provedor principal e Groq é a contingência. Nenhuma chave chega ao navegador.

## Arquitetura

Fluxo:

1. a PWA cria uma sessão anônima curta em `POST /v1/session`;
2. o token é vinculado, no KV, ao identificador aleatório da instalação por duas horas;
3. `POST /v1/tutor` valida token, origem, tamanho, enums e contexto;
4. referências bíblicas são normalizadas e recuperadas da Almeida 1819;
5. Gemini responde como provedor principal;
6. somente timeout, limite, indisponibilidade ou erro 5xx permitem retentativa/fallback;
7. Groq assume como contingência e fica associado à sessão para evitar alternância indiscriminada;
8. a resposta passa pela validação canônica já existente.

O Worker não armazena conversas. O histórico enviado fica limitado aos oito últimos turnos da sessão. A memória pedagógica é um resumo de tentativas e revisões, sem nome, notas pessoais, XP ou conversas completas.

## Configuração obrigatória

Secrets do GitHub Actions:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`;
- `CLOUDFLARE_KV_NAMESPACE_ID`;
- `GEMINI_API_KEY`;
- `GROQ_API_KEY`.

`GEMINI_API_KEY` e `GROQ_API_KEY` são enviados pelo Wrangler como secrets do Worker. Nunca use o prefixo `VITE_` nessas chaves.

Variáveis públicas do Worker:

- `PRIMARY_PROVIDER="gemini"`;
- `GEMINI_MODEL="gemini-3.8-flash"`;
- `GROQ_MODEL` é selecionado entre os modelos disponíveis durante o deploy;
- `AI_ENABLED` desliga toda geração;
- `CONTEXTUAL_TUTOR_ENABLED` registra o estado administrativo;
- limites diários, de tokens e timeout ficam em `wrangler.toml`.

A interface tem a feature flag `VITE_NOAH_CONTEXTUAL_ENABLED`. Defina `false` no build para retirar gatilhos automáticos e conservar o tutor remoto anterior.

## Publicação

O workflow `.github/workflows/deploy-cloudflare.yml` roda na `main` quando o Worker ou seu workflow muda, e também manualmente.

Antes do deploy ele:

1. verifica os cinco secrets;
2. confirma o modelo Gemini na API oficial;
3. consulta os modelos Groq disponíveis;
4. cria uma configuração efêmera com o KV;
5. publica os dois secrets;
6. verifica saúde, sessão autenticada e uma resposta real do Gemini.

URL atual do Worker: `https://bibliolingo-noah.vinicius-liniker1.workers.dev`.

## Endpoints

- `GET /health`: flags, provedor principal e presença dos provedores; nunca retorna credenciais.
- `POST /v1/session`: recebe apenas `installationId`, limita emissões e retorna token curto.
- `POST /v1/tutor`: exige `Authorization: Bearer <token>`.

Origem de produção: `https://viniciusliniker1-spec.github.io`.

## Limites e custos

A configuração padrão limita cada instalação+IP a 30 perguntas diárias, cada saída a no máximo 2.400 tokens adaptados à intenção e o projeto a 200.000 tokens por dia. O KV também registra consumo agregado por provedor. Nenhum faturamento é ativado pelo código.

Cloudflare KV tem consistência eventual: os limites reduzem abuso, mas não são transacionais. Autenticação real e Durable Objects serão necessários se houver contas sincronizadas ou escala hostil. As modalidades gratuitas de Gemini, Groq e Cloudflare possuem cotas variáveis e não são promessa de gratuidade ilimitada.

## Recuperação e segurança pedagógica

- Ajuda anterior à correção recebe alternativas, mas não gabarito nem explicação.
- Após erro, resposta selecionada e correta vêm do mecanismo determinístico do app.
- Conteúdo editorial e fontes são delimitados como dados não confiáveis, evitando prompt injection.
- Lição marcada como pendente não pode ser completada por invenção.
- A IA não corrige exercícios, não altera XP, streak, domínio ou revisão.
- Falha dos dois provedores mantém a atividade e apresenta erro recuperável.
