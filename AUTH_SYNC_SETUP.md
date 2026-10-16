# Bibliolingo 3.0 — autenticação e sincronização

## Situação da entrega

A implementação está na branch `feature/bibliolingo-auth-sync` e no PR #38. Ela não foi mesclada na `main`.

A Web e o Mobile continuam utilizáveis como visitante, com persistência local. A conta online fica desativada quando as variáveis públicas do Supabase não existem. Google e Facebook só aparecem quando suas flags forem ativadas depois de uma validação real.

## Arquitetura

- **Identidade e banco:** Supabase Auth + PostgreSQL.
- **Autorização:** Row Level Security por `auth.uid()`.
- **Web offline:** IndexedDB existente para progresso e IndexedDB separado para fila de sincronização.
- **Mobile offline:** AsyncStorage para progresso/fila e Expo SecureStore para sessão.
- **Sincronização:** eventos imutáveis com UUID, aceitos pela RPC `submit_sync_event`.
- **Idempotência:** `sync_events.event_id` é único. Um reenvio confirma o evento anterior sem conceder recompensa outra vez.
- **XP remoto:** calculado pelo backend a partir do resultado validado, não aceito como um incremento arbitrário do cliente.
- **Conflitos:** conclusões e conquistas são unidas; XP e streak nunca são somados a partir de snapshots. Usa-se a projeção confirmada pelo servidor e preserva-se o maior valor local enquanto há migração pendente.
- **Migração:** o usuário confirma “Mesclar progresso local”. A importação possui impressão determinística e o servidor aceita a mesma impressão uma única vez.
- **Professor Noah:** permanece no Cloudflare Worker e não compartilha chaves ou sessão com o Supabase.

## 1. Criar o projeto Supabase

1. Acesse https://supabase.com/dashboard e crie um projeto.
2. Escolha a região mais próxima dos usuários.
3. O plano gratuito é suficiente para testes, mas possui cotas e pausa por inatividade; não deve ser tratado como gratuidade ilimitada.
4. Em **SQL Editor**, execute integralmente:
   `supabase/migrations/202610160001_auth_sync.sql`.
5. Confirme no **Table Editor** a existência de:
   `profiles`, `devices`, `sync_events`, `user_stats`, `study_days`,
   `lesson_progress`, `answer_history`, `user_achievements`,
   `active_progress` e `legacy_imports`.
6. Confirme que RLS está habilitado. Não desative as políticas para “fazer funcionar”.

A migration ainda precisa ser executada e validada em um projeto real. Não use o banco de produção sem antes testar em um projeto separado.

## 2. Variáveis públicas

Em **Project Settings > API**, copie:

- Project URL;
- Publishable key (ou anon key em projetos antigos).

Nunca copie `service_role` para a Web, Mobile, GitHub Pages ou chat.

Web (`.env.local`):

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
VITE_AUTH_GOOGLE_ENABLED=false
VITE_AUTH_FACEBOOK_ENABLED=false
```

Mobile (`mobile/.env.local`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=false
EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED=false
```

## 3. E-mail e senha

Em **Authentication > Providers > Email**:

1. habilite e-mail/senha;
2. mantenha confirmação de e-mail habilitada para produção;
3. configure o endereço remetente/SMTP antes da publicação;
4. personalize os modelos sem colocar tokens em logs;
5. adicione as URLs de redirecionamento em **URL Configuration**.

Sugestões de redirect:

- produção Web: `https://viniciusliniker1-spec.github.io/Bibliolingo/?auth_callback=1`;
- desenvolvimento Web: a URL HTTPS real do Codespaces/preview;
- aplicativo instalado: `bibliolingo://profile`.

A confirmação e a recuperação dependem do serviço de e-mail configurado no Supabase.

## 4. Google

1. No Google Cloud Console, crie um cliente OAuth 2.0 do tipo Web.
2. Em origem autorizada, use o domínio do Supabase e os domínios Web reais quando solicitados.
3. Cadastre como callback:
   `https://SEU_PROJETO.supabase.co/auth/v1/callback`.
4. No Supabase, abra **Authentication > Providers > Google** e informe Client ID/Secret.
5. Adicione as URLs Web de retorno no Supabase.
6. Teste cadastro, login, logout e retorno antes de definir:
   `VITE_AUTH_GOOGLE_ENABLED=true`.

A Web usa PKCE. No Mobile o botão permanece oculto nesta etapa: o retorno por esquema próprio normalmente exige development build para validação confiável. Expo Go continua apto para e-mail/senha e modo visitante.

## 5. Facebook

1. Crie um aplicativo em https://developers.facebook.com/.
2. Ative Facebook Login e configure a política/URL de privacidade exigida pela Meta.
3. Cadastre:
   `https://SEU_PROJETO.supabase.co/auth/v1/callback`.
4. Informe App ID/Secret somente no painel do Supabase.
5. Adicione os domínios e redirects Web reais.
6. Valide com uma conta de teste da Meta.
7. Só então defina:
   `VITE_AUTH_FACEBOOK_ENABLED=true`.

Não vincule contas apenas por e-mail. A vinculação segura de uma identidade adicional permanece uma fase posterior e deve exigir sessão recente do usuário.

## 6. Instalar e testar no Codespaces

Na raiz:

```bash
git fetch origin
git switch feature/bibliolingo-auth-sync
npm ci
npm test
npm run build
```

No Mobile:

```bash
cd /workspaces/Bibliolingo/mobile
npx expo install expo-secure-store
npx expo install --check
npx expo-doctor
npm test
npm run typecheck
npm run export:android
npx expo start --tunnel --clear
```

O comando `npx expo install expo-secure-store` também atualiza `mobile/package-lock.json`; esse lockfile deve ser commitado antes da validação final.

## 7. Roteiro de validação

### Web

1. Estude como visitante e conclua uma lição.
2. Abra **Entrar**.
3. Crie uma conta e confirme o e-mail.
4. Entre novamente.
5. Confirme “Mesclar progresso local”.
6. Verifique o status “Sincronizado”.
7. Atualize a página e confirme XP/conclusões.
8. Faça logout: o progresso local deve continuar disponível.

### Android / Expo Go

1. Abra a aba **Perfil**.
2. Entre com e-mail/senha.
3. Confirme “Mesclar progresso local”, quando exibido.
4. Conclua uma lição.
5. Feche e reabra o app.
6. Toque em “Sincronizar agora”.
7. Entre na Web com a mesma conta e confira a conclusão.

### Offline

1. Desligue a conexão.
2. Responda e conclua uma lição.
3. Confirme “Aguardando internet”.
4. Religue a conexão e volte ao app.
5. Confirme “Sincronizado” sem XP duplicado.

## 8. Limitações conhecidas

- Supabase ainda depende da criação/configuração externa e de teste real.
- Google/Facebook não são declarados funcionais até seus painéis, redirects e contas de teste serem validados.
- Login social Mobile deve ser finalizado em development build; não há botão falso no Expo Go.
- Vinculação posterior de identidades ainda não foi habilitada.
- A migration precisa de revisão prática no PostgreSQL do Supabase antes de produção.
- A estratégia atual valida estrutura, limites e idempotência, mas um sistema antifraude forte exigirá um catálogo editorial versionado também no backend.
- O histórico local atual não guarda a alternativa textual escolhida em todos os exercícios; por isso eventos antigos podem registrar apenas acerto/erro.
