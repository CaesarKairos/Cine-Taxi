export const initial = {
  body: "coupe",
  color: "#df593e",
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
};
export function normalizeConfiguration(value = {}) {
  const config = {
    ...structuredClone(initial),
    ...value,
    plate: { ...initial.plate, ...value.plate },
  };
  if (!bodies[config.body]) config.body = initial.body;
  return config;
}
export const colors = [
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
