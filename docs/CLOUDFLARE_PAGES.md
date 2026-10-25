# Publicação do Cine-Taxi no Cloudflare Pages

## Arquitetura

O Cine-Taxi é uma aplicação **Vite + JavaScript + Three.js** totalmente client-side.

1. O Cloudflare Pages hospeda o `index.html`, os módulos JavaScript empacotados, CSS, fontes e modelos JSON.
2. O navegador do visitante baixa esses arquivos e renderiza os carros usando **WebGL 2**. A plataforma não precisa renderizar imagens 3D no servidor.
3. Os modelos originais de `public/models/*.json` são copiados pelo Vite para `dist/models/*.json`; `src/vehicle/models.js` já usa `import.meta.env.BASE_URL` para carregá-los.
4. A garagem usa `localStorage`: os dados permanecem apenas naquele navegador e origem. Não há sincronização automática entre computadores, celulares ou domínios.

Não são necessários **Pages Functions, Workers, D1, KV, R2, SSR, proxies ou regras de reescrita** para a versão atual.

## Configuração do projeto Pages

No [painel Cloudflare](https://dash.cloudflare.com/?to=/:account/workers-and-pages):

1. Acesse **Workers & Pages**, crie uma aplicação do tipo **Pages** e escolha conectar um repositório Git.
2. Autorize o acesso ao GitHub, se solicitado, e selecione `CaesarKairos/Cine-Taxi`.
3. Configure os seguintes valores:

| Campo | Valor |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` (raiz do repositório) |
| Framework preset | `None` (configuração manual) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Build image | v3 |
| Node.js | `22.16.0` (via `.node-version`) |

4. Salve e inicie o deploy. O Pages publicará uma URL do tipo `https://<nome-do-projeto>.pages.dev` **após um deploy bem-sucedido**.
5. Configure opcionalmente um domínio próprio no projeto. Deploys futuros na branch `main` serão iniciados pela integração Git, se habilitada.

Não configure o diretório de saída como `public`: ele contém apenas os modelos-fonte do Vite, não o site pronto.

## Verificação local antes de publicar

Com Node.js compatível e as dependências instaladas:

```sh
npm ci
npm run build
npm run preview
```

Use a URL indicada pelo `vite preview` para verificar a versão de produção. O build deve criar `dist/index.html` e `dist/models/` com os cinco modelos JSON base, além de `dist/assets/`.

A pasta `screenshots/` é documentação e não deve ser publicada como conteúdo da aplicação.

## Checklist pós-deploy

- A página inicial exibe o roadster vermelho, capota aberta, interior claro e placa **NRVOUS**.
- As **12 carrocerias** e seus cartões de seleção carregam; alterne pelo menos uma de cada família.
- A rede do navegador não deve mostrar 404 para `/models/*.json`, fontes ou bundles JS/CSS.
- Alterações de pintura, peças e texto da placa são refletidas no renderizador.
- A câmera alterna entre traseira e ¾ sem perder a placa.
- Exportação de PNG, ícone e placa SVG funciona no domínio publicado.
- Salvar na garagem, atualizar a página e restaurar uma criação funcionam no mesmo navegador.
- A interface funciona no celular; WebGL 2 deve estar disponível no aparelho.

Se surgirem erros, confira primeiro os logs de build no Pages e a aba Network/Console do navegador. O desenvolvimento não precisa de proxy ou APIs privadas.

## Observações importantes

- `localStorage` é separado por **origem**. Uma garagem salva em `localhost` não aparece em `*.pages.dev`; mudar de domínio também não migra dados automaticamente.
- Não adicione um `404.html` nem um `_redirects` SPA sem necessidade: o Pages oferece fallback de single-page application quando não há `404.html` superior, e o site atual possui somente a página principal.
- Não configure cache manual agressivo para HTML ou outros arquivos do site: Pages gerencia sua estratégia de cache por deploy.
- Os limites atuais de Pages incluem **25 MiB por arquivo estático** e limites por quantidade de arquivos; verifique-os se novos pacotes 3D forem adicionados.
- Quando houver contas, catálogos compartilhados ou sincronização de garagem, reavalie Pages Functions + D1/R2. Essas mudanças são uma nova etapa, não requisito do deploy atual.

## Referências oficiais

- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/build-image/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/platform/limits/
