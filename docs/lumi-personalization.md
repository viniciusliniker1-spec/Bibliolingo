# Foto de perfil, Lumi personalizável e Loja Lumi

## Arquitetura

- A foto de perfil identifica a conta; a Lumi continua representando o aluno nas trilhas.
- O editor humano foi removido da experiência. O armazenamento local antigo não é apagado, evitando perda irreversível de dados.
- Web e Android consomem o mesmo catálogo, inventário, equipamento, carteira e histórico no Supabase.
- XP e moedas Lumi são independentes. Compras nunca alteram XP.
- Eventos educativos continuam na fila offline existente. O RPC `submit_sync_event_with_lumi` confirma o evento e credita a recompensa na mesma transação.
- Compras bloqueiam a carteira, validam saldo no servidor e usam uma chave idempotente.
- Fotos ficam no bucket privado `profile-photos`; o cliente recebe URL assinada curta apenas para exibição. O caminho estável fica no perfil.

## Migration obrigatória

Aplicar, nesta ordem, as migrations existentes e depois:

`supabase/migrations/202610260001_lumi_store_profile_photo.sql`

Sem essa migration a interface permanece preservada, mas upload, catálogo, carteira, compra e equipamento retornam erro de recurso indisponível. Não publicar a funcionalidade antes da aplicação e dos testes de acesso entre duas contas.

## Recompensas implementadas

- Primeira conclusão de lição: 10 moedas.
- Primeira conclusão de checkpoint: 25 moedas.
- Conquista registrada de modo autoritativo: 30 moedas.
- Livro bíblico: reservado em configuração como 100 moedas, mas não creditado ainda porque o projeto não possui um evento autoritativo de conclusão de livro. Não foi criado um gatilho fictício.

Repetições posteriores da mesma lição/checkpoint não geram nova recompensa. Eventos offline repetidos usam o mesmo identificador e não duplicam crédito.

## Assets

A composição por camadas e os pontos de encaixe estão implementados. Os itens iniciais estão marcados com `asset_status=pending` e aparecem como **ARTE PENDENTE**.

Para concluir o visual, cada item precisa de sprite oficial transparente, alinhado ao canvas da Lumi e validado nas expressões existentes. Nenhum sprite foi inventado. As 66 ilustrações especiais de conclusão dos livros continuam fora desta personalização e não são substituídas.

## Teste manual mínimo

1. Aplicar a migration em ambiente de teste.
2. Entrar com conta A no Android e na Web.
3. Escolher, recortar, salvar, trocar e remover a foto; conferir sincronização.
4. Concluir uma lição inédita e confirmar +10 uma única vez, inclusive após repetição e sincronização offline.
5. Comprar um item com saldo suficiente e tentar repetir a compra.
6. Equipar/remover e confirmar a Lumi no perfil e no ponto atual da trilha.
7. Entrar com conta B e confirmar que não acessa foto, carteira, inventário nem equipamento da conta A.
8. Confirmar que XP, checkpoints, conquistas, notas e progresso permaneceram inalterados.
