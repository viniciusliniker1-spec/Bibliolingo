# Textos originais e léxicos embarcados

O aplicativo mobile gera os dados no processo de build e os inclui no APK. Nenhum livro, capítulo ou verbete é baixado quando o aluno o seleciona.

## Fontes fixadas

- Antigo Testamento: Open Scriptures Hebrew Bible / Westminster Leningrad Codex, revisão `3d15126fb1ef74867fc1434be1942e837932691f`. Texto WLC em domínio público; lemas e morfologia CC BY 4.0. Atribuição: Open Scriptures Hebrew Bible Project.
- Novo Testamento: Robinson Parsed Textus Receptus, revisão `7fd4d02c3e5adebd379ebfbc824040820dde10fc`, domínio público.
- Léxico hebraico/aramaico: Open Scriptures Hebrew Lexicon, revisão `21c9add13bc727d3a951361778e97e3ff7afd1ce`. Dados do projeto CC BY 4.0; textos Strong/BDB subjacentes em domínio público.
- Léxico grego: Dodson, revisão `74f70358d4acfaf2f980bf2feb58ab7115cbbcbc`, CC BY-SA 4.0.

## Desempenho

Os 66 livros são assets estáticos separados. O Metro os empacota no APK; o aplicativo abre somente o arquivo do livro atual e mantém cache em memória. Os léxicos são carregados localmente apenas ao abrir o respectivo dicionário. Isso aumenta o tamanho de instalação, mas elimina espera de rede e evita importar uma base monolítica para o bundle JavaScript.

O texto original é exibido sem alinhamento automático palavra a palavra com a tradução portuguesa. A tradução é mostrada por versículo no modo interlinear para não prometer uma equivalência que os dados não fornecem.
