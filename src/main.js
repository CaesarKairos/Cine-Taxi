import "@fontsource/space-grotesk/latin-400.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource/barlow-condensed/latin-400.css";
import "@fontsource/barlow-condensed/latin-500.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/barlow-condensed/latin-900.css";
import "@fontsource/anton/latin-400.css";
import "./style.css";
import {
  initial,
  bodies,
  families,
  colors,
  clone,
  normalizeConfiguration,
} from "./state.js";
import { models } from "./vehicle/models.js";
import { VehicleStudio, captureVehicle } from "./vehicle/renderer.js";
import { exportCar } from "./export.js";
import { plate, esc } from "./plate.js";
let s = clone(initial),
  tab = "body",
  family = "all",
  saved = [];
try {
  saved = JSON.parse(localStorage.getItem("mini-motor-garage") || "[]");
  if (!Array.isArray(saved)) saved = [];
  saved = saved
    .filter((x) => x && x.config)
    .map((x) => ({ ...x, config: normalizeConfiguration(x.config) }));
} catch {}
const icons = { body: "▱", paint: "◒", parts: "⚒", plate: "▤", details: "✦" };
const tabs = {
  body: "Carroceria",
  paint: "Pintura",
  parts: "Peças",
  plate: "Placa",
  details: "Detalhes",
};
const app = document.querySelector("#app");
app.innerHTML = `<header><a class="brand" href="./" aria-label="Mini Motor início"><span class="brand-mark">m<span>m</span></span>mini motor<span class="brand-dot">®</span></a><div class="header-center">PEQUENOS CARROS. GRANDES PERSONALIDADES.</div><button class="garage-button" id="garage">▱ <span>Minha garagem</span><b id="saved-count">${saved.length}</b></button></header><main><div class="page-intro"><div><div class="eyebrow"><i></i> ESTÚDIO DE CUSTOMIZAÇÃO</div><h1>Seu próximo <em>pequeno</em> ícone.</h1><p>Uma carroceria. Infinitas histórias. Faça do seu jeito.</p></div><div class="edition">FEITO PARA INVENTAR<br><strong>VOL. 001 / ORIGINALS</strong></div></div><div class="studio"><section class="stage" aria-label="Preview do carro"><div class="stage-top"><span class="pill"><i></i> AO VIVO NA SUA GARAGEM</span><button id="reset" class="quiet">↺ <span>Recomeçar</span></button></div><div class="stage-watermark">ORIGINALS</div><div id="car-preview"></div><div class="stage-caption"><span id="model-code">MM—03</span><div><h2 id="model-name">O seu cupê.</h2><span>1:24 DE PURA PERSONALIDADE</span></div><div class="view-switch" aria-label="Ângulo do carro"><button data-view="rear" aria-pressed="false">Traseira</button><button data-view="three-quarter" aria-pressed="true">&#190;</button></div></div><div class="stage-bottom"><div class="color-info"><span id="color-dot"></span><div><b id="color-name">Coral de garagem</b><small id="finish-name">Acabamento brilhante</small></div></div><button id="random" class="random">⚄ Surpreenda-me</button></div><span class="stage-corner">DESIGNED BY YOU, BUILT FOR FUN.</span></section><aside class="editor"><div class="editor-heading"><div><span class="eyebrow">A SUA ASSINATURA</span><h2>Hora de dar personalidade.</h2></div><span class="editor-star">✳</span></div><nav id="tabs" aria-label="Categorias">${Object.entries(
  tabs,
)
  .map(
    ([id, label]) =>
      `<button data-tab="${id}" class="${id === tab ? "active" : ""}"><span>${icons[id]}</span>${label}</button>`,
  )
  .join(
    "",
  )}</nav><div id="controls"></div><div class="editor-foot"><span><i></i> Cada detalhe é seu.</span><span>SEM REGRAS. SÓ ESTILO.</span></div></aside></div><section class="collection-strip"><div class="mini-icon" id="mini-icon"></div><div class="collection-copy"><span class="eyebrow">DA SUA GARAGEM PARA O MUNDO</span><h3>Pequeno no tamanho. <br>Enorme na personalidade.</h3><p>Guarde sua criação ou leve seu novo ícone com você.</p></div><div class="export-actions"><button id="save" class="primary">＋ Salvar na garagem</button><div><button data-export="png">↓ PNG</button><button data-export="plate-svg">↓ Placa SVG</button><button data-export="icon">↓ Ícone</button></div><small>Carro PNG · Placa SVG vetorial · Ícone 256 px</small></div></section><footer><span>mini motor® <span class="muted">/ O SEU ESTÚDIO DE GARAGEM</span></span><span>Feito para quem nunca deixou de brincar. ↗</span></footer></main><div id="toast" role="status"></div><dialog id="garage-dialog"><div class="dialog-head"><div><span class="eyebrow">SUA COLEÇÃO PARTICULAR</span><h2>Minha garagem</h2></div><button id="close-garage" aria-label="Fechar garagem">✕</button></div><div id="garage-list"></div></dialog>`;
