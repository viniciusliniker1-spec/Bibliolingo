# Versão web = o próprio app

O site passa a ser o app Expo exportado para a web (`npm run export:web`, na pasta `mobile/`).
Mesmas telas e funções do aplicativo, sem manter dois códigos.

## Como funciona

- **Build:** `EXPO_BASE_URL=/Bibliolingo EXPO_PUBLIC_BASE_URL=/Bibliolingo npm run export:web` gera `mobile/dist-web`.
  `scripts/finalize-web.mjs` liga o manifesto do PWA, copia `index.html` para `404.html`
  (o GitHub Pages não reescreve rotas: links diretos caem no `404.html`, que carrega o mesmo app)
  e adiciona a moldura de celular.
- **Telas largas (≥ 760 px):** o app aparece dentro de um quadro de celular centralizado (iframe).
  No celular, abre direto, em tela cheia.
- **Publicação:** `.github/workflows/pages.yml` monta o site com o app na raiz e a versão anterior (Vite/PWA)
  em `/legacy/`. O workflow só roda em `main` e na branch de paridade: nada é publicado a partir da branch de trabalho.
- **Service worker antigo:** `mobile/public/sw.js` substitui o da versão anterior e se remove, para quem já visitou
  o site não ficar preso ao app velho.

## O que muda na web

| Recurso | Na web |
|---|---|
| Login por e-mail | Funciona; a sessão fica no `localStorage` (não há cofre do sistema) |
| Login Google | O retorno é a própria página (`/auth/callback`); é preciso liberar essa URL no Supabase (veja abaixo) |
| Notificações e lembretes | Não existem na web (ficam no app) |
| Ícone que muda, widget, tarefa em segundo plano | Só no Android |
| Compartilhar cartão | Baixa a imagem em PNG (não há folha de compartilhamento) |
| Biometria | Não existe na web |
| Sons | Tocam depois do primeiro toque (regra dos navegadores) |

## O que você precisa configurar

1. **Supabase → Authentication → URL Configuration:** adicione em *Redirect URLs*
   `https://<usuario>.github.io/Bibliolingo/auth/callback`. Sem isso o login com Google e os links de e-mail
   (confirmar conta, recuperar senha) não voltam para o site.
2. **Progresso de quem usava o site antigo:** o progresso salvo só no navegador (visitante) não é migrado,
   porque o app guarda em outro formato. Quem tem conta mantém tudo (sincroniza pela conta).
3. **Offline:** o site novo não funciona sem internet (o antigo guardava um cache). Se isso importar, dá para
   acrescentar um service worker de cache depois.
