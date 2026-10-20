# Professor Noah 2.0 — arquitetura e operação

Data da decisão: 2026-10-14.

## Resultado da auditoria

O Bibliolingo é uma PWA React 19 + TypeScript + Vite. O progresso local é persistido em IndexedDB e a correção de exercícios acontece no reducer antes de qualquer chamada de IA. O backend existente é um Cloudflare Worker com KV, recuperação da Almeida 1819, política bíblico-teológica, limites e provedores REST oficiais.

A implementação preserva essa arquitetura. Cloudflare Agents SDK e Google ADK não foram adicionados: o tutor não precisa, neste estágio, de coordenação multiagente ou estado distribuído que justifique dependências e complexidade extras.

A auditoria detalhada anterior à implementação está em [NOAH_2_AUDIT.md](NOAH_2_AUDIT.md).

## Experiência na lição

### Antes da resposta

**Perguntar ao Noah** abre o painel e pede uma pista progressiva. O contexto contém enunciado, alternativas, referência, objetivo, dificuldade e fontes, mas omite:

- alternativa correta;
- explicação editorial;
- resultado;
- resposta selecionada.

O backend também recebe `answerStatus: unanswered` e proíbe apontar ou parafrasear o gabarito.

### Depois de um erro

A engine determinística corrige, registra tentativa, revisão, coração e XP pelas regras existentes. Só depois o tutor abre automaticamente com:

- questão e alternativas;
- resposta selecionada;
- resposta correta;
- explicação editorial;
- referência e fontes;
- resumo mínimo de dificuldades recentes.

A mensagem inicial é “Vamos entender essa questão?”. Fechar ou minimizar não altera progresso.

### Depois de um acerto

O tutor não interrompe o ritmo. A ação **Quer entender melhor?** abre uma explicação complementar quando solicitada.

### Layout

Em telas largas, o painel ocupa a lateral direita e a lição se desloca para conservar enunciado e alternativas visíveis. Até 700 px, vira bottom sheet com rolagem própria, altura em `dvh`, safe areas e formulário fixado na grade interna. Há controles separados para minimizar e encerrar.

## Provedores

- Principal: `gemini-3.8-flash`, configurável por `GEMINI_MODEL`.
- Contingência: modelo Groq disponível escolhido no deploy.
- O provedor bem-sucedido fica associado à sessão no KV por duas horas.
- Gemini é tentado no máximo duas vezes; Groq, uma.
- Apenas timeout, 408, 429, falha de rede e 5xx habilitam retentativa/fallback.
- 400 e 403 não são enviados indiscriminadamente ao segundo provedor.
- Se ambos falharem, a lição continua e o usuário pode tentar novamente.

A escolha do identificador Gemini foi conferida na documentação oficial de modelos antes da implementação. Cotas gratuitas variam por projeto, região e data; o código não ativa faturamento.

## Privacidade e memória pedagógica

A instalação recebe um UUID aleatório. O navegador troca esse UUID por token de sessão curto. O KV armazena apenas hashes e contadores com expiração.

O resumo pedagógico utiliza até 40 tentativas recentes, conceitos com dificuldade e número de revisões pendentes. Ele não inclui nome, anotações bíblicas, conteúdo de backup, XP ou conversa completa. Mudar de questão encerra o contexto anterior para impedir mistura de exercícios.

Sem sistema de contas, esse mecanismo oferece isolamento por instalação, não identidade forte entre pessoas. Contas sincronizadas exigirão autenticação real.

## Feature flags e reversão

Frontend:

```env
VITE_NOAH_CONTEXTUAL_ENABLED=true
```

Defina `false` e reconstrua a PWA para conservar o tutor remoto sem abertura automática.

Worker:

```toml
AI_ENABLED = "true"
CONTEXTUAL_TUTOR_ENABLED = "true"
```

`AI_ENABLED=false` interrompe geração sem afetar cursos. Para reversão completa, reverta o merge do PR e execute o workflow; progresso local não exige migração.

## Configuração Cloudflare/GitHub

Cadastre em **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`;
- `CLOUDFLARE_KV_NAMESPACE_ID`;
- `GEMINI_API_KEY`;
- `GROQ_API_KEY`.

Não envie chaves pelo chat e não crie variáveis `VITE_GEMINI_API_KEY` ou `VITE_GROQ_API_KEY`.

Após merge na `main`, o workflow valida credenciais/modelo, publica, abre uma sessão e exige resposta real do Gemini. O deploy não deve ser declarado concluído antes desse job verde.

## Testes e avaliações

A suíte cobre:

- validação e sanitização de contexto;
- ausência de gabarito na pista;
- resumo de aprendizagem sem XP;
- isolamento de token entre instalações;
- política de erros elegíveis;
- Gemini 429 com fallback Groq;
- ausência de fallback em 400;
- regressões de conteúdo, XP, streak, revisão, persistência e Formação;
- matriz editorial de 30 casos em seis categorias.

A matriz em `worker/src/evaluationCases.ts` é um contrato editorial, não prova de qualidade teológica. Avaliação real de Gemini e Groq precisa rodar com credenciais e registrar provedor, cobertura, latência e tokens. Julgamento doutrinário continua exigindo revisão humana.

## Limitações conhecidas

- KV possui consistência eventual e não substitui rate limiting transacional.
- Não há conta/autenticação pessoal no produto atual.
- Testes automatizados de CSS não equivalem a validação em Android/iOS reais.
- O teclado virtual e safe areas devem ser confirmados em aparelhos de 375 px e 414 px antes de ativar a flag para todos.
- Conteúdo marcado como revisão editorial pendente continua limitado.
- Comparação factual entre provedores depende da execução externa com ambas as credenciais; não foi inferida por testes mockados.
