import { models } from "./vehicle/models.js";
export const initial = {
  body: "roadster",
  roof: "open",
  interior: "#f0dbc2",
  color: "#ba252b",
  secondary: "#f5e4bd",
  finish: "gloss",
  bumper: "chrome",
  lights: "round",
  glass: "smoke",
  window: 85,
  spoiler: "none",
  exhaust: "dual",
  wheels: "classic",
  stripes: false,
  trim: true,
  sticker: false,
  rack: false,
  spare: false,
  bedCover: "open",
  plate: {
    text: "NRVOUS",
    style: "california",
    font: "Bebas Neue",
    size: 43,
    auto: true,
    weight: 400,
    spacing: 3,
    align: "center",
    vertical: "center",
    width: 164,
    height: 72,
    bg: "#fff5d8",
    ink: "#29374b",
    border: "#29374b",
    borderWidth: 2,
    frame: true,
    band: "top",
  },
};
export const families = {
  all: "Todos",
  classic: "Clássicos",
  sport: "Esportivos",
  utility: "Utilitários",
};
export const bodies = {
  sedan: { family: "classic", name: "Sedã", tag: "O clássico" },
  hatch: { family: "classic", name: "Hatch", tag: "Pequeno rebelde" },
  coupe: { family: "sport", name: "Cupê", tag: "Alma esportiva" },
  muscle: { family: "sport", name: "Muscle", tag: "Pura presença" },
  wagon: { family: "utility", name: "Perua", tag: "Mais histórias" },
  roadster: { family: "classic", name: "Roadster", tag: "California · 1961" },
  convertible: { family: "sport", name: "Conversível", tag: "Céu aberto" },
  van: { family: "utility", name: "Van retrô", tag: "Boas vibrações" },
  pickup: { family: "utility", name: "Picape", tag: "Estrada de terra" },
  offroad: { family: "utility", name: "Jipe", tag: "Fora do asfalto" },
  wedge: { family: "sport", name: "Futurista", tag: "Próxima dimensão" },
  retro: {
    family: "classic",
    name: "Compacto retrô",
    tag: "Pequeno companheiro",
  },
};
export function normalizeConfiguration(value = {}) {
  const config = {
    ...structuredClone(initial),
    ...value,
    plate: { ...initial.plate, ...value.plate },
  };
  if (!bodies[config.body]) config.body = initial.body;
  const roofs = models[config.body].roofs || ["fixed"];
  if (!roofs.includes(config.roof)) config.roof = roofs[0];
  const a = models[config.body];
  if (!a.rack) config.rack = false;
  if (!a.spare) config.spare = false;
  if (!a.bedCover?.includes(config.bedCover)) config.bedCover = "open";
  if (a.lights && !a.lights.includes(config.lights))
    config.lights = a.lights[0];
  if (a.spoiler === false) config.spoiler = "none";
  if (!(a.finishes || ["gloss", "matte"]).includes(config.finish))
    config.finish = "gloss";
  return config;
}
export const colors = [
  "#ba252b",
  "#df593e",
  "#f1b849",
  "#87a996",
  "#6389b5",
  "#b09ac5",
  "#f4e8cf",
  "#353e47",
  "#d98f9b",
];
export const clone = (x) => structuredClone(x);
