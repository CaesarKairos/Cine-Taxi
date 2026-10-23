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
import { initial, bodies, colors, clone } from "./state.js";
import { car } from "./car.js";
import { exportCar } from "./export.js";
import { plate, esc } from "./plate.js";
let s = clone(initial),
  tab = "body",
  saved = [];
try {
  saved = JSON.parse(localStorage.getItem("mini-motor-garage") || "[]");
  if (!Array.isArray(saved)) saved = [];
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
app.innerHTML = `<header><a class="brand" href="./" aria-label="Mini Motor início"><span class="brand-mark">m<span>m</span></span>mini motor<span class="brand-dot">®</span></a><div class="header-center">PEQUENOS CARROS. GRANDES PERSONALIDADES.</div><button class="garage-button" id="garage">▱ <span>Minha garagem</span><b id="saved-count">${saved.length}</b></button></header><main><div class="page-intro"><div><div class="eyebrow"><i></i> ESTÚDIO DE CUSTOMIZAÇÃO</div><h1>Seu próximo <em>pequeno</em> ícone.</h1><p>Uma carroceria. Infinitas histórias. Faça do seu jeito.</p></div><div class="edition">FEITO PARA INVENTAR<br><strong>VOL. 001 / ORIGINALS</strong></div></div><div class="studio"><section class="stage" aria-label="Preview do carro"><div class="stage-top"><span class="pill"><i></i> AO VIVO NA SUA GARAGEM</span><button id="reset" class="quiet">↺ <span>Recomeçar</span></button></div><div class="stage-watermark">ORIGINALS</div><div id="car-preview"></div><div class="stage-caption"><span id="model-code">MM—03</span><div><h2 id="model-name">O seu cupê.</h2><span>1:24 DE PURA PERSONALIDADE</span></div><span class="rear-label">↗ VISTA TRASEIRA ¾</span></div><div class="stage-bottom"><div class="color-info"><span id="color-dot"></span><div><b id="color-name">Coral de garagem</b><small id="finish-name">Acabamento brilhante</small></div></div><button id="random" class="random">⚄ Surpreenda-me</button></div><span class="stage-corner">DESIGNED BY YOU, BUILT FOR FUN.</span></section><aside class="editor"><div class="editor-heading"><div><span class="eyebrow">A SUA ASSINATURA</span><h2>Hora de dar personalidade.</h2></div><span class="editor-star">✳</span></div><nav id="tabs" aria-label="Categorias">${Object.entries(
  tabs,
)
  .map(
    ([id, label]) =>
      `<button data-tab="${id}" class="${id === tab ? "active" : ""}"><span>${icons[id]}</span>${label}</button>`,
  )
  .join(
    "",
  )}</nav><div id="controls"></div><div class="editor-foot"><span><i></i> Cada detalhe é seu.</span><span>SEM REGRAS. SÓ ESTILO.</span></div></aside></div><section class="collection-strip"><div class="mini-icon" id="mini-icon"></div><div class="collection-copy"><span class="eyebrow">DA SUA GARAGEM PARA O MUNDO</span><h3>Pequeno no tamanho. <br>Enorme na personalidade.</h3><p>Guarde sua criação ou leve seu novo ícone com você.</p></div><div class="export-actions"><button id="save" class="primary">＋ Salvar na garagem</button><div><button data-export="png">↓ PNG</button><button data-export="svg">↓ SVG</button><button data-export="icon">↓ Ícone</button></div><small>PNG transparente · SVG vetorial · Ícone 256 px</small></div></section><footer><span>mini motor® <span class="muted">/ O SEU ESTÚDIO DE GARAGEM</span></span><span>Feito para quem nunca deixou de brincar. ↗</span></footer></main><div id="toast" role="status"></div><dialog id="garage-dialog"><div class="dialog-head"><div><span class="eyebrow">SUA COLEÇÃO PARTICULAR</span><h2>Minha garagem</h2></div><button id="close-garage" aria-label="Fechar garagem">✕</button></div><div id="garage-list"></div></dialog>`;
const choices = (key, items) =>
  `<div class="choices">${items.map(([value, label, art]) => `<button data-key="${key}" data-value="${value}" class="choice ${get(key) === value ? "selected" : ""}"><span class="choice-art">${art || label}</span><span>${label}</span>${get(key) === value ? "<i>✓</i>" : ""}</button>`).join("")}</div>`;
function get(key) {
  return key.startsWith("plate.") ? s.plate[key.slice(6)] : s[key];
}
function set(key, value) {
  if (key.startsWith("plate.")) s.plate[key.slice(6)] = value;
  else s[key] = value;
}
const range = (key, label, min, max, step = 1) =>
  `<label class="range-label">${label}<output>${get(key)}</output><input aria-label="${label}" type="range" data-input="${key}" min="${min}" max="${max}" step="${step}" value="${get(key)}"/></label>`;
const color = (key, label) =>
  `<label class="color-field"><span>${label}</span><span class="color-chip" style="background:${get(key)}"><input aria-label="${label}" type="color" data-input="${key}" value="${get(key)}"/></span><small>${get(key).toUpperCase()}</small></label>`;
const toggle = (key, label) =>
  `<label class="toggle">${label}<input type="checkbox" data-input="${key}" ${get(key) ? "checked" : ""}/><span></span></label>`;
function tinyBody(id) {
  let b = bodies[id];
  return `<svg viewBox="0 0 100 58"><path d="M12 35L26 ${id === "hatch" || id === "wagon" ? 12 : 22}L65 ${id === "coupe" ? 17 : 13}L82 31L88 35V46H10V35Z" fill="currentColor"/><path d="M30 24L35 18H60L70 28Z" fill="#f7f3e9" opacity=".65"/><circle cx="27" cy="46" r="8" fill="#343d40"/><circle cx="73" cy="46" r="8" fill="#343d40"/><circle cx="27" cy="46" r="3" fill="#e6ddca"/><circle cx="73" cy="46" r="3" fill="#e6ddca"/><path d="M12 35h9" stroke="#ffe4b7" stroke-width="4"/></svg>`;
}
function controls() {
  let html = "";
  if (tab === "body")
    html = `<div class="section-label"><h3>Escolha sua carroceria</h3><span>01 / 05</span></div><p class="helper">Toda grande ideia começa com uma boa silhueta.</p><div class="body-grid">${Object.entries(
      bodies,
    )
      .map(
        ([id, b]) =>
          `<button data-key="body" data-value="${id}" class="body-card ${s.body === id ? "selected" : ""}"><span class="body-art">${tinyBody(id)}</span><b>${b.name}</b><small>${b.tag}</small>${s.body === id ? "<i>✓</i>" : ""}</button>`,
      )
      .join(
        "",
      )}</div><div class="note"><span>↗</span><p>Cada carroceria tem suas próprias proporções.<br>As suas peças encontram o lugar certo.</p></div><div class="section-label"><h3>Uma cor para começar</h3><button class="text-button" data-goto="paint">Explorar pintura ↗</button></div>${palette()}<div class="tip"><span>✦</span> A placa conta a história. O carro dá o tom.</div>`;
  if (tab === "paint")
    html = `<h3>A cor da sua personalidade</h3><p class="helper">O clássico ou o inesperado? Você decide.</p>${palette()}${color("color", "Cor principal")}${color("secondary", "Cor secundária")}<h3 class="spaced">Acabamento</h3>${choices(
      "finish",
      [
        ["gloss", "Brilhante", "✧"],
        ["matte", "Fosco", "●"],
      ],
    )}<div class="note"><span>◒</span><p>A luz e as sombras mantêm a profundidade em qualquer cor.</p></div>`;
  if (tab === "parts")
    html = `<h3>Para-choques</h3>${choices("bumper", [
      ["chrome", "Cromado", "━━━━"],
      ["painted", "Colorido", "▰"],
      ["sport", "Esportivo", "▱▱"],
    ])}<h3 class="spaced">Lanternas</h3>${choices("lights", [
      ["round", "Retrô", "● ●"],
      ["rect", "Clássicas", "▰ ▰"],
      ["bar", "Horizontais", "━━"],
      ["vertical", "Verticais", "▮ ▮"],
    ])}<h3 class="spaced">Aerofólio</h3>${choices("spoiler", [
      ["none", "Sem", "—"],
      ["lip", "Discreto", "▁"],
      ["sport", "Esportivo", "┯━┯"],
      ["wild", "Exagerado", "┳━┳"],
    ])}<h3 class="spaced">Escapamento</h3>${choices("exhaust", [
      ["single", "Simples", "◉"],
      ["dual", "Duplo", "◉　◉"],
      ["center", "Central", "⊙"],
      ["quad", "Quádruplo", "◉◉ ◉◉"],
    ])}<h3 class="spaced">Rodas</h3>${choices("wheels", [
      ["classic", "Clássicas", "❂"],
      ["sport", "Esportivas", "✺"],
      ["dark", "Grafite", "◉"],
    ])}<h3 class="spaced">Vidro traseiro</h3>${choices("glass", [
      ["smoke", "Fumê", "◩"],
      ["blue", "Azulado", "◩"],
      ["amber", "Âmbar", "◩"],
    ])}${range("window", "Área do vidro", 45, 100)}`;
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
function palette() {
  return `<div class="palette">${colors.map((c, i) => `<button aria-label="Cor ${["coral", "mostarda", "sálvia", "azul", "lavanda", "creme", "grafite", "rosa"][i]}" title="${c}" style="--swatch:${c}" data-key="color" data-value="${c}" class="${s.color === c ? "picked" : ""}">${s.color === c ? "✓" : ""}</button>`).join("")}</div>`;
}
function render(animate = false) {
  document.querySelector("#car-preview").innerHTML = car(s);
  if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelector("#car-preview > svg").animate(
      [
        { opacity: 0.5, transform: "translateY(3px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "ease-out" },
    );
  }
  document.querySelector("#mini-icon").innerHTML = car(s, { shadow: false });
  document.querySelector("#model-name").textContent =
    `O seu ${bodies[s.body].name.toLowerCase()}.`;
  document.querySelector("#model-code").textContent =
    `MM—0${Object.keys(bodies).indexOf(s.body) + 1}`;
  document.querySelector("#color-dot").style.background = s.color;
  document.querySelector("#color-name").textContent =
    {
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
    `Acabamento ${s.finish === "gloss" ? "brilhante" : "fosco"}`;
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
    render();
    controls();
    toast("Uma nova personalidade na garagem.");
  }
  if (t.id === "reset") {
    s = clone(initial);
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
    s = clone(saved.find((x) => x.id === Number(t.dataset.restore)).config);
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
    exportCar(s, t.dataset.export, toast).catch((err) => {
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
            `<article class="saved-car"><div>${car(x.config, { shadow: false })}</div><h3>${esc(x.name)}</h3><button class="primary" data-restore="${x.id}">Abrir no estúdio ↗</button><button class="quiet" data-delete="${x.id}">Excluir</button></article>`,
        )
        .join("")
    : '<div class="empty-garage">▱<h3>Sua coleção começa aqui.</h3><p>Salve uma miniatura para encontrá-la de novo.</p></div>';
  let d = document.querySelector("#garage-dialog");
  if (!d.open) d.showModal();
}
controls();
render();
document.fonts.ready.then(render);
