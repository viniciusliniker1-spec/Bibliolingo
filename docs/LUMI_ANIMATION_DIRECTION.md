# Direção de animação da Lumi

## Objetivo

Fazer a Lumi atuar como guia emocional e pedagógica da jornada, sem competir com a leitura, a pergunta ou os controles.

## Primeira camada já implementada

`mobile/components/LumiCharacter.tsx` aplica movimento por código sobre as poses aprovadas existentes. O movimento respeita a preferência do sistema **Reduzir movimento** e não exige baixar novos assets.

| Momento | Pose | Movimento |
| --- | --- | --- |
| Carregamento | tecnológica | flutuação discreta |
| Chegada/retorno | boas-vindas ou acolhedora | entrada suave e balanço |
| Início de lição | animada | pulso encorajador |
| Acerto | surpresa | celebração curta |
| Erro | determinada | impulso acolhedor |
| Resultado | orgulhosa ou aventureira | celebração curta |

Os sons atuais continuam vinculados aos eventos de acerto, erro, conclusão e checkpoint. Nunca devem tocar se o usuário os tiver desativado.

## Como gerar novas animações

1. Definir o gesto e seu significado antes da arte: por exemplo, comemorar, pensar, explicar, encorajar ou apontar o próximo passo.
2. Criar de 4 a 8 quadros com fundo transparente, mesma proporção, paleta, roupa e linha visual da Lumi aprovada.
3. Exportar PNG com alfa; para animações de interface, usar até 512 px no maior lado e gerar variantes menores para mobile.
4. Registrar os arquivos em `mobile/assets/feedbackAssets.ts` e renderizá-los como sprite ou sequência no componente `LumiCharacter`.
5. Validar legibilidade, contraste, consumo de memória e preferência por movimento reduzido em Android real.

## Primeiras animações recomendadas

- `idle`: respiração e piscada para Home;
- `correct`: salto curto + brilho;
- `try-again`: cabeça baixa breve e gesto de encorajamento;
- `checkpoint`: celebração com medalha;
- `streak`: chama pequena e olhar orgulhoso;
- `loading`: olhar para os lados ou leitura de mapa.

Evitar loops intensos, texto dentro da arte, movimentos que cubram alternativas e reações que culpabilizem o aluno por errar.
