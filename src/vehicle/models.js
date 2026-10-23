// Model-local coordinates: +Z is the nose, -Z the rear, Y is up.
export const models = {
  roadster: {
    width: 1.3,
    rear: -1.48,
    front: 1.49,
    deck: 0.77,
    plateY: 0.565,
    lightY: 0.68,
    bumperY: 0.32,
    spoilerZ: -1.1,
    spoilerY: 0.785,
    roof: 1.16,
    glassNormal: [0, 0.5, -0.86],
    glassCenter: [0, 0.98, -0.48],
    roofs: ["open", "closed"],
    procedural: true,
  },
  convertible: {
    width: 1.38,
    rear: -1.29,
    front: 1.24,
    deck: 0.8,
    plateY: 0.59,
    lightY: 0.71,
    bumperY: 0.34,
    spoilerZ: -1.03,
    spoilerY: 0.785,
    roof: 1.25,
    glassNormal: [0, 0.5, -0.86],
    glassCenter: [0, 1.04, -0.43],
    roofs: ["open", "closed"],
    procedural: true,
  },
  sedan: {
    width: 1.3,
    rear: -1.25,
    front: 1.15,
    deck: 0.8,
    plateY: 0.59,
    lightY: 0.68,
    bumperY: 0.335,
    spoilerZ: -1.04,
    roof: 1.3,
    glassNormal: [0, 0.55, -0.83],
    glassCenter: [0, 1.05, -0.65],
  },
  hatch: {
    width: 1.3,
    rear: -1.118,
    front: 1.12,
    deck: 0.864,
    plateY: 0.6,
    lightY: 0.73,
    bumperY: 0.335,
    spoilerZ: -1.03,
    roof: 1.215,
    glassNormal: [0, 0.46, -0.89],
    glassCenter: [0, 1.025, -0.97],
  },
  coupe: {
    width: 1.326,
    rear: -1.325,
    front: 1.219,
    deck: 0.744,
    plateY: 0.565,
    lightY: 0.67,
    bumperY: 0.325,
    spoilerZ: -1.1,
    roof: 1.023,
    glassNormal: [0, 0.62, -0.78],
    glassCenter: [0, 0.9, -0.77],
  },
  muscle: {
    width: 1.547,
    rear: -1.4375,
    front: 1.323,
    deck: 0.832,
    plateY: 0.6,
    lightY: 0.73,
    bumperY: 0.35,
    spoilerZ: -1.25,
    roof: 1.18,
    glassNormal: [0, 0.5, -0.87],
    glassCenter: [0, 0.99, -0.78],
  },
  wagon: {
    width: 1.274,
    rear: -1.498,
    front: 1.39,
    deck: 0.72,
    plateY: 0.57,
    lightY: 0.7,
    bumperY: 0.315,
    spoilerZ: -1.43,
    roof: 1.195,
    glassNormal: [0, 0.19, -0.98],
    glassCenter: [0, 0.99, -1.35],
  },
};
const loaded = new Map();
export async function modelData(id) {
  if (!loaded.has(id))
    loaded.set(
      id,
      fetch(`${import.meta.env.BASE_URL}models/${id}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`Modelo ${id} indisponível`);
          return r.json();
        })
        .catch((e) => {
          loaded.delete(id);
          throw e;
        }),
    );
  return loaded.get(id);
}
