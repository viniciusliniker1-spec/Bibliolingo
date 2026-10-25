# Integração editorial e bíblica — outubro de 2026

## Escopo desta rodada

Esta rodada implementa melhorias editoriais e de estudo sem gerar uma nova APK:

- revisão teológica adicional de passagens sensíveis;
- distinção visual entre texto bíblico, contexto histórico, interpretação e aplicação;
- fontes e leituras complementares rastreáveis por unidade;
- referências cruzadas curadas no leitor bíblico;
- acesso direto da lição ao texto original;
- transliteração e explicação morfológica determinísticas para hebraico, aramaico e grego;
- atualização das dependências diretas Vite e Zod.

O fluxo formal de aprovação humana (item 6 da proposta) não foi criado, conforme solicitado.

## Princípios editoriais aplicados

As revisões não tentam apagar divergências cristãs legítimas. Elas:

1. distinguem afirmação explícita do texto, contexto, interpretação e aplicação;
2. nomeiam debates quando uma leitura única seria enganosa;
3. impedem que textos antigos sejam usados para legitimar antissemitismo, escravidão, abuso ou violência;
4. evitam transformar descrições narrativas em mandamentos;
5. preservam os textos, IDs, gabaritos e regras de desbloqueio existentes.

O segundo lote revisou Romanos 1, 1 Coríntios 6–7, Colossenses 3–4, 1 Tessalonicenses 2, Tito 2 e Filemom. Ele complementa o lote anterior documentado em `theological-review-2026-10.md`.

## Fontes

Cada unidade enriquecida mantém suas fontes originais e recebe referências complementares catalogadas:

- Society of Biblical Literature — Bible Odyssey;
- Wesley Center Online;
- Open Scriptures Hebrew Bible para o Antigo Testamento;
- Robinson-Pierpont Byzantine Greek New Testament para o Novo Testamento.

O estado `catalogued` ou `metadata-verified` não significa que todo o conteúdo externo foi incorporado ou endossado. A interface expõe título, instituição, cobertura e link sem apresentar essas fontes como gabarito automático.

## Referências cruzadas

O catálogo inicial contém apenas relações explícitas e curadas: citações, paralelos, ecos e temas canônicos. O recurso não usa semelhança textual automática nem IA. Novas relações devem entrar com nota explicativa e alvo bíblico válido.

## Idiomas originais

A transliteração é uma ajuda de leitura, não uma reconstrução fonética completa. A explicação morfológica preserva o código original para auditoria. Nos códigos OSHB ainda não interpretados em detalhe, a interface identifica idioma e classe geral, mantendo o código integral.

## Dependências

- Vite direto: 7.3.7.
- Zod direto: 4.6.7.
- O código de backup foi migrado para a assinatura explícita de chaves do Zod 4.
- O Expo CLI ainda declara Zod 3 como dependência própria. No Mobile ele permanece isolado sob o pacote do CLI para compatibilidade da ferramenta, enquanto o código do aplicativo usa Zod 4. Essa dependência de ferramenta deve ser removida quando o Expo publicar compatibilidade oficial.

## Validação esperada

A CI deve executar testes, TypeScript e build Web. A branch foi removida do gatilho de APK antes das alterações, portanto esta rodada não publica aplicativo Android.
