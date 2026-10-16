# Professor Noah no Bibliolingo Mobile

## Auditoria

A versão web usa um Cloudflare Worker público e mantém as chaves dos provedores exclusivamente no backend.

- URL de produção: `https://bibliolingo-noah.vinicius-liniker1.workers.dev`
- `POST /v1/session`: cria um token anônimo curto vinculado à instalação e ao IP resumido.
- `POST /v1/tutor`: recebe contexto pedagógico validado e exige o token.
- Provedor principal: Gemini Flash configurado no Worker.
- Contingência: Groq, somente para falhas elegíveis.
- Proteções existentes: validação e truncamento, limite por instalação/IP, orçamento global em KV, timeout, histórico reduzido e validação de referências bíblicas.
- O tutor não corrige exercícios, não concede XP e não altera progresso.

O mobile reutiliza esse contrato. Nenhuma chave de Gemini, Groq ou Cloudflare entra no aplicativo.

## Arquitetura mobile

- `mobile/domain/noah.ts`: tipos compartilháveis, validação e tradução determinística das respostas.
- `mobile/services/noahRemote.ts`: instalação anônima em AsyncStorage, sessão curta em memória, timeout, uma renovação após 401 e mensagens de indisponibilidade.
- `mobile/components/ProfessorNoahModal.tsx`: modal responsivo, histórico apenas durante a lição, ações rápidas, carregamento e erro.
- `mobile/app/lesson/[activityId].tsx`: fornece livro, unidade, lição, conteúdo editorial, questão, alternativas e resultado oficial.

Antes da correção o contexto não inclui o gabarito. Depois da correção, o modal pode receber a resposta selecionada, a resposta correta e a explicação editorial. A frase montada com blocos é enviada integralmente e na ordem escolhida.

## Configuração

A URL de produção é pública e possui um valor padrão no cliente. Para usar outro Worker:

```bash
EXPO_PUBLIC_NOAH_API_URL=https://seu-worker.workers.dev npx expo start --tunnel
```

`EXPO_PUBLIC_NOAH_API_URL` não é uma chave. Segredos continuam configurados somente no Cloudflare.

O cliente React Native envia a origem pública já autorizada pela configuração atual do Worker. Isso resolve a compatibilidade com o endpoint existente sem modificar CORS ou a aplicação web. A autorização efetiva continua sendo feita pelo token de sessão; CORS não é tratado como autenticação.

## Teste no Expo Go

Na branch `feature/bibliolingo-mobile-noah`:

```bash
cd mobile
npm install --legacy-peer-deps
npx expo install --check
npx expo-doctor
npm test
npm run typecheck
npm run export:android
npx expo login
npx expo start --tunnel --clear
```

Fluxo manual:

1. Abra uma lição.
2. Toque em **Perguntar ao Noah** antes da resposta e peça uma pista.
3. Confirme que o tutor não revela o gabarito.
4. Responda incorretamente.
5. Confirme o feedback editorial imediato.
6. Toque em **Entender com Noah**.
7. Confirme que a explicação menciona a resposta escolhida, o gabarito e a referência corretos.
8. Feche o modal e continue a lição.
9. Conclua a atividade e confirme XP e progresso inalterados.
10. Desligue a conexão e confirme a mensagem de indisponibilidade sem bloquear a lição.

## Privacidade e limitações

- A instalação recebe um identificador aleatório local; não são enviados nome, e-mail ou conteúdo do progresso.
- O histórico é limitado às últimas oito mensagens e não é persistido pelo mobile.
- A resposta depende de internet e das cotas gratuitas configuradas.
- O nível do aluno permanece como `beginner` até o perfil mobile ganhar seleção de conhecimento.
- A interface apresenta texto seguro sem executar HTML. Formatação Markdown avançada ficará para uma etapa posterior.
- A comunicação real só pode ser considerada validada após o teste físico no Expo Go receber uma resposta do Worker.
