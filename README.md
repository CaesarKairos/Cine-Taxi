# Mini Motor

Um estúdio local para criar miniaturas de carros e placas. Sem backend, contas ou serviços externos em tempo de execução.

## Executar

Requer Node.js 22.12+ (validado com Node 24).

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. Para gerar a versão de produção, execute `npm run build`; use `npm run preview` para visualizá-la.

## O que está incluído

- Cinco carrocerias construídas por geometria SVG: sedã, hatch, cupê, muscle e perua.
- Pintura livre, cor secundária, acabamentos, lanternas, para-choques, rodas, vidros, aerofólios, escapamentos e detalhes.
- Editor de placas com seis pontos de partida, texto livre e múltiplas linhas, três fontes locais, ajuste automático opcional, tamanho manual, espaçamento, alinhamentos, dimensões, moldura, borda e faixas.
- Garagem persistida no `localStorage` deste navegador, com restauração e exclusão de miniaturas. Limpar os dados do navegador apaga a coleção.
- Exportações SVG com a fonte da placa embutida, PNG transparente de 1600 × 1160 e ícone PNG transparente de 256 × 256, todos originados do mesmo renderizador.
- Layout para desktop e celular; geração aleatória e restauração do original.

## Organização

| Arquivo                | Responsabilidade                                          |
| ---------------------- | --------------------------------------------------------- |
| `src/state.js`         | Configuração inicial, parâmetros das carrocerias e paleta |
| `src/car.js`           | Geometria, materiais, montagem das peças e perspectiva    |
| `src/materials.js`     | Luz, vidro e acabamento cromado                           |
| `src/parts.js`         | Geometria reutiliz?vel de rodas                           |
| `src/export.js`        | Fontes embutidas e exporta??es SVG/PNG/?cone              |
| `src/plate.js`         | Medição tipográfica e composição da placa SVG             |
| `src/main.js`          | Interface, estado interativo, garagem e exportação        |
| `src/style.css`        | Direção de arte e responsividade                          |
| `tests/studio.spec.js` | Verificação no Chromium e capturas                        |

A perspectiva é uma construção vetorial pseudo-3D: faces com luz e sombra, vidro facetado e um plano traseiro compartilhado por placa e lanternas. Não há modelos ou imagens de carros baixados. As dimensões da placa são preservadas proporcionalmente e limitadas ao espaço de montagem. O modo manual pode deliberadamente ultrapassar a área útil; o texto é recortado na borda da placa. A fonte Estrada (Barlow Condensed) oferece pesos de 400 a 900; as outras mantêm seu peso original.

Os presets são interpretações gráficas, sem pretensão de reproduzir normas oficiais. No ícone pequeno, a legibilidade dos caracteres diminui naturalmente; a composição e as cores da miniatura são preservadas. O protótipo usa uma vista fixa e não oferece rotação 3D.

## Validação visual

Com o servidor de desenvolvimento aberto:

```sh
npx playwright install chromium
npm test
```

O teste verifica a garagem, carrocerias, textos longos e em duas linhas, tamanho manual e espaçamento, dimensões, exportações e ausência de rolagem horizontal em 390 px. As capturas e exportações ficam em `screenshots/`. A inspeção visual dessas capturas também faz parte da validação.

## Fontes e licenças

Fontes distribuídas localmente pelos pacotes Fontsource: **Bebas Neue**, **Barlow Condensed**, **Anton** e **Space Grotesk**, sob SIL Open Font License 1.1. Avisos e textos das licenças estão em `licenses/`. Bebas Neue e Barlow Condensed trazem proporções condensadas adequadas a placas, sem depender apenas de uma fonte de sistema. Fontes não são réplicas oficiais de caracteres de emplacamento.

Não há referências anexadas disponíveis neste checkout; a direção de arte foi desenvolvida a partir da descrição do projeto.
