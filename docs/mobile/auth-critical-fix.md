# Correção crítica da autenticação Android

## Causa raiz confirmada

O workflow de APK publicava uma URL e uma chave Supabase de fallback quando as configurações do GitHub estavam ausentes. A chave embutida na APK era rejeitada pelo servidor com `Invalid API Key`.

Na execução 79 da branch `fix/android-auth-critical`, o ambiente confirmou que estas duas configurações estão vazias:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Google e Facebook também eram ativados por fallback, mesmo sem comprovação da configuração dos provedores. O callback mobile para confirmação, recuperação e OAuth não existia nessa base.

## Configuração externa obrigatória

Não crie outro projeto. No Supabase que já contém os usuários e o progresso:

1. Abra **Project Settings > API**.
2. Copie a **Project URL**.
3. Copie a chave **Publishable** atual (ou a chave pública `anon` do mesmo projeto). Nunca use `service_role`.
4. No GitHub, abra:
   **Settings > Secrets and variables > Actions**.
5. Em **Variables**, crie:
   - `EXPO_PUBLIC_SUPABASE_URL` = Project URL.
6. Em **Secrets**, crie:
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = chave pública atual.
7. Em **Variables**, mantenha inicialmente:
   - `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=false`
   - `EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED=false`

O workflow chama `/auth/v1/settings` antes da compilação. Se a URL e a chave não formarem um par aceito pelo servidor, nenhuma APK será publicada.

## E-mail, cadastro e recuperação

No Supabase:

1. Abra **Authentication > URL Configuration**.
2. Preserve a Site URL usada pela Web.
3. Inclua em **Redirect URLs**:
   - `bibliolingo://auth/callback`
4. Abra **Authentication > Providers > Email** e confirme que o provedor está habilitado.
5. Em **Authentication > Email Templates**, confirme que os modelos de confirmação e recuperação usam o link gerado pelo Supabase.
6. Em **Project Settings > Authentication > SMTP**, configure e valide um SMTP real para produção. O envio padrão do Supabase é limitado e não garante entrega a todos os destinatários.
7. Faça um envio de recuperação e confira **Authentication > Logs**. A interface do app não pode garantir entrega quando o provedor SMTP rejeita ou suprime a mensagem.

## Google

O fluxo implementado usa OAuth hospedado pelo Supabase no navegador do sistema, não o SDK nativo do Google.

1. No Google Cloud Console, use um OAuth Client do tipo **Web application**.
2. Em **Authorized redirect URIs**, cadastre:
   - `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`
3. Copie Client ID e Client Secret para **Supabase > Authentication > Providers > Google**.
4. Mantenha o redirect mobile `bibliolingo://auth/callback` na allowlist do Supabase.
5. Só então altere no GitHub:
   - `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED=true`

O package Android existente é `com.bibliolingo.app`. SHA-1/SHA-256 são exigidos pelo SDK nativo Android, mas não participam deste fluxo hospedado. Não cadastre um cliente Android ou certificados aleatórios para tentar corrigir o OAuth Web.

## Facebook

1. No Meta for Developers, abra o aplicativo existente.
2. Em Facebook Login, cadastre em **Valid OAuth Redirect URIs**:
   - `https://SEU_PROJECT_REF.supabase.co/auth/v1/callback`
3. Configure App ID e App Secret em **Supabase > Authentication > Providers > Facebook**.
4. O mobile solicita apenas `public_profile`; o scope `email` que produzia `Invalid Scopes` foi removido.
5. Confirme que o aplicativo Meta está em modo compatível com os usuários de teste ou publicado.
6. Só então altere no GitHub:
   - `EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED=true`

## Validação obrigatória no Samsung

Depois de a build passar:

1. Criar uma conta por e-mail e confirmar o e-mail.
2. Fechar completamente e reabrir; a mesma conta deve permanecer ativa.
3. Sair e entrar novamente.
4. Solicitar recuperação, abrir o link no aparelho, definir a nova senha e entrar.
5. Entrar com Google, confirmar que o perfil deixa de ser visitante, fechar e reabrir.
6. Repetir com Facebook.
7. Conferir XP, lições e conquistas antes/depois de cada login.
8. Testar sem internet: uma falha transitória não deve apagar a sessão armazenada.

Não há validação real de Google, Facebook ou entrega SMTP até os painéis externos estarem configurados e esses testes serem executados.
