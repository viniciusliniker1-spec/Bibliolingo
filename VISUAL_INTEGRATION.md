# Integração visual aprovada — estado da implementação

Base preservada: `a3dfe1dcc6ab7b3ff608dce38910f9f7c1fbad6b`  
Backup: `backup/pre-integracao-visual-2026-10-20`

## O que foi integrado

- Registro estático tipado para Web e Expo.
- Logotipo horizontal no cabeçalho Web.
- Ícones aprovados de Estudar, Aprendizado e Conquistas na navegação.
- Ícone principal do aplicativo Android/iOS ligado a `03_icone_app.png`.
- Catálogo oficial com IDs estáveis `01`–`30`.
- Medalhas oficiais nas telas Web e Mobile, com carregamento sob demanda no Web.
- Lumi contextual:
  - resposta correta: orgulhosa;
  - resposta incorreta: encorajadora;
  - conclusão aprovada: orgulhosa;
  - nova tentativa: encorajadora.
- Compatibilidade com IDs legados: eles continuam armazenados e sincronizados; não são apagados.
- Conclusões repetidas de uma mesma lição não inflam os requisitos por quantidade.
- A melhor sequência histórica, e não somente a sequência atual, alimenta as conquistas de constância.
- A conquista 30 exclui a 09 e a própria 30 do denominador.

## Assets temporariamente bloqueados

Os arquivos abaixo permanecem no repositório, mas não são usados em superfícies que exigem transparência:

- `lumi_02_alegre_aprovada_fundo_xadrez.png`: xadrez incorporado à imagem.
- `lumi_06_carinhosa.png` e `lumi_20_agradecendo.png`: sem alfa utilizável.
- `01_primeira_licao.png` e `13_100_licoes.png`: fallback neutro até exportação transparente.
- `01_Inicio.png`, `03_Biblia.png`, `08_Professor_Noah.png` e `15_Perfil.png`: navegação mantém os ícones anteriores.
- `17_Notificacoes.png`: ausente; permanece o ícone atual.
- Amigos e Ranking: não integrados nesta fase.
- As 66 ilustrações de conclusão de livros: fora do escopo desta etapa.

## Conquistas com avaliação real já disponível

- Lições únicas: 01, 02, 06, 13, 20, 21 e 23.
- Melhor sequência: 03, 04, 05 e 22.
- Livros completos: 07, 08, 24, 25 e 26.
- Grego Bíblico: 10.
- Acertos consecutivos em questões distintas: 11 e 12.
- Nível máximo definido para o requisito 28: nível 50.

## Pendências de instrumentação (não concedidas artificialmente)

- 09: autorização de Formação Pastoral precisa de entitlement do backend.
- 14: evento confirmado de leitura livre de capítulo.
- 15, 16 e 17: tags curriculares editoriais de serviço, missões e oração.
- 18 e 19: evento idempotente de pergunta respondida pelo Professor Noah.
- 27: registro versionado das rotas regulares.
- 29: evidência persistente de 100% de aproveitamento na rota.
- 30: depende de todos os requisitos regulares anteriores.

A conquista 09 permanece totalmente fora do catálogo público. Ela somente pode ser solicitada por código com `formationEntitled: true`; nenhuma tela atual fornece essa autorização localmente.

## Desempenho

Os originais somam aproximadamente 126 MiB. Esta integração usa referências estáticas e não copia novamente os arquivos, mas a otimização física (WebP/AVIF e tamanhos por densidade) ainda deve ser feita antes da publicação em loja. Imagens bloqueadas não são importadas pelos registros ativos.

## Validação

Os workflows `CI`, `Mobile Expo CI` e `Auth Sync Smoke` são a fonte de validação automatizada. Uma build EAS instalável deve ser iniciada somente após todos os três concluírem com sucesso e após a otimização final dos assets.


## Atualização — reconstrução mobile estável

- A barra inferior deixou de usar PNGs e passou a utilizar símbolos simples, acessíveis e leves.
- Os antigos ícones de menu continuam no pacote-fonte, mas não são registrados nem incluídos pelo código mobile.
- Cenários aprovados foram associados por função:
  - Jardim do aprendizado → Trilhas.
  - Caminho da jornada → Home/Jornada.
  - Biblioteca do conhecimento → Estudar.
  - Horizonte dos propósitos → Planos de Estudo.
  - Santuário da constância → Perfil/atividade.
  - Portal da jornada → rota de cada livro.
- Lumi é carregada somente em contextos semânticos (entrada, feedback pedagógico e conquistas).
- Medalhas 09 e 10 não são cenários; permanecem vinculadas às respectivas conquistas.
- O otimizador Android agora separa explicitamente medalhas, Lumi e cenários, preservando a proporção das imagens.
- Os arquivos reprovados por transparência continuam sem uso visual.
