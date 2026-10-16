# Bibliolingo 3.0 — auditoria de autenticação e sincronização

Data da auditoria: 16/10/2026  
Branch: `feature/bibliolingo-auth-sync`

## Estado encontrado

### Web

- React + Vite + TypeScript e roteamento hash.
- Estado completo em `AppState` schema 7.
- Persistência local em IndexedDB (`bibliolingo/appState/current`) por meio de `idb`.
- Backup JSON validado e migrações locais existentes.
- O estado inclui perfil, configurações, XP, corações, streak, lições e checkpoints, tentativas, revisão, conquistas, atividade, sessão ativa, Bíblia, anotações e Grego.
- XP é calculado deterministicamente por `calculateLessonXp`.
- Streak usa datas locais `YYYY-MM-DD`, sem depender de UTC.

### Mobile

- React Native + Expo SDK 57 + Expo Router.
- Estado reduzido em `MobileProgress` schema 1.
- Persistência local em AsyncStorage.
- O estado inclui XP, streak, lições/checkpoints/perfeitas, erros e sessão ativa.
- Reutiliza o mesmo cálculo de XP e streak da Web.
- Professor Noah usa Cloudflare Worker independente e não armazena credenciais no cliente.

### Infraestrutura

- Cloudflare Worker + KV existem apenas para o Professor Noah, limites e sessões anônimas.
- Não existe autenticação de usuário.
- Não existe banco de progresso remoto, D1 ou outro banco configurado.
- Não existe modelo de identidade compartilhada entre Web e Mobile.

## Risco principal

Web e Mobile não possuem snapshots equivalentes. Substituir o estado de um cliente pelo outro apagaria dados. Somar os campos de XP duplicaria recompensas. Comparar apenas `updated_at` permitiria que um dispositivo antigo sobrescrevesse conclusões mais recentes.

## Decisão arquitetural

### Provedor

Usar Supabase Auth + Postgres no plano gratuito, sem ativação automática de faturamento.

Motivos:

- e-mail/senha, confirmação, recuperação, Google e Facebook oficiais;
- OAuth 2.0/OIDC com PKCE;
- Postgres, RLS e funções transacionais;
- suporte Web e React Native;
- chaves públicas `anon/publishable` adequadas ao cliente;
- `service_role` permanece fora de Web, Mobile e GitHub.

Cloudflare continua exclusivo do Noah. Não será criado um segundo sistema de identidade no Worker.

### Persistência e segurança

- Web: cliente HTTP mínimo para os endpoints oficiais Supabase Auth/REST/RPC com OAuth PKCE; estado educacional continua no IndexedDB.
- Mobile: cliente HTTP mínimo para os endpoints oficiais Supabase Auth/REST/RPC; refresh token em Expo SecureStore e progresso no AsyncStorage.
- A opção sem SDK adicional reduz o bundle e mantém a superfície de dependências pequena; ela não altera as garantias de RLS no servidor.
- Nunca armazenar senha.
- Nunca expor `service_role`, client secret Google/Meta ou segredo Cloudflare.
- RLS usa `auth.uid()` em todas as tabelas privadas.
- Exclusão de conta exige função protegida no backend; o cliente não recebe privilégios administrativos.

### Sincronização

A fonte remota usa eventos idempotentes, não substituição cega de snapshots.

Cada evento possui:

- `event_id` UUID estável;
- `user_id` obtido do JWT;
- `device_id` aleatório persistente;
- tipo;
- payload validado;
- data civil local e fuso;
- sequência do servidor.

Eventos principais:

- resposta registrada;
- lição concluída;
- checkpoint concluído;
- conquista desbloqueada;
- perfil alterado;
- sessão ativa alterada;
- migração local confirmada.

O servidor ignora `event_id` repetido. XP não é aceito como valor arbitrário do cliente: é derivado do tipo de atividade, total, acertos e regras de gamificação. O estado remoto é uma projeção dos eventos confirmados.

### Conflitos

- conjuntos (lições, checkpoints, conquistas): união por ID;
- respostas: união por `event_id`;
- sessão ativa: maior passo conhecido da mesma atividade; atividades distintas permanecem disponíveis para escolha;
- perfil: revisão de campo com versão do servidor;
- XP: soma somente de recompensas derivadas de eventos únicos;
- streak: recomputado a partir de dias civis únicos e fuso registrado;
- exclusões: tombstones, nunca ausência simples;
- dados desconhecidos de versões futuras são preservados no snapshot remoto.

### Migração inicial

O primeiro login não apaga dados locais.

1. Criar uma cópia local de segurança.
2. Ler o resumo remoto.
3. Mostrar: manter local, usar remoto ou mesclar.
4. Converter o progresso local em evento de migração com fingerprint.
5. O servidor aceita o fingerprint uma única vez por usuário.
6. Remover itens da fila local somente após confirmação remota.

A interface deve exigir confirmação quando local e remoto contiverem atividade relevante.

## Autenticação social

Google e Facebook só aparecem quando:

- o provedor está habilitado no Supabase;
- IDs e redirects foram configurados;
- a flag pública correspondente está habilitada;
- o fluxo foi testado no ambiente alvo.

Não vincular contas automaticamente por igualdade de e-mail. Vinculação exige sessão autenticada e confirmação do provedor.

No Mobile, os botões sociais permanecem ocultos nesta fase. O retorno por esquema próprio e os requisitos de Google/Meta devem ser validados em development build; e-mail/senha e modo visitante continuam compatíveis com Expo Go.

## Variáveis públicas previstas

Web:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AUTH_GOOGLE_ENABLED`
- `VITE_AUTH_FACEBOOK_ENABLED`

Mobile:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_AUTH_GOOGLE_ENABLED`
- `EXPO_PUBLIC_AUTH_FACEBOOK_ENABLED`

Esses valores identificam o projeto e aplicam RLS; não são segredos administrativos.

## Dependências adotadas

Web:

- nenhuma dependência nova; os endpoints oficiais do Supabase são acessados com `fetch`.

Mobile:

- `expo-secure-store` para a sessão;
- os endpoints oficiais do Supabase são acessados com `fetch`;
- OAuth social Mobile não adiciona bibliotecas nem exibe botões antes da validação em development build.

## Etapas externas obrigatórias

Ainda dependem do proprietário:

1. criar ou selecionar um projeto Supabase;
2. aplicar a migração SQL revisada;
3. configurar URL e chave pública nos ambientes;
4. configurar SMTP/URLs de e-mail;
5. cadastrar aplicativos Google e Meta;
6. adicionar redirects autorizados;
7. validar cada provedor real.

Nenhum botão social será apresentado como funcional antes dessas etapas.
