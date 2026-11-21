# Play Console: guia de preenchimento (uso interno, não publicar)

Respostas sugeridas para o formulário **Segurança dos dados** e para as perguntas sobre **público-alvo**, baseadas no que o app faz hoje.
**Confira cada resposta antes de enviar:** o formulário é uma declaração sua ao Google, e as respostas precisam continuar verdadeiras quando o app mudar.

## Perguntas gerais

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha algum dos tipos de dados exigidos? | **Sim** |
| Todos os dados do usuário são criptografados em trânsito? | **Sim** (o app só aceita conexão HTTPS) |
| Você oferece uma forma de os usuários pedirem a exclusão dos dados? | **Sim**, dentro do app (Perfil › Excluir conta) e por e-mail |
| URL da política de privacidade | O endereço público da página (veja `SOCIAL_SETUP.md` e a seção "Como publicar" abaixo) |

## Tipos de dados

"Coletado" = enviado do aparelho para nossos servidores. "Compartilhado" = enviado a terceiros que não sejam prestadores que tratam os dados em nosso nome (o Google considera os prestadores de serviço como **não** compartilhamento).

| Categoria › tipo | Coletado? | Compartilhado? | Obrigatório? | Para quê |
|---|---|---|---|---|
| Informações pessoais › **Nome** | Sim | Não | Opcional | Funcionalidade do app, gerenciamento de conta |
| Informações pessoais › **Endereço de e-mail** | Sim | Não | Obrigatório para criar conta (opcional no app, que funciona sem conta) | Gerenciamento de conta |
| Informações pessoais › **IDs de usuário** (nome de usuário e @usuário do ranking) | Sim | Sim, outros alunos veem o @usuário no ranking | Opcional | Funcionalidade do app |
| Fotos e vídeos › **Fotos** (foto de perfil) | Sim | Não | Opcional | Funcionalidade do app |
| Atividade no app › **Interações no app** (progresso, XP, lições, ofensiva) | Sim | Sim, XP e ofensiva ficam visíveis a outros alunos no ranking | Opcional | Funcionalidade do app |
| Atividade no app › **Outras ações geradas pelo usuário** (anotações, destaques, perguntas ao Noah) | Sim (anotações); perguntas ao Noah são enviadas a prestadores de IA | Perguntas ao Noah: processadas por Google/Groq | Opcional | Funcionalidade do app |
| Identificadores do dispositivo ou outros › **ID do dispositivo** (código gerado pelo app, não o de publicidade) | Sim | Não | Obrigatório com conta | Funcionalidade do app (sincronização) |

**Não coletamos:** localização, contatos, mensagens, áudio, vídeos, histórico de navegação, saúde, dados financeiros, ID de publicidade, nem dados de diagnóstico ou desempenho (o app não tem ferramenta de relatório de erros).

> Sobre dados sensíveis: estudar a Bíblia pode indicar convicção religiosa. O formulário não tem um item específico para isso, mas a política de privacidade já trata do assunto (item 3).

## Público-alvo e política para famílias

- O app tem uma **área para crianças (modo criança)**. Ao declarar o público-alvo na Play Console, **inclua crianças** (faixa de 5 anos e abaixo, 6 a 8 e 9 a 12), além de adolescentes e adultos. Isso ativa a **Política para Famílias do Google Play**.
- Pontos a favor, já verdadeiros hoje: **sem anúncios**, sem rastreadores de terceiros, sem identificador de publicidade, o modo criança não coleta dados nem tem social/compras/links externos, e há verificação para adultos para sair.
- Pontos para decidir com atenção:
  - A **conta online e o ranking** estão definidos na política para **13 anos ou mais**. Se preferir outra idade mínima, mude a política e o app juntos.
  - O app declara um público misto. O Google pode pedir **comprovação de que o app é adequado a crianças** (por exemplo, no processo de revisão). Se houver dúvida, procure orientação jurídica antes de publicar.

## Como publicar a política em um endereço público

A Play Console exige um **link público que abra a política em página web** (um arquivo de texto não serve).

Este repositório já tem a página pronta em `public/privacidade.html`. O site do app é publicado pelo GitHub Pages (`.github/workflows/pages.yml`) a partir da branch `main`. Depois que o PR #48 for **mesclado na `main`** e o site publicar, a página fica em:

`https://viniciusliniker1-spec.github.io/Bibliolingo/privacidade.html`

Cole esse endereço na Play Console e também no app/site, quando quiser. Abra o link no navegador antes, para conferir.

## Antes de publicar, substitua os campos entre colchetes

No arquivo `legal/politica-de-privacidade.md` e em `public/privacidade.html`:
- `[NOME COMPLETO OU RAZÃO SOCIAL]`
- `[CPF OU CNPJ]`
- `[E-MAIL DE CONTATO]` (aparece em 3 lugares)

E peça a **revisão de um advogado** (idealmente com experiência em LGPD e em apps para crianças). Este texto foi escrito com base no comportamento real do app, mas **não substitui uma revisão jurídica**.
