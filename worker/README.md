# Backend seguro do Noah

Cloudflare Worker opcional para manter as chaves do Groq e Gemini fora da PWA estática. O plano gratuito pode ser usado, mas os limites e preços dos provedores devem ser conferidos antes de ativar.

## Configuração

1. Instale o Wrangler localmente: `npm install --save-dev wrangler` dentro desta pasta ou use `npx wrangler`.
2. Autentique: `npx wrangler login`.
3. Crie o KV: `npx wrangler kv namespace create USAGE` e outro com `--preview`.
4. Copie os IDs para `wrangler.toml`.
5. Cadastre ao menos um segredo:
   - `npx wrangler secret put GROQ_API_KEY`
   - `npx wrangler secret put GEMINI_API_KEY` (fallback opcional)
6. Opcional: `npx wrangler secret put TURNSTILE_SECRET_KEY`.
7. Ajuste `ALLOWED_ORIGINS` e execute `npx wrangler deploy`.
8. Configure no build da PWA: `VITE_NOAH_API_URL=https://bibliolingo-noah.<conta>.workers.dev`.

Nunca coloque chaves em arquivos `.env` do frontend, variáveis `VITE_*` ou GitHub Pages. O Worker não registra conversas. O KV armazena somente contadores diários com identificador e IP irreversivelmente resumidos. Limites em KV são aproximados devido à consistência eventual; autenticação e Durable Objects são recomendados para proteção forte em escala.
