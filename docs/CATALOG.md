# Catálogo de 12 miniaturas

Esta expansão mantém os sete modelos anteriores e acrescenta cinco carrocerias de autoria própria, geradas em `src/vehicle/catalog.js`. Nenhuma nova malha ou textura externa foi incorporada. As bases Kenney CC0 e seus arquivos de licença permanecem inalterados; as novas geometrias seguem a licença ISC do projeto.

## Desenho das carrocerias

| Modelo | Construção | Personalização específica |
| --- | --- | --- |
| Van retrô | Volume alto, cabine prolongada, quatro áreas de vidro por lateral, teto arredondado nas bordas, faixa bicolor e divisões de tampa traseira | Cor secundária no teto/faixa e bagageiro |
| Picape | Cabine curta separada, capô, caçamba com piso nervurado, paredes internas, caixas de roda, trilhos e tampa com dobradiças | Aberta, lona plana ou capota com vidros |
| Jipe | Distância elevada do solo, pneus maiores, eixos, diferenciais, suspensão e extensões de para-lamas | Bagageiro e estepe externo montado acima da placa |
| Futurista | Perfil em cunha, cabine baixa, vidro traseiro inclinado com persianas, planos angulares e faixa de proteção lateral | Pintura com acabamento metálico em aço |
| Compacto retrô | Volume central elipsoidal, teto por seções curvas facetadas, quatro para-lamas salientes, janelas aplicadas sobre a curvatura e tampa de motor com respiros | Pinturas, faixas curvas, lanternas e cromados do editor |

As carrocerias não são o mesmo modelo redimensionado. Van, picape, jipe e cunha compartilham ferramentas para montar painéis e recortes de roda, mas possuem perfis, eixos, proporções, cabines e superfícies próprios. O compacto usa outro método de construção, com domo longitudinal e para-lamas hemisféricos abertos por baixo.

## Referências visuais

As imagens foram consultadas para estudar proporções, volumes e distribuição de detalhes. Não são distribuídas no projeto, não fornecem texturas e não implicam reprodução licenciada de marcas ou modelos:

- [Volkswagen T1 Samba, vista traseira — Autopaedia](https://www.autopaedia.com/en/galleries/Volkswagen/Volkswagen_Type_2_Transporter/VW_Type_2_%28Transporter%29_T1_1950-1967_%281961_Samba%29_%2801%29_-CB1-.php).
- [Ford F100 1956, caçamba e restauração — Classic Industries](https://news.classicindustries.com/top-10-restoration-modification-mistakes-early-ford-trucks-1932-56).
- [Jeep CJ-7 1978 — Classic Trader](https://www.classic-trader.com/nl/oldtimer/advertentie/jeep/cj-7/cj-7/1978/452260).
- [DeLorean DMC-12 1983 — Iconic Auctioneers](https://www.iconicauctioneers.com/1983-delorean-dmc-12-rec13733-1-silverston-0824).
- [Volkswagen Beetle 1200 1963 — Iconic Auctioneers](https://www.iconicauctioneers.com/1963-volkswagen-beetle-1200-rec13741-3-nec-1124).

## Capacidades e compatibilidade

`src/vehicle/models.js` registra largura, traseira, alturas de placa/lanternas/para-choques, altura do teto e capacidades de cada veículo. `rack`, `spare`, `bedCover`, `roofColor`, `finishes` e `spoiler` determinam os controles e a montagem. `normalizeConfiguration` remove escolhas incompatíveis ao trocar de carroceria ou carregar uma configuração. A garagem continua usando a mesma chave e os mesmos identificadores dos sete modelos anteriores.

O estepe fica centralizado acima do suporte da placa, em vez de ocupar uma lateral onde poderia encobrir placas largas. A posição da placa é independente da posição do estepe. A cobertura da caçamba não modifica a cabine da picape nem preenche o interior com um bloco sólido.

A demonstração inicial permanece o roadster aberto, vermelho `#ba252b`, interior `#f0dbc2`, placa `NRVOUS`. Recomeçar restaura essa configuração.

## Seleção e captura

Os filtros Todos, Clássicos, Esportivos e Utilitários não alteram a configuração. A grade tem rolagem interna e altura limitada para manter os controles próximos no celular. As miniaturas continuam sendo produzidas pelo renderizador.

Com Vite em execução:

```sh
node scripts/inspect-catalog.mjs
node scripts/gallery-catalog.mjs
```

`STUDIO_URL` permite outro endereço local. As imagens e a galeria ficam em `screenshots/catalog/`. O processo usa Playwright e o renderizador real do editor, sem imagens geradas ou modelos de demonstração separados.

## Validação visual e geométrica

Foram capturadas as duas vistas dos 12 carros e seis preparações: van com bagageiro, picape com lona, picape com capota, jipe com estepe e bagageiro, futurista metálico com faixas e compacto de corrida. Cada preparação também tem um ícone de 256 px.

A inspeção levou a revisões concretas: o compacto recebeu teto mais baixo e largo, vidros na mesma malha da carroceria, traseira curva e lanternas montadas nos para-lamas; o suporte do estepe foi elevado para liberar a placa e aprofundado para tocar a carroceria; o chassi do jipe foi elevado; a câmera da caçamba aberta foi ajustada para mostrar seu piso. As superfícies curvas do compacto são agrupadas por material para limitar chamadas de desenho.

Os testes cobrem:

- Catálogo de 12 modelos, capacidades compatíveis, normalização de configurações antigas e demonstração inicial.
- Caçamba aberta verificada com raio vertical atingindo o piso ou suas nervuras.
- Contato dos quatro pés de cada bagageiro com o teto e do suporte do estepe com a carroceria, medido por raios e limites geométricos.
- Faixas efetivamente presentes nas cinco geometrias novas.
- Placa sem obstrução em 180 configurações de geometria, com os dois ângulos e nove pontos por placa: 3.240 raios. Inclui três para-choques, três proporções de placa, os estados de capota e acessórios compatíveis.
- Editor de placas, textura, garagem, restauração, exportação e conversíveis anteriores.
- Navegação por famílias e tela de 390 px sem ultrapassar a largura disponível.

Os downloads reais de PNG, ícone e placa SVG foram exercitados. Os PNGs têm 1600 × 1160 e os ícones 256 × 256, com alpha zero nos cantos e pixels visíveis. As capturas da interface também foram inspecionadas em desktop e celular.

[Galeria dos 12 carros](../screenshots/catalog/collection-12.png) · [Acessórios e pinturas](../screenshots/catalog/accessories.png) · [Desktop](../screenshots/catalog/desktop.png) · [Celular](../screenshots/catalog/mobile.png)

As imagens dos veículos são interpretações estilizadas e não réplicas dimensionais ou modelos oficiais licenciados. O acabamento em aço é um material metálico simples; não usa uma textura de aço escovado. O Targa continua fora deste catálogo.

Resultado final: `npm run build` aprovado e os seis testes Playwright aprovados em uma execução completa (6,1 minutos). A execução final usou um servidor Vite com cache isolado e monitoramento desativado para não receber recargas de outros servidores locais. O build mantém o aviso de tamanho do bundle principal do Three.js, sem erro de compilação.