const choices = (key, items) =>
  `<div class="choices">${items.map(([value, label, art]) => `<button data-key="${key}" data-value="${value}" class="choice ${get(key) === value ? "selected" : ""}"><span class="choice-art">${art || label}</span><span>${label}</span>${get(key) === value ? "<i>✓</i>" : ""}</button>`).join("")}</div>`;
function get(key) {
  return key.startsWith("plate.") ? s.plate[key.slice(6)] : s[key];
}
function set(key, value) {
  if (key.startsWith("plate.")) s.plate[key.slice(6)] = value;
  else s[key] = value;
  s = normalizeConfiguration(s);
}
const range = (key, label, min, max, step = 1) =>
  `<label class="range-label">${label}<output>${get(key)}</output><input aria-label="${label}" type="range" data-input="${key}" min="${min}" max="${max}" step="${step}" value="${get(key)}"/></label>`;
const color = (key, label) =>
  `<label class="color-field"><span>${label}</span><span class="color-chip" style="background:${get(key)}"><input aria-label="${label}" type="color" data-input="${key}" value="${get(key)}"/></span><small>${get(key).toUpperCase()}</small></label>`;
const toggle = (key, label) =>
  `<label class="toggle">${label}<input type="checkbox" data-input="${key}" ${get(key) ? "checked" : ""}/><span></span></label>`;
