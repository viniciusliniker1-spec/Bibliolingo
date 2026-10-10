# Arquitetura — Bibliolingo AI, Grego Koiné e Dicionário

## Auditoria do projeto

- **Framework:** React 19, TypeScript 5.9 e Vite 7.
- **Rotas:** React Router 7 com `HashRouter`, adequado ao GitHub Pages.
- **Conteúdo:** contratos TypeScript e catálogos versionados fora dos componentes.
- **Engines:** jornada bíblica, Aprofundar e Formação possuem players próprios, mas compartilham estado, XP, streak, tentativas e feedback.
- **Persistência:** IndexedDB via `idb`; backups validados por Zod; schema atual 7.
- **Autenticação:** inexistente. O produto é local-first e não possui contas.
- **PWA:** manifest, service worker próprio e registro pelo shell. Interface e conteúdo empacotado funcionam após cache; livros bíblicos externos ficam offline depois da primeira visita.
- **Deploy:** GitHub Actions testa e compila; `main` alimenta o GitHub Pages.
- **IA anterior:** WebLLM local opcional, dependente de WebGPU e download grande.
- **Conflito identificado:** uma PWA estática não pode proteger chaves Groq/Gemini. Por isso o novo provedor remoto fica em um Worker separado e opcional.

Nenhuma biblioteca de produção foi substituída. Não foi adicionada dependência ao bundle principal.

## Componentes

```text
PWA React
 ├─ NoahTutor (sessão, acessibilidade, contexto mínimo)
 ├─ Curso de Grego (conteúdo determinístico)
 ├─ Dicionário local (busca normalizada)
 └─ IndexedDB schema 7
          │ HTTPS, quando configurado
Cloudflare Worker
 ├─ validação e CORS
 ├─ Turnstile opcional
 ├─ limite por instalação+IP
 ├─ limite global de tokens
 ├─ Groq (primário)
 └─ Gemini (fallback opcional)
```

### Fronteiras de segurança

O frontend recebe apenas `VITE_NOAH_API_URL` e, opcionalmente, a chave pública do Turnstile. Segredos nunca usam prefixo `VITE_`. O Worker aceita somente contexto pedagógico tipado, reduz histórico, limita caracteres e tokens, delimita conteúdo recuperado como dados não confiáveis e impede que respostas da IA alterem pontuação.

O identificador de instalação é aleatório e local. O IP é resumido antes de formar a chave diária. Isso reduz abuso, mas não equivale a autenticação; para isolamento forte entre pessoas, deve-se adicionar login e autorização. O KV tem consistência eventual, portanto os limites são aproximados. O consumo pago nunca é ativado automaticamente.

## Variáveis

### Build da PWA

| Variável | Obrigatória | Finalidade |
|---|---:|---|
| `VITE_NOAH_API_URL` | para Noah remoto | URL pública do Worker, sem segredo |
| `VITE_TURNSTILE_SITE_KEY` | não | chave pública do desafio |

### Segredos do Worker

| Variável | Obrigatória | Finalidade |
|---|---:|---|
| `GROQ_API_KEY` | para Groq | provedor primário |
| `GEMINI_API_KEY` | apenas fallback | provedor alternativo |
| `TURNSTILE_SECRET_KEY` | não | validação antiabuso |

As demais opções seguras estão em `worker/wrangler.toml`: modelos, origens, limites, timeout e `AI_ENABLED`.

## Configuração dos provedores

### Groq

1. Crie uma chave no console oficial do Groq.
2. Na pasta `worker`, execute `npx wrangler secret put GROQ_API_KEY`.
3. Mantenha `PRIMARY_PROVIDER = "groq"` e escolha um modelo disponível em `GROQ_MODEL`.
4. Confira os limites e preços atuais antes de implantar.

### Gemini

1. Gere a chave pelo serviço oficial do Google AI compatível com sua conta.
2. Execute `npx wrangler secret put GEMINI_API_KEY`.
3. Defina `GEMINI_MODEL` para um modelo disponível.
4. O fallback só ocorre se a chave existir; ele não é habilitado por suposição nem sem autorização do operador.

## Deploy seguro

1. Crie os namespaces KV e substitua os placeholders do `wrangler.toml`.
2. Restrinja `ALLOWED_ORIGINS` ao domínio real do app.
3. Cadastre segredos pelo Wrangler, nunca por commit.
4. Execute os testes.
5. Com autorização de publicação, execute `npx wrangler deploy`.
6. Configure `VITE_NOAH_API_URL` no ambiente de build do Pages e gere nova versão.
7. Verifique `/health`, CORS, limites e uma conversa com cada provedor configurado.

Esta branch não executa os passos 5–7: eles alteram serviço externo/produção e exigem autorização e credenciais.

## Curso de grego

O currículo cobre alfabeto; leitura e pronúncia; vocabulário; sistema nominal; sistema verbal; frases; leitura guiada do NT; e grego intermediário. Cada unidade declara objetivos e oferece quatro lições e checkpoint. Todo exercício tem gabarito determinístico e explicação. A IA apenas ensina e pratica; não é fonte de correção.

O estado registra conclusão, tentativas, erros, revisão, habilidades e lexemas aprendidos. A migração 7 é aditiva. Backups antigos são migrados sem apagar progresso.

## Dicionário e licenças

A edição inicial utiliza dados do **TBESG — Translators Brief lexicon of Extended Strong’s for Greek**, no repositório oficial STEP Bible Data, atribuído a STEP Bible / Tyndale House Cambridge, licença **CC BY 4.0**. A aplicação exibe fonte, URL e licença em cada verbete. As sínteses portuguesas são conteúdo editorial do projeto.

MorphGNT e SBLGNT foram investigados como opções futuras, mas não foram redistribuídos nesta entrega. Disponibilidade pública não foi tratada como domínio público. Novas fontes devem entrar por camada de importação após revisão da licença, atribuição e compatibilidade de redistribuição.

## Testes e estado da validação

Automatizados:

- validação do cliente Noah, contexto e falhas;
- entradas, isolamento de instruções, rate limit e desligamento do Worker;
- integridade das 8 unidades, formatos e checkpoints;
- busca grega, transliteração e Strong;
- progresso, migração, backup, revisão e regras existentes;
- TypeScript e build Vite pelo CI.

Não executados nesta branch:

- chamada real Groq/Gemini, pois não há credenciais;
- deploy do Worker ou do Pages;
- testes físicos em Android/iOS;
- auditoria acadêmica final do conteúdo.

## Limitações e próximas decisões

- O dicionário inicial é uma base útil, não completa.
- As lições precisam de revisão docente antes de serem anunciadas como curso acadêmico definitivo.
- O histórico do tutor é apenas da sessão e não é persistido.
- Preparação pastoral recebe tutor e simulação pedagógica, mas não concede aprovação e não substitui a denominação.
- Adicionar autenticação e orçamento por conta precede uma abertura pública em escala.
