# Diagnóstico e publicação do Mini Motor no Cloudflare Pages

## Causa comprovada da tela branca

Na inspeção de 25/10/2026, https://cine-taxi.pages.dev/ respondeu HTTP 200, mas entregou o HTML-fonte com `<script type="module" src="/src/main.js">`. O arquivo público continha imports de pacotes sem empacotar. O Chromium/Playwright registrou:

```
Failed to resolve module specifier "@fontsource/space-grotesk/latin-400.css".
Relative references must start with either "/", "./", or "../".
```

O navegador abortava o módulo antes de construir a interface, e `#app` ficava vazio. A evidência comprova a publicação dos fontes em vez do artefato Vite. Não houve acesso ao painel para determinar qual configuração ou upload originou esse deploy. O build local empacota Three.js e fontes corretamente; não há necessidade de trocar a stack.

## Configuração definitiva no painel

Em Workers & Pages → Cine-Taxi → Settings → Builds & deployments, configure:

| Campo | Valor |
| --- | --- |
| Repositório | `CaesarKairos/Cine-Taxi` |
| Production branch | `main` |
| Root directory | vazio (raiz do repositório) |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Build image | v3 |
| Node | `22.16.0`, conforme `.node-version` |

Remova eventual variável `NODE_ENV=production` que impeça instalar as devDependencies necessárias ao build. Se existir override `NODE_VERSION`, use `22.16.0` ou remova-o para respeitar `.node-version`.

Salve e gere novo deployment a partir do commit com estas alterações. Confira nos logs a execução do Vite e a mensagem `Production artifact verified`. A integração Git inicia novos builds da `main`; o workflow de smoke verifica o artefato, mas não realiza deploy. Em upload manual, envie somente o conteúdo de `dist/`.

A correção local não altera o deployment existente. Após publicar, confirme que o HTML público referencia `/assets/index-*.js`, nunca `/src/`. Compare também o commit do deployment com o commit enviado.

## Arquitetura e validação reproduzível

Aplicação estática Vite + Three.js executada no navegador com WebGL 2. A garagem mantém `localStorage` e sua chave original. Não usa servidor Node em produção, SSR, banco, Functions ou Workers. Não são necessários Wrangler, `_headers` ou `_redirects`.

```sh
npm ci
npx playwright install chromium
npm run test:production
```

O comando compila o projeto, verifica `dist/index.html`, referências compiladas, CSS, fontes e cópia integral dos cinco JSON-base, inicia `npm run preview` em `127.0.0.1:4173` e executa o Playwright sobre essa versão. As 12 carrocerias combinam esses modelos-base com geometrias procedurais.

O smoke cobre inicialização, 12 seleções, cores, câmeras, placa, garagem após reload, download PNG/ícone/SVG com fonte embutida, mobile, erros de console/página/rede e falhas simuladas de WebGL, módulo e modelo. Evidências em `screenshots/production/` e anexos de rede em `test-results/`. O GitHub Actions repete essa validação em pushes da `main` e PRs.

Para inspeção manual:

```sh
npm run build
npm run preview
```

`vite preview` é apenas servidor local de validação. Cloudflare hospeda diretamente `dist/`. Não publique a raiz, `src/` ou somente `public/`. A entrada pequena carrega o módulo principal e seu CSS compilado dinamicamente; por isso o CSS pode ser referenciado pelo bundle em vez de um `<link>` no HTML.

## Diagnóstico de falhas futuras

| Sintoma | Verificação / ação |
| --- | --- |
| HTML referencia `/src/` ou erro de module specifier | Corrigir build command e output para `npm run build` e `dist`; refazer deploy. |
| JS/CSS retorna HTML ou MIME incorreto | Conferir URL, conteúdo e artefato publicado; um fallback SPA pode devolver HTML 200 para arquivo ausente. |
| Modelo ausente | Conferir `/models/*.json`, resposta JSON, maiúsculas/minúsculas e cópia de `public/models/` para `dist/models/`. |
| Fonte ausente | Conferir `/assets/*.woff2` e CSS compilado; não servir imports npm diretamente. |
| WebGL 2 indisponível | A interface mostra explicação; habilitar aceleração gráfica ou usar navegador compatível. |
| Contexto gráfico perdido | Mensagem persistente orienta recarregar; garagem salva permanece no navegador. |
| Erro de módulo/inicialização | HTML inicial e aviso de falha evitam página vazia; consultar console. |
| Uma carroceria falha | Aviso no preview; selecionar outra ou tentar novamente. Miniaturas falhas não interrompem as demais. |
| Garagem parece vazia em outro domínio | `localStorage` pertence à origem e ao navegador; não há sincronização. |

Não publique mensagens de sucesso baseadas apenas no dev server. Verifique o domínio após o novo deploy: roadster vermelho aberto, NRVOUS, modelos, cores, peças, placa, garagem e exportações, também no celular.

Referências: [Cloudflare build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) e [Vite static deployment](https://vite.dev/guide/static-deploy.html).
## Evidências da validação local

Validação em 25/10/2026, Windows, Node.js 24.16.0, Chromium com renderização por software:

- `npm ci`: 24 pacotes instalados, auditoria sem vulnerabilidades.
- `npm run build`: sucesso; artefato estático verificado, com fontes e modelos locais. O Vite avisa que o bundle principal de Three.js ultrapassa 500 kB; é um aviso de tamanho, sem impedir a compilação.
- Fluxo compilado: as 12 carrocerias renderizaram; cores, câmeras, placa, garagem após reload, PNG, ícone e SVG com fonte embutida passaram.
- Rede: nenhum HTTP 4xx/5xx ou requestfailed no fluxo funcional; MIME de JS, CSS e JSON validado. Nenhum erro de console ou página nesse fluxo.
- Mobile: 390 × 844, placa editável, sem overflow horizontal.
- Capturas inspecionadas: [desktop](../screenshots/production/desktop.png) e [mobile](../screenshots/production/mobile.png).
- Os limites dos testes consideram a renderização por software: 10 minutos por teste e 60 segundos por asserção. A primeira execução com limites menores expirou durante reload/restauração; não foi considerada aprovação.

O domínio público foi inspecionado para diagnóstico, mas nenhum novo deployment foi realizado ou validado com estas alterações. É necessário publicar o commit e verificar o novo deployment no Pages.

Resultado final de `npm run test:production`: **4 passed (5.1m)**, incluindo o fluxo funcional completo e os três cenários de falha. As alterações permanecem locais nesta entrega; não houve push nem alteração do painel Cloudflare.