const thumbnails = new Map();
let studio;
try {
  studio = new VehicleStudio(document.querySelector("#car-preview"));
} catch (error) {
  document.querySelector("#car-preview").innerHTML =
    '<p class="render-error">Seu navegador precisa de WebGL 2 para abrir o estúdio 3D. Ative a aceleração gráfica ou use um navegador compatível.</p>';
  console.error(error);
}
function tinyBody(id) {
  return thumbnails.has(id)
    ? `<img src="${thumbnails.get(id)}" alt="Miniatura 3D ${bodies[id].name}"/>`
    : '<span class="thumbnail-loading" aria-label="Preparando miniatura">···</span>';
}
let renderRevision = 0;
function updateMiniature() {
  if (!studio?.engine.model) return;
  const source = studio.canvas,
    canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const side = Math.max(source.height, source.width * 0.72);
  canvas
    .getContext("2d")
    .drawImage(
      source,
      (source.width - side) / 2,
      (source.height - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
  document.querySelector("#mini-icon").innerHTML =
    `<img src="${canvas.toDataURL()}" alt="Ícone da sua miniatura"/>`;
}
function controls() {
  let html = "";
  if (tab === "body")
    html = `<div class="section-label"><h3>Escolha sua carroceria</h3><span>${String(Object.keys(bodies).indexOf(s.body) + 1).padStart(2, "0")} / ${String(Object.keys(bodies).length).padStart(2, "0")}</span></div><p class="helper">Toda grande ideia começa com uma boa silhueta.</p><div class="family-tabs" aria-label="Famílias de carroceria">${Object.entries(
      families,
    )
      .map(
        ([id, label]) =>
          `<button data-family="${id}" aria-pressed="${family === id}">${label}</button>`,
      )
      .join("")}</div><div class="body-grid catalog-grid">${Object.entries(
      bodies,
    )
      .filter(([id, b]) => family === "all" || b.family === family)
      .map(
        ([id, b]) =>
          `<button data-key="body" data-value="${id}" class="body-card ${s.body === id ? "selected" : ""}"><span class="body-art">${tinyBody(id)}</span><b>${b.name}</b><small>${b.tag}</small>${s.body === id ? "<i>✓</i>" : ""}</button>`,
      )
      .join(
        "",
      )}</div>${vehicleControls()}${roofControls()}<div class="note"><span>↗</span><p>Cada carroceria tem suas próprias proporções.<br>As suas peças encontram o lugar certo.</p></div><div class="section-label"><h3>Uma cor para começar</h3><button class="text-button" data-goto="paint">Explorar pintura ↗</button></div>${palette()}<div class="tip"><span>✦</span> A placa conta a história. O carro dá o tom.</div>`;
  if (tab === "paint")
    html = `<h3>A cor da sua personalidade</h3><p class="helper">O clássico ou o inesperado? Você decide.</p>${palette()}${color("color", "Cor principal")}${color("secondary", "Cor secundária")}<h3 class="spaced">Acabamento</h3>${choices(
      "finish",
      [
        ["gloss", "Brilhante", "✧"],
        ["matte", "Fosco", "●"],
        ...(models[s.body].finishes?.includes("steel")
          ? [["steel", "Aço", "▨"]]
          : []),
      ],
    )}<div class="note"><span>◒</span><p>A luz e as sombras mantêm a profundidade em qualquer cor.</p></div>`;
  if (tab === "parts")
    html = `<h3>Para-choques</h3>${choices("bumper", [
      ["chrome", "Cromado", "━━━━"],
      ["painted", "Colorido", "▰"],
      ["sport", "Esportivo", "▱▱"],
    ])}<h3 class="spaced">Lanternas</h3>${choices(
      "lights",
      [
        ["round", "Retrô", "● ●"],
        ["rect", "Clássicas", "▰ ▰"],
        ["bar", "Horizontais", "━━"],
        ["vertical", "Verticais", "▮ ▮"],
      ].filter(
        ([id]) => !models[s.body].lights || models[s.body].lights.includes(id),
      ),
    )}${
      models[s.body].spoiler === false
        ? ""
        : `<h3 class="spaced">Aerofólio</h3>${choices("spoiler", [
            ["none", "Sem", "—"],
            ["lip", "Discreto", "▁"],
            ["sport", "Esportivo", "┯━┯"],
            ["wild", "Exagerado", "┳━┳"],
          ])}`
    }<h3 class="spaced">Escapamento</h3>${choices("exhaust", [
      ["single", "Simples", "◉"],
      ["dual", "Duplo", "◉　◉"],
      ["center", "Central", "⊙"],
      ["quad", "Quádruplo", "◉◉ ◉◉"],
    ])}<h3 class="spaced">Rodas</h3>${choices("wheels", [
      ["classic", "Clássicas", "❂"],
      ["sport", "Esportivas", "✺"],
      ["dark", "Grafite", "◉"],
    ])}<h3 class="spaced">${models[s.body].procedural ? "Vidros" : "Vidro traseiro"}</h3>${choices(
      "glass",
      [
        ["smoke", "Fumê", "◩"],
        ["blue", "Azulado", "◩"],
        ["amber", "Âmbar", "◩"],
      ],
    )}${!models[s.body].procedural || s.roof === "closed" ? range("window", "Área do vidro", 45, 100) : ""}`;
  if (tab === "details")
    html = `<h3>Os detalhes fazem o ícone.</h3><p class="helper">Só mais um toque para ficar com a sua cara.</p>${toggle("stripes", "Faixas de corrida")}${toggle("trim", "Friso cromado lateral")}${toggle("sticker", "Adesivo de estrela")}<div class="note"><span>★</span><p>As faixas usam a cor secundária.<br>Experimente outras combinações na pintura.</p></div>`;
  if (tab === "plate")
    html = `<div class="section-label"><h3>A protagonista.</h3><span>SUA PLACA, SUAS REGRAS.</span></div><div id="plate-preview" class="plate-preview">${plate(s.plate)}</div><label class="input-label">O que a sua placa diz?<textarea aria-label="Texto da placa" data-input="plate.text" rows="2" spellcheck="false">${esc(s.plate.text)}</textarea></label><div class="preset-row">${[
      ["california", "California"],
      ["mercosul", "Mercosul"],
      ["brasil", "Brasil retrô"],
      ["europe", "Europa"],
      ["cinema", "Cinema"],
      ["custom", "Livre"],
    ]
      .map(
        ([id, l]) =>
          `<button data-preset="${id}" class="${s.plate.style === id ? "selected" : ""}">${l}</button>`,
      )
      .join(
        "",
      )}</div><details open><summary>Tipografia & composição</summary>${choices(
      "plate.font",
      [
        ["Bebas Neue", "Condensada", "ABC"],
        ["Barlow Condensed", "Estrada", "ABC"],
        ["Anton", "Impacto", "ABC"],
      ],
    )}${toggle("plate.auto", "Ajustar texto automaticamente")}${range("plate.size", "Tamanho da fonte", 8, 100)}${range("plate.spacing", "Espaçamento", -3, 15, 0.5)}${s.plate.font === "Barlow Condensed" ? range("plate.weight", "Espessura", 400, 900, 100) : '<p class="helper">Peso original da fonte. Para variar a espessura, escolha Estrada.</p>'}<label class="input-label">Alinhamento horizontal<select aria-label="Alinhamento horizontal" data-input="plate.align"><option value="left" ${s.plate.align === "left" ? "selected" : ""}>À esquerda</option><option value="center" ${s.plate.align === "center" ? "selected" : ""}>Centralizado</option><option value="right" ${s.plate.align === "right" ? "selected" : ""}>À direita</option></select></label><label class="input-label">Alinhamento vertical<select aria-label="Alinhamento vertical" data-input="plate.vertical">${[
      ["top", "Topo"],
      ["center", "Centro"],
      ["bottom", "Base"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${s.plate.vertical === v ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select></label>${color("plate.ink", "Cor do texto")}</details><details><summary>Formato & aparência</summary>${range("plate.width", "Largura", 95, 280)}${range("plate.height", "Altura", 45, 130)}${color("plate.bg", "Fundo da placa")}${color("plate.border", "Cor da borda")}${range("plate.borderWidth", "Espessura da borda", 0, 6, 0.5)}${toggle("plate.frame", "Moldura externa")}${choices(
      "plate.band",
      [
        ["none", "Sem faixa", "▭"],
        ["top", "Superior", "▔"],
        ["side", "Lateral", "▏"],
      ],
    )}<p class="helper">As dimensões são proporcionais. Placas maiores são acomodadas no suporte sem distorcer o texto.</p></details>`;
  document.querySelector("#controls").innerHTML = html;
}
function vehicleControls() {
  const a = models[s.body];
  let html = "";
  if (a.rack || a.spare || a.bedCover)
    html += '<h3 class="spaced">Pronto para a próxima história</h3>';
  if (a.rack) html += toggle("rack", "Bagageiro no teto");
  if (a.spare) html += toggle("spare", "Estepe externo");
  if (a.bedCover)
    html += choices("bedCover", [
      ["open", "Aberta", "⊔"],
      ["flat", "Lona", "▔"],
      ["canopy", "Capota", "⌒"],
    ]);
  if (a.roofColor) html += color("secondary", "Cor do teto e faixa");
  return html;
}
function roofControls() {
  if (!models[s.body].roofs) return "";
  return `<h3 class="spaced">Capota</h3>${choices("roof", [
    ["open", "Aberta", "☀"],
    ["closed", "Fechada", "⌒"],
  ])}<p class="helper">Habitáculo de dois lugares, com bancos, painel e volante em 3D.</p>${color("interior", "Cor do interior")}`;
}
function palette() {
  return `<div class="palette">${colors.map((c, i) => `<button aria-label="Cor ${["vermelho cinema", "coral", "mostarda", "sálvia", "azul", "lavanda", "creme", "grafite", "rosa"][i]}" title="${c}" style="--swatch:${c}" data-key="color" data-value="${c}" class="${s.color === c ? "picked" : ""}">${s.color === c ? "✓" : ""}</button>`).join("")}</div>`;
}
function render(animate = false) {
  const revision = ++renderRevision;
  const snapshot = clone(s);
  studio
    ?.update(snapshot)
    .then((accepted) => {
      if (accepted && revision === renderRevision) {
        document.querySelector("#car-preview .render-error")?.remove();
        updateMiniature();
        const preview = document.querySelector("#plate-preview");
        if (preview) preview.innerHTML = plate(snapshot.plate);
      }
      if (
        accepted &&
        animate &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        studio.canvas.animate([{ opacity: 0.65 }, { opacity: 1 }], {
          duration: 140,
        });
    })
    .catch((error) => {
      console.error(error);
      if (revision !== renderRevision) return;
      const host = document.querySelector("#car-preview");
      host.dataset.ready = "false";
      let notice = host.querySelector(".render-error");
      if (!notice) {
        notice = document.createElement("p");
        notice.className = "render-error";
        notice.setAttribute("role", "alert");
        host.append(notice);
      }
      notice.textContent =
        "N\u00e3o foi poss\u00edvel carregar este ve\u00edculo. Escolha outra carroceria ou tente novamente.";
      toast(notice.textContent);
    });
  document.querySelector("#model-name").textContent =
    `${s.body === "wagon" ? "A sua" : "O seu"} ${bodies[s.body].name.toLowerCase()}.`;
  document.querySelector("#model-code").textContent =
    `MM—0${Object.keys(bodies).indexOf(s.body) + 1}`;
  document.querySelector("#color-dot").style.background = s.color;
  document.querySelector("#color-name").textContent =
    {
      "#ba252b": "Vermelho de cinema",
      "#df593e": "Coral de garagem",
      "#f1b849": "Mostarda solar",
      "#87a996": "Verde sálvia",
      "#6389b5": "Azul passeio",
      "#b09ac5": "Lavanda elétrica",
      "#f4e8cf": "Creme vintage",
      "#353e47": "Grafite noturno",
      "#d98f9b": "Rosa antigo",
    }[s.color] || s.color.toUpperCase();
  document.querySelector("#finish-name").textContent =
    `Acabamento ${s.finish === "steel" ? "aço escovado" : s.finish === "gloss" ? "brilhante" : "fosco"}`;
  let p = document.querySelector("#plate-preview");
  if (p) p.innerHTML = plate(s.plate);
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => el.classList.remove("show"), 3000);
}
function switchTab(id) {
  tab = id;
  document
    .querySelectorAll("[data-tab]")
    .forEach((el) => el.classList.toggle("active", el.dataset.tab === tab));
  controls();
}
app.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.view) {
    studio?.setView(t.dataset.view);
    document
      .querySelectorAll("[data-view]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
    updateMiniature();
  }
  if (t.dataset.family) {
    family = t.dataset.family;
    controls();
  }
  if (t.dataset.tab) switchTab(t.dataset.tab);
  if (t.dataset.goto) switchTab(t.dataset.goto);
  if (t.dataset.key) {
    set(t.dataset.key, t.dataset.value);
    render(true);
    controls();
  }
  if (t.dataset.preset) {
    const presets = {
      california: {
        width: 164,
        height: 72,
        bg: "#fff5d8",
        ink: "#29374b",
        band: "top",
      },
      mercosul: {
        width: 180,
        height: 60,
        bg: "#fafaf5",
        ink: "#171e24",
        band: "top",
      },
      brasil: {
        width: 165,
        height: 64,
        bg: "#c9c9ba",
        ink: "#202827",
        band: "none",
      },
      europe: {
        width: 230,
        height: 55,
        bg: "#f5f2de",
        ink: "#172025",
        band: "side",
      },
      cinema: {
        width: 170,
        height: 75,
        bg: "#edb74c",
        ink: "#222d38",
        band: "top",
      },
      custom: {
        width: 164,
        height: 80,
        bg: "#f0ddf7",
        ink: "#4c305d",
        band: "none",
      },
    };
    Object.assign(s.plate, presets[t.dataset.preset], {
      style: t.dataset.preset,
    });
    render();
    controls();
  }
  if (t.id === "random") {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    s.body = pick(Object.keys(bodies));
    s = normalizeConfiguration(s);
    s.color = pick(colors);
    s.secondary = pick(colors);
    s.bumper = pick(["chrome", "painted", "sport"]);
    s.lights = pick(["round", "rect", "bar", "vertical"]);
    s.spoiler = pick(["none", "lip", "sport", "wild"]);
    s.wheels = pick(["classic", "sport", "dark"]);
    s.exhaust = pick(["single", "dual", "center", "quad"]);
    s.stripes = Math.random() > 0.5;
    s.sticker = Math.random() > 0.6;
    s.plate.text = pick([
      "OUTATIME",
      "ECTO-1",
      "NRVOUS",
      "JUST GO",
      "MINI 01",
      "WILD ONE",
    ]);
    s = normalizeConfiguration(s);
    family = "all";
    render();
    controls();
    toast("Uma nova personalidade na garagem.");
  }
  if (t.id === "reset") {
    s = clone(initial);
    family = "all";
    render();
    controls();
    toast("De volta ao original.");
  }
  if (t.id === "save") {
    saved.unshift({
      id: Date.now(),
      name: `${bodies[s.body].name} · ${s.plate.text}`,
      config: clone(s),
    });
    try {
      localStorage.setItem("mini-motor-garage", JSON.stringify(saved));
      document.querySelector("#saved-count").textContent = saved.length;
      toast("Miniatura salva na sua garagem!");
    } catch {
      saved.shift();
      toast("Não foi possível salvar: armazenamento indisponível.");
    }
  }
  if (t.id === "garage") openGarage();
  if (t.id === "close-garage") document.querySelector("#garage-dialog").close();
  if (t.dataset.restore) {
    s = normalizeConfiguration(
      saved.find((x) => x.id === Number(t.dataset.restore)).config,
    );
    family = "all";
    render();
    controls();
    document.querySelector("#garage-dialog").close();
    toast("Sua miniatura está de volta ao estúdio.");
  }
  if (t.dataset.delete) {
    saved = saved.filter((x) => x.id !== Number(t.dataset.delete));
    localStorage.setItem("mini-motor-garage", JSON.stringify(saved));
    document.querySelector("#saved-count").textContent = saved.length;
    openGarage();
  }
  if (t.dataset.export)
    exportCar(s, t.dataset.export, toast, studio?.engine.view).catch((err) => {
      console.error(err);
      toast("Não foi possível exportar. Tente novamente.");
    });
});
app.addEventListener("input", (e) => {
  const el = e.target,
    key = el.dataset.input;
  if (!key) return;
  set(
    key,
    el.type === "checkbox"
      ? el.checked
      : ["range", "number"].includes(el.type)
        ? Number(el.value)
        : el.value,
  );
  if (el.type === "range") el.previousElementSibling.textContent = el.value;
  render();
});
function openGarage() {
  document.querySelector("#garage-list").innerHTML = saved.length
    ? saved
        .map(
          (x) =>
            `<article class="saved-car"><div data-garage-preview="${x.id}"></div><h3>${esc(x.name)}</h3><button class="primary" data-restore="${x.id}">Abrir no estúdio ↗</button><button class="quiet" data-delete="${x.id}">Excluir</button></article>`,
        )
        .join("")
    : '<div class="empty-garage">▱<h3>Sua coleção começa aqui.</h3><p>Salve uma miniatura para encontrá-la de novo.</p></div>';
  for (const item of saved) {
    const el = document.querySelector(`[data-garage-preview="${item.id}"]`);
    captureVehicle(item.config, { width: 400, height: 270 })
      .then((url) => {
        if (el?.isConnected)
          el.innerHTML = `<img src="${url}" alt="${esc(item.name)}"/>`;
      })
      .catch(console.error);
  }
  let d = document.querySelector("#garage-dialog");
  if (!d.open) d.showModal();
}
controls();
render();
document.fonts.ready
  .then(async () => {
    if (!studio) return;
    render();
    for (const id of Object.keys(bodies)) {
      try {
        thumbnails.set(
          id,
          await captureVehicle(
            { ...clone(initial), body: id, color: "#8b9d90" },
            { width: 220, height: 140 },
          ),
        );
      } catch (error) {
        console.error(`Miniatura ${id} indisponível`, error);
        toast("Uma miniatura não carregou. Você pode continuar no estúdio.");
      }
    }
    if (tab === "body") controls();
  })
  .catch((error) => {
    console.error(error);
    toast("Não foi possível preparar as miniaturas.");
  });
window.addEventListener("pagehide", () => studio?.dispose());
