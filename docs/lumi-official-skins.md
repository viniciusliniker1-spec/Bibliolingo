# Skins oficiais da Lumi

## Estado da integração

A Loja Lumi usa skins completas, nunca camadas de acessórios. Os itens de óculos, Hip-Hop, Gênesis, Êxodo, Levítico, Números e Deuteronômio apontam para os PNGs oficiais em `assets/lumi/skins`.

O arquivo `lumi_base.png` não estava presente na entrega de 27/10/2026. A Lumi Original permanece disponível para todas as contas e usa temporariamente a ilustração contextual oficial já existente. O catálogo a mantém com `asset_status = pending`; não foi criada arte substituta.

## Backend

Aplicar, nesta ordem:

1. `202610260001_lumi_store_profile_photo.sql`
2. `202610270001_lumi_official_skins.sql`

A segunda migration cadastra as oito skins, concede a Original a contas existentes e futuras, garante uma única skin equipada e exige as conquistas reais dos livros antes da compra das skins temáticas. Compras continuam atômicas e idempotentes; XP não é descontado.

## Assets

Execute `npm run validate:lumi-skins`. O validador lê a estrutura PNG, dimensões e pixels do canal alfa. O arquivo base ausente é relatado como pendência; os sete arquivos entregues são obrigatórios.

## Pendência deliberada

A recompensa genérica de 100 moedas por qualquer um dos 66 livros continua condicionada a um evento autoritativo de conclusão de livro no backend. Não foi inferida a partir da abertura da tela nem concedida por um simples ID informado pelo cliente.
