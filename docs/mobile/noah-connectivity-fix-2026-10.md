# Recuperação de conexão do Professor Noah — outubro de 2026

## Causa confirmada no código

O cliente React Native tentava se identificar enviando manualmente o cabeçalho HTTP `Origin`. Esse cabeçalho pertence ao modelo de segurança de navegadores e não é uma identidade confiável para um aplicativo nativo. Dependendo da pilha de rede Android, ele pode ser removido ou tratado de modo diferente. O Worker rejeitava qualquer chamada sem a origem Web autorizada.

Além disso, cada provedor podia aguardar até 18 segundos, o provedor principal podia repetir a chamada e o fallback era sequencial. O cliente encerrava toda a operação em 24 segundos, portanto podia desistir antes de o Groq responder quando o Gemini estava degradado.

## Correções

- O Mobile usa `x-bibliolingo-client: mobile-v1` e não falsifica mais uma origem Web.
- O Worker aceita esse identificador somente quando não existe cabeçalho `Origin`.
- Navegadores com origem não autorizada continuam bloqueados.
- A sessão anônima vinculada à instalação e o rate limit foram preservados.
- Cada provedor recebe orçamento de 9 segundos e a repetição redundante do primeiro provedor foi removida.
- Uma falha transitória de rede é repetida uma única vez pelo cliente.
- Se Gemini e Groq estiverem indisponíveis, o Worker retorna uma explicação local transparente baseada exclusivamente no conteúdo, objetivo e referência da aula.
- A pergunta permanece visível e a interface oferece `Tentar novamente`.
- O deploy do Worker valida saúde, sessão e resposta real antes de concluir.

## Segurança pedagógica

A contingência local não se apresenta como resposta de IA e não inventa conteúdo. Ela utiliza somente contexto já autorizado pela atividade. O Professor Noah não altera XP, gabarito ou progresso.
