# Backend seguro do Noah

Cloudflare Worker do professor contextual. A PWA nunca recebe a chave Groq: o GitHub Actions envia o valor diretamente para os secrets do Worker.

## Publicação automática

O workflow `.github/workflows/deploy-cloudflare.yml` publica quando `worker/**` ou o próprio workflow muda na branch `main`. Também aceita execução manual.

Secrets obrigatórios no repositório:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`;
- `CLOUDFLARE_KV_NAMESPACE_ID`;
- `GROQ_API_KEY`.

O token Cloudflare precisa editar Workers Scripts e Workers KV na conta selecionada. O ID do KV é inserido apenas em uma cópia efêmera de `wrangler.toml` no runner; ele não é gravado no Git. `GROQ_API_KEY` é cadastrado pelo Wrangler como secret do Worker e não aparece em variáveis `VITE_*`, arquivos ou logs.

Após o primeiro deploy, copie a URL pública exibida no resumo do workflow para a variável de Actions `VITE_NOAH_API_URL`. Execute novamente “Deploy GitHub Pages” para embutir a URL pública na PWA.

## Limites e plano gratuito

A configuração inicial limita cada instalação+IP a 30 solicitações diárias, cada resposta a 700 tokens e o projeto a 200.000 tokens diários. Contadores expiram em dois dias. Isso foi desenhado para permanecer em escala inicial nos planos gratuitos, mas quotas dos provedores podem mudar e devem ser acompanhadas nos painéis oficiais.

KV possui consistência eventual: o limite reduz abuso, mas não é uma garantia transacional. Em escala maior, use autenticação e Durable Objects. O Worker não persiste conversas.

## Endpoints

- `GET /health`: estado administrativo, sem consultar o provedor.
- `POST /v1/tutor`: valida contexto e pergunta, aplica CORS/limites e chama a API oficial Groq.

Origem permitida: `https://viniciusliniker1-spec.github.io`.
