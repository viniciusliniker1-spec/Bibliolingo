# Confiabilidade bíblica do Professor Noah

## Implementação

O Worker identifica referências na pergunta antes de consultar o modelo. Nomes e abreviações dos 66 livros são normalizados contra o cânon protestante. Uma referência com capítulo inexistente recebe resposta determinística, sem chamada à IA.

Referências válidas são recuperadas da **Almeida 1819 (Bíblia Livre)** na revisão imutável d9fe1779447717bbfcb578e505b893125cad581c do Midvash Bible Data. O metadata.json dessa versão a declara public-domain; o arquivo LICENSE do repositório esclarece que a licença MIT cobre o código e que cada texto é regido pelo próprio metadata. A procedência está fixada, mas distribuição em outra jurisdição ainda requer revisão local.

A pergunta atual tem precedência temática sobre a lição. Se o aluno estiver em Gênesis 15 e perguntar pelo bom samaritano, o recuperador usa Lucas 10:25–37. O contexto da lição continua apenas como complemento.

Depois da geração, referências explícitas com capítulo ou versículo inexistente recebem aviso. A etapa não afirma que uma passagem existente sustenta automaticamente uma interpretação.

## Política pedagógica

A instrução de sistema aplica sete dimensões proporcionalmente: texto, história, literatura, exegese, interpretações, perspectiva wesleyana/arminiana e aplicação. Um classificador determinístico seleciona resposta curta, explicação, exegese, idioma original, doutrina, erro ou prática e ajusta o teto de saída sem outra chamada à IA.

O Manual Nazareno 2023 está catalogado como metadata verificado, mas conteúdo e paginação não foram incorporados. Noah é proibido de alegar consulta ou inventar página/artigo. Fontes disponíveis e apenas localizadas ficam distintas em worker/src/sources.ts.

## Avaliação

Testes automatizados verificam parsing, prioridade contextual, referência inexistente, recuperação simulada, validação canônica, identidade do prompt, adaptação e renderização segura. theologicalEvaluations.ts registra dez roteiros editoriais; passar testes de código não equivale a aprovação teológica.

## Limites restantes

- A validação semântica de que cada referência sustenta uma afirmação continua parcial. Uma segunda resposta do mesmo modelo não seria garantia; o sistema fornece texto primário e exige linguagem de incerteza.
- O Worker busca sob demanda arquivos fixados por livro; indisponibilidade da origem não bloqueia as trilhas.
- Não há corpus integral de comentários históricos, exegéticos ou do Manual Nazareno legalmente incorporado.
- Respostas de IA precisam de auditoria editorial humana amostral, especialmente em textos disputados.
