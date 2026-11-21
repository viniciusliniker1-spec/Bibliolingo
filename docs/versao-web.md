# Versão web = o próprio app (publicada na Vercel)

O site é o app Expo exportado para a web (`npm run export:web`, na pasta `mobile/`): mesmas telas e funções
do aplicativo, sem manter dois códigos. O site antigo (Vite/PWA, GitHub Pages) continua onde está.

## Como funciona

- **Build:** `npm run export:web` gera `mobile/dist-web`. `scripts/finalize-web.mjs` liga o manifesto do PWA
  e adiciona a moldura de celular. Para publicar em subpasta (GitHub Pages) defina `EXPO_BASE_URL` e `EXPO_PUBLIC_BASE_URL`;
  na Vercel (domínio na raiz) não defina nenhuma.
- **Rotas:** `mobile/vercel.json` reescreve qualquer caminho para `index.html` (links diretos funcionam) e define cache
  longo para os arquivos com hash.
- **Telas largas (≥ 760 px):** o app aparece dentro de um quadro de celular centralizado; no celular abre em tela cheia.

## Configurar a Vercel (uma vez)

1. Em vercel.com → *Add New… → Project* → importe o repositório `Bibliolingo`.
2. **Root Directory:** `mobile`. Marque *Include source files outside of the Root Directory in the Build Step*
   (o app usa o conteúdo das lições, que fica em `src/` na raiz).
3. *Framework Preset:* Other. O `vercel.json` já traz *Install* (`npm ci`), *Build* (`npm run export:web`) e *Output* (`dist-web`).
4. **Environment Variables** (Production e Preview):
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://bldjisxjhkxljblzpmru.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = a chave publicável (a mesma do app e do site antigo)
   - `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED` = `true`
   - `EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED` = `false`
   - `EXPO_PUBLIC_NOAH_API_URL` = `https://bibliolingo-noah.vinicius-liniker1.workers.dev`
5. **Production Branch:** `main` (ou a branch que você escolher). Cada PR/branch ganha um endereço de teste.
6. No Supabase → *Authentication → URL Configuration*: em *Redirect URLs* adicione
   `https://<seu-dominio>/auth/callback` (e o endereço `*.vercel.app` de teste). Sem isso, o login com Google e os links de
   e-mail (confirmar conta, recuperar senha) não voltam para o site.
7. Opcional: *Settings → Domains* para usar um domínio próprio.

## Endereços para liberar no Supabase

Em *Authentication → URL Configuration → Redirect URLs* (e *Site URL* com o endereço de produção):

- `https://bibliolingo-mobile.vercel.app/auth/callback` (produção; confirme o nome exato em *Settings → Domains* na Vercel)
- `https://bibliolingo-mobile-*-viniciusliniker1-spec.vercel.app/auth/callback` (curinga para os endereços de teste de cada deploy)

Não use o endereço de um deploy específico (o que tem um código no meio): ele muda a cada publicação.

## O que muda na web

| Recurso | Na web |
|---|---|
| Login por e-mail | Funciona; a sessão fica no `localStorage` (não há cofre do sistema) |
| Login Google | O retorno é a própria página (`/auth/callback`); exige o passo 6 |
| Notificações e lembretes | Não existem na web (ficam no app) |
| Ícone que muda, widget, tarefa em segundo plano | Só no Android |
| Compartilhar cartão | Baixa a imagem em PNG |
| Biometria | Não existe na web |
| Sons | Tocam depois do primeiro toque (regra dos navegadores) |
| Offline | Não funciona sem internet |

O progresso salvo só no navegador (visitante) no site antigo não é migrado; quem tem conta mantém tudo.
`mobile/public/sw.js` existe para o caso de a versão nova ser servida no mesmo endereço do site antigo: ele remove o
service worker velho.
