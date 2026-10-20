# Bibliolingo Mobile — executar no Android

Versão atual: **Expo SDK 57**, React Native 0.86 e Expo Router 57.  
Branch: `feature/bibliolingo-mobile-full-parity`.  
Pull request: [#43](https://github.com/viniciusliniker1-spec/Bibliolingo/pull/43).

A Web continua separada e funcional. O Mobile reutiliza os catálogos e regras TypeScript da Web, mas usa componentes React Native, AsyncStorage e SecureStore.

## Testar no Expo Go usando Codespaces

1. Instale o [Expo Go pela Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Abra o [Codespaces do repositório](https://github.com/viniciusliniker1-spec/Bibliolingo/codespaces).
3. Crie ou abra um Codespace na branch `feature/bibliolingo-mobile-full-parity`.
4. Abra um terminal novo na raiz `/workspaces/Bibliolingo`.
5. Execute, um comando por vez:

```bash
git fetch origin
git switch feature/bibliolingo-mobile-full-parity
git pull --ff-only
cd mobile
npm install
npx expo install --check
npx expo start --tunnel --clear
```

Mantenha o terminal e o Codespace abertos. Escaneie o QR Code no Expo Go ou abra o endereço `exp://`. O endereço é temporário; não existe QR fixo.

Se o túnel falhar, autentique-se e tente novamente:

```bash
npx expo login
npx expo start --tunnel --clear
```

## Ativar conta, sincronização e Noah

Crie `mobile/.env.local` a partir de `mobile/.env.example`. Use somente valores públicos no aplicativo:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
EXPO_PUBLIC_AUTH_WEB_URL=https://viniciusliniker1-spec.github.io/Bibliolingo/#/account
EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=false
EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED=false
EXPO_PUBLIC_NOAH_API_URL=https://bibliolingo-noah.vinicius-liniker1.workers.dev
```

Nunca coloque `service_role`, `GEMINI_API_KEY` ou `GROQ_API_KEY` no Mobile. As chaves dos modelos permanecem somente no Cloudflare Worker. Depois de alterar o ambiente, pare o Metro com Ctrl+C e reinicie com `npx expo start --tunnel --clear`.

A autenticação por e-mail/senha funciona quando a migração Supabase de `supabase/migrations/` foi aplicada. O APK precisa receber as mesmas variáveis no EAS; `.env.local` não é enviado ao build remoto:

```bash
cd /workspaces/Bibliolingo/mobile
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://bldjisxjhkxljblzpmru.supabase.co --visibility plaintext
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value SUA_CHAVE_PUBLICAVEL --visibility sensitive
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_AUTH_WEB_URL --value https://viniciusliniker1-spec.github.io/Bibliolingo/#/account --visibility plaintext
```

Use a chave **publishable/anon**, nunca `service_role`.

### Google e Facebook oficiais

Os botões só aparecem quando cada provedor está realmente habilitado:

1. no Supabase, abra **Authentication → URL Configuration** e adicione `bibliolingo://auth/callback` aos redirects permitidos;
2. em **Authentication → Providers**, configure Google e/ou Facebook;
3. no Google Cloud ou Meta for Developers, use `https://bldjisxjhkxljblzpmru.supabase.co/auth/v1/callback` como redirect OAuth autorizado;
4. mantenha Client Secret apenas no Supabase/console do provedor;
5. depois da configuração, crie no ambiente `preview` do EAS:
   - `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true`;
   - `EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED=true`;
6. gere um novo APK e faça um login real em cada provedor.

O fluxo abre o navegador oficial do aparelho, retorna por deep link e nunca usa WebView ou captura de cookies. Não habilite a flag de um provedor antes de concluir a configuração e o teste real.

### Entrada por biometria

Depois de entrar, abra **Perfil → Entrada por biometria** e ative a opção. O app protege a sessão já armazenada no SecureStore; não guarda a senha. Digital/biometria exige cadastro prévio no Android e deve ser validada no APK, pois módulos nativos podem ter limitações no Expo Go.

## Roteiro funcional

1. Cadastre-se, entre ou continue como visitante.
2. Em Jornada, abra um livro e teste Jornada e Livro individual.
3. Conclua uma lição com acerto e erro; consulte Noah somente por ação explícita.
4. Confira resultado, XP, corações, streak, próximo passo e retomada.
5. Abra Bíblia; pesquise João 3:16, copie/compartilhe, salve nota e marcação e abra o grego do NT.
6. Em Estudar, abra Revisar, Grego, Dicionário, Aprofundar e Formação. A Formação usa o código de interface `12345`.
7. Abra Conquistas e Perfil; altere meta, preferências e dados da conta.
8. Exporte um backup, feche o Expo Go, reabra e confirme a persistência.
9. Com uma conta, toque em Sincronizar agora e confirme o estado.
10. Configure um lembrete local e confirme que existe somente uma agenda no Android.\n11. Ative a biometria no Perfil, feche o app e valide a liberação por digital.\n12. Confirme som de acerto, erro e conclusão, além dos confetes.

## Verificações técnicas

No diretório `mobile/`:

```bash
npm test
npm run typecheck
npx expo install --check
npx expo-doctor
npm run export:android
```

Na raiz, para garantir que a Web não regrediu:

```bash
npm ci
npm test
npm run build
```

## Gerar APK ou AAB com EAS

Isso não é necessário para Expo Go. Quando desejar um arquivo instalável:

```bash
cd /workspaces/Bibliolingo/mobile
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

O perfil `preview` de `mobile/eas.json` gera APK interno. Para Google Play:

```bash
npx eas-cli build --platform android --profile production
```

O perfil `production` gera AAB. A compilação usa a conta e as cotas do Expo; nenhum link é prometido antes da conclusão real do EAS Build.

## Limites de validação

A CI valida dependências, Expo Doctor, testes, TypeScript, Web e export Android. Instalação, permissões, teclado, notificações, TalkBack, OAuth social e comportamento prolongado em segundo plano ainda exigem aparelho físico e/ou configuração externa. Relate modelo do Android, tela, passos, mensagem e captura; nunca envie chaves ou tokens.
