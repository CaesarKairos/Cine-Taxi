# Inspeção visual do renderizador 3D

As imagens anexadas mencionadas no pedido não estavam disponíveis na conversa nem no checkout. Não foi possível fazer comparação direta com essas imagens. A direção adotada segue a descrição de miniaturas low-poly, com a prévia pública do Car Kit como referência para a base das malhas.

## Rodadas e correções

1. A primeira captura revelou rodas recuadas, vidro do hatch ausente e vidro pequeno na perua. As cabines herdadas desses dois modelos foram substituídas por construções próprias.
2. A análise das faces inferiores revelou pedaços das placas antigas dos doadores. Essas faces foram retiradas na preparação; a traseira recebeu fechamento inferior e suporte próprio para a placa.
3. A câmera inicial mostrava lateral demais. Seu ângulo horizontal foi reduzido e uma vista traseira centralizada foi adicionada. Ambas usam projeção ortográfica.
4. As fontes passaram a carregar explicitamente antes da medição e rasterização. Um canvas não dispara o carregamento de uma webfont como o texto DOM; isso corrigiu a primeira captura da placa com fonte substituta.
5. Os frisos passaram a seguir a superfície dos painéis; as faixas recortam a geometria da pintura. As rodas foram assentadas junto aos para-lamas, usando a largura de cada chassis.
6. Luz e sombra do chão foram reduzidas após a primeira inspeção, para recuperar a cor da pintura e evitar uma sombra pesada.
7. A combinação com para-choque esportivo encobria a borda inferior da placa. A altura de montagem dos para-choques foi corrigida nos cinco modelos. Um teste por raios verifica nove pontos da placa em 90 cenários: cinco carrocerias, três para-choques, três proporções e duas câmeras.
8. O verniz foi reduzido para preservar a cor no teto em ângulos rasantes. A captura final também inclui um hatch fosco, além das pinturas brilhantes.
9. O recorte dos para-choques antigos deixava faces internas aparentes sob a placa. Um fechamento traseiro pintado conecta o painel das lanternas ao novo para-choque, com dimensões próprias de cada chassis.

## Evidências

| Critério | Observação nas capturas |
| --- | --- |
| Silhuetas | Sedã com cabine alta e porta-malas; cupê mais baixo; muscle largo com cabine própria; hatch curto e perua com teto longo e vidro de carga |
| Rodas | Quatro rodas tridimensionais, assentadas no chão e posicionadas nas caixas de roda; bitola derivada da largura de cada modelo |
| Traseira | Painel de lanternas, fechamento pintado, placa e para-choque formam volumes separados e conectados |
| Placa | Texto condensado legível nas duas câmeras; composição em duas linhas e proporções diferentes verificadas; 810 raios sem obstrução nos cenários testados |
| Peças | Capturas incluem lanternas redondas, retangulares e verticais, para-choques cromado e esportivo, aerofólios, rodas, escapamento quádruplo, faixas e adesivo |
| Materiais | Pintura brilhante e fosca, vidro escuro/azulado, lentes, metal e borracha respondem à mesma iluminação |
| Celular | Capturas em 390 × 844; editor funciona em coluna, sem rolagem horizontal |
| Exportação | PNG e ícone renderizados da configuração 3D, com alpha transparente; SVG limitado à composição vetorial da placa |

Isso verifica as configurações capturadas e os cenários geométricos descritos, não uma inspeção visual exaustiva de todas as combinações possíveis de acessórios.

`screenshots/3d/01-desktop.png` mostra a interface preservada. `sedan-quarter.png`, `hatch-quarter.png`, `coupe-quarter.png`, `muscle-quarter.png` e `wagon-quarter.png`, e as versões `*-rear.png`, registram os modelos sob a mesma configuração para comparar silhuetas.

O teste do estúdio grava `car-*.png` e `car-*-rear.png` com cores e placas diferentes, além de `02-editor-placa.png`, `03-mobile.png`, `04-mobile-placa.png` e `car-custom-sport.png`. `export-rear.png` é uma captura transparente gerada pelo teste de renderização. As exportações dos botões ficam em `screenshots/export-png.png`, `screenshots/export-icon.png` e `screenshots/export-plate-svg.svg`.

`scripts/inspect-3d.mjs` atualiza as capturas após os refinamentos visuais, incluindo os cinco carros originais, versões personalizadas, acabamento fosco, peças esportivas, editor de placas, celular e exportações. `node scripts/visual-gallery.mjs` reúne seis dessas capturas reais em `screenshots/3d/collection.png`.

## Limites da verificação

O Chromium usa renderização WebGL por software para permitir capturas consistentes neste ambiente Windows. Não foi medida a performance em celulares físicos, nem feita uma rodada em Safari/Firefox. O renderizador exige WebGL 2 e apresenta uma mensagem caso a criação do contexto falhe.

A vista é limitada a dois ângulos. Os interiores não foram modelados; os vidros usam material escuro refletivo. A suspensão não é animada. O nível de detalhe permanece simples e caricato, sem pretensão de fidelidade a marcas ou veículos reais específicos.
