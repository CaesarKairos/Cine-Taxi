# Proveniência das malhas e adaptação

## Origem

- Autor: **Kenney** — https://kenney.nl
- Pacote: **Car Kit 3.1** — https://kenney.nl/assets/car-kit
- Licença: **Creative Commons Zero / CC0 1.0**. Aviso original preservado em `licenses/Kenney-Car-Kit.txt`.
- Arquivo obtido: https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip
- SHA-256: `fac7dacac5c7874348cf19729af3ef205f3d366493edaf0a827d93f4fdf3d0c4`
- O pacote inclui a indicação de versão 3.1 e data de criação 02-04-2026.

## Adaptações por carroceria

| Modelo | Malha doadora          | Trabalho adicional                                                                                                                                     |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sedã   | `sedan.glb`            | Materiais separados, remoção dos componentes traseiros antigos, rodas próprias, suporte e peças modulares; mantém cabine alta e porta-malas separado   |
| Hatch  | `hatchback-sports.glb` | Chassis encurtado, retirada de cabine e spoiler originais; cabine própria com porta traseira quase vertical, vidro largo e duas áreas de vidro lateral |
| Cupê   | `sedan-sports.glb`     | Perfil baixo, remoção de spoiler e peças traseiras originais; mantém teto baixo, vidro traseiro curto e porta-malas definido                           |
| Muscle | `sedan-sports.glb`     | Chassis largo e longo; a cabine original é substituída por teto, pilares, janelas e porta-malas próprios; painel traseiro largo                        |
| Perua  | `suv-luxury.glb`       | Chassis rebaixado e alongado; cabine substituída por teto comprido, vidro traseiro amplo e três áreas envidraçadas por lateral; capô adaptado          |

Cupê e muscle compartilham o doador. As cabines finais não são a mesma malha escalada: o muscle substitui a parte superior e adiciona volumes próprios. Rodas, lentes, para-choques, suportes, aerofólios e escapamentos usados na aplicação são geometria própria do projeto.

O sistema de coordenadas é X lateral, Y vertical, +Z dianteira e −Z traseira. `src/vehicle/models.js` define superfície de montagem traseira, largura, alturas das peças e suportes do aerofólio por carroceria. Os eixos longitudinais vêm dos conjuntos de roda dos doadores; a bitola é ajustada à largura dos para-lamas.

Os frisos encontram as faces da carroceria por interseção de raios em espaço local. As faixas recortam as faces reais da pintura, acompanhando sua inclinação.

## Conversão reproduzível

Roadster e conversível moderno são carrocerias originais geradas por `src/vehicle/convertibles.js`. Não utilizam doadores, não exigem conversão GLB e não alteram os cinco arquivos de malha existentes. A autoria, os interiores, as capacidades de capota e os modelos ainda pendentes estão em [CONVERTIBLES.md](CONVERTIBLES.md).

Baixe e extraia o arquivo acima. A preparação requer Python com Pillow, somente durante a autoria:

```sh
python -m pip install Pillow
python scripts/prepare-models.py "caminho/para/Models/GLB format"
```

O script lê os buffers dos GLBs, resolve as translações dos nós, separa os triângulos da textura de paleta em materiais semânticos e remove peças antigas substituídas. Exporta somente as malhas necessárias em `public/models/*.json`. Os normais são reconstruídos pelo Three.js; cabines próprias e peças são montadas em tempo de execução.

O pacote completo baixado fica fora do build (`.reference/`, ignorado pelo Git). A aplicação distribui somente os cinco derivados pequenos e não carrega FBX, OBJ, GLB ou texturas de paleta durante o uso.
