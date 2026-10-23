# Roadster e conversível

Esta etapa entrega dois modelos, elevando o catálogo de cinco para sete. Picape, jipe/SUV, van clássica e esportivo Targa permanecem pendentes. A prioridade foi terminar interiores e capotas coerentes antes de ampliar o catálogo com adaptações superficiais.

## Geometria e referência

`src/vehicle/convertibles.js` contém geometria original do projeto, sob a licença ISC do repositório. Não foram adicionadas malhas externas nem dependências. As cinco bases Kenney CC0 existentes continuam intactas e usam o mesmo processo de preparação.

O roadster é uma interpretação estilizada de esportivos abertos dos anos 1960, inspirada na California Spider: capô longo, habitáculo recuado de dois lugares, para-brisa baixo com moldura cromada, porta-malas separado, lanternas redondas simples e para-choque fino. Não é uma reprodução licenciada da Ferrari nem uma réplica dimensional. Referência pública consultada: [1961 Ferrari 250 GT SWB California Spider, Gooding Christie's](https://www.goodingco.com/lot/1961-ferrari-250-gt-swb-california-spider-1a/).

O conversível moderno tem perfil próprio: entre-eixos mais curto, maior largura, cintura mais alta, para-brisa mais alto e inclinado, bancos com encostos de cabeça e lanternas duplas. Os dois modelos têm conjuntos próprios de seções, eixos e limites de habitáculo; nenhum usa a cabine ou a malha do cupê.

As seções longitudinais produzem ombros convexos, capô e porta-malas. As laterais são faixas conectadas, com recortes circulares e retornos internos nas caixas de roda. A abertura do habitáculo não recebe uma superfície de carroceria. Piso, túnel, forros de porta, bancos, costuras, painel, mostradores, volante com raios, câmbio e retrovisores são objetos 3D reais. A cor do interior é editável.

## Compatibilidade de teto

Cada modelo declara suas capacidades em `models[id].roofs`. Ausência dessa propriedade significa teto fixo. Por enquanto, somente roadster e conversível declaram `open` e `closed`.

- Aberta: para-brisa independente, interior exposto e tecido dobrado atrás dos bancos.
- Fechada: tecido dobrado removido, capota curva, painel traseiro, janela traseira e vidros laterais. O interior permanece sob a capota.
- Removível/Targa: não oferecido; requer outra estrutura, arco e pontos de montagem próprios.

`normalizeConfiguration` preenche `roof` e `interior` em configurações antigas e corrige opções incompatíveis. Não altera os identificadores, as placas ou as peças dos cinco modelos anteriores. As novas carrocerias também passam por essa normalização quando renderizadas diretamente para exportação. A mesma configuração alimenta preview, garagem, miniatura, PNG e ícone.

Os pontos de placa, lanternas, para-choques, rodas e aerofólios continuam definidos por modelo. A composição SVG/CanvasTexture da placa e suas proporções não foram substituídas. Aerofólios permanecem no porta-malas, sem depender do estado da capota.

A altura do aerofólio é independente da altura do painel traseiro (`spoilerY`), pois o porta-malas é inclinado. A área da janela traseira continua editável com a capota fechada. Com a capota aberta, esse controle não aparece; a tonalidade continua afetando o para-brisa.

## Próximos modelos

| Modelo | Trabalho necessário antes de entrar no catálogo |
| --- | --- |
| Picape | Cabine independente, caçamba com piso, paredes e tampa; montagens na tampa |
| Jipe/SUV | Base Kenney SUV possível, suspensão e pneus adequados, traseira e eventual estepe sem cobrir a placa |
| Van clássica | Carroceria alta própria, proporção de eixos, portas e traseira específicas; avaliar base Kenney van |
| Targa | Arco estrutural permanente, vidro traseiro próprio e painel removível; não reutilizar capota de tecido |

Nenhuma dessas opções aparece na interface como se estivesse pronta.

## Reproduzir a validação

Com Vite em execução, `node scripts/inspect-convertibles.mjs` gera as oito vistas de carroceria/capota/ângulo, captura desktop e celular e verifica downloads. Para outro endereço, use a variável de ambiente `STUDIO_URL`.

`tests/convertibles.spec.js` verifica interior, ausência de cabine doadora, exclusão entre tecido dobrado e capota fechada, visibilidade vertical dos assentos abertos, normalização e restauração da capota na garagem. `tests/mount-check.js` inclui todo o catálogo no teste de obstrução da placa. As capturas reais ficam em `screenshots/convertibles/`.

## Inspeção realizada

- Oito capturas: dois modelos × duas capotas × vistas traseira e ¾. Roadster vermelho com `NRVOUS`, cromados e lanternas simples; conversível azul com para-choque esportivo e lanternas horizontais.
- Interior aberto verificado nas imagens e por raios verticais sobre os assentos. Nenhuma malha de teto ou janela doadora permanece nos modelos novos.
- Refinamentos após inspeção: laterais subdivididas para eliminar triângulos diagonais excessivos, para-brisa do roadster rebaixado, bancos mais visíveis, capota curva com junções fechadas e vedação inferior.
- Placa sem obstruções em 162 combinações de carroceria/capota, para-choque, proporção de placa e câmera: 1.458 raios sobre a superfície da placa.
- Aerofólio discreto comparado com a superfície real do porta-malas por interseção de raios, evitando montagem suspensa ou enterrada.
- Tela de 390 px sem overflow horizontal; sete miniaturas visuais e controles de capota acessíveis. Editor e garagem anteriores também passaram pelos testes de regressão.
- Downloads reais de PNG 1600 × 1160 e ícone 256 × 256; ambos têm pixels de carro e alpha zero nos cantos. O ícone foi inspecionado visualmente, inclusive a placa.

Veja [coleção](../screenshots/convertibles/collection.png), [desktop](../screenshots/convertibles/desktop.png), [celular](../screenshots/convertibles/mobile.png) e [ícone](../screenshots/convertibles/export-icon.png). `node scripts/gallery-convertibles.mjs` recompõe a folha comparativa a partir das capturas, sem gerar ou substituir a arte dos carros.
