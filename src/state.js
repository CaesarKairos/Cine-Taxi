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
export const bodies = {
  sedan: { name: "Sedã", tag: "O clássico" },
  hatch: { name: "Hatch", tag: "Pequeno rebelde" },
  coupe: { name: "Cupê", tag: "Alma esportiva" },
  muscle: { name: "Muscle", tag: "Pura presença" },
  wagon: { name: "Perua", tag: "Mais histórias" },
  roadster: { name: "Roadster", tag: "California · 1961" },
  convertible: { name: "Conversível", tag: "Céu aberto" },
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
