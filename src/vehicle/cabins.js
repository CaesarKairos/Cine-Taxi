import * as THREE from "three";
import { box, surface } from "./geometry.js";

function inset(points, u0, v0, u1, v1, offset) {
  const p = points.map((v) => new THREE.Vector3(...v));
  const at = (u, v) =>
    p[0]
      .clone()
      .lerp(p[1], u)
      .lerp(p[3].clone().lerp(p[2], u), v)
      .add(new THREE.Vector3(...offset))
      .toArray();
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
}
function cabin(group, s, m, p) {
  m.paint.side = THREE.DoubleSide;
  const { base, top, rear, front, roofRear, roofFront, half, roofHalf } = p;
  // A closed greenhouse, independent from the donor mesh, including four pillars.
  const back = [
    [-half, base, rear],
    [half, base, rear],
    [roofHalf, top, roofRear],
    [-roofHalf, top, roofRear],
  ];
  group.add(surface(back, m.paint, "tailgate-pillars"));
  const amount = 0.78 + Number(s.window) * 0.0022;
  const margin = (1 - amount) / 2 + 0.035;
  group.add(
    surface(
      inset(back, margin, 0.16, 1 - margin, 0.86, [0, 0.002, -0.004]),
      m.glass,
      "rear-window",
    ),
  );
  const windshield = [
    [-half, base, front],
    [-roofHalf, top, roofFront],
    [roofHalf, top, roofFront],
    [half, base, front],
  ];
  group.add(surface(windshield, m.paint, "windshield-pillars"));
  group.add(
    surface(
      inset(windshield, 0.13, 0.12, 0.88, 0.87, [0, 0, 0.004]),
      m.glass,
      "windshield",
    ),
  );
  for (const side of [-1, 1]) {
    const flank = [
      [side * half, base, rear],
      [side * half, base, front],
      [side * roofHalf, top, roofFront],
      [side * roofHalf, top, roofRear],
    ];
    group.add(surface(flank, m.paint, "side-pillars"));
    // Different door/cargo glazing layouts distinguish the compact from the estate.
    const bays =
      s.body === "wagon"
        ? [
            [0.065, 0.36],
            [0.39, 0.66],
            [0.69, 0.94],
          ]
        : [
            [0.09, 0.49],
            [0.53, 0.91],
          ];
    bays.forEach(([lo, hi]) =>
      group.add(
        surface(
          inset(flank, lo, 0.15, hi, 0.86, [side * 0.004, 0, 0]),
          m.glass,
          "side-window",
        ),
      ),
    );
  }
  group.add(
    box(
      [roofHalf * 2 + 0.03, 0.055, roofFront - roofRear + 0.07],
      [0, top + 0.008, (roofFront + roofRear) / 2],
      m.paint,
      0.027,
      "roof",
    ),
  );
  if (s.stripes)
    for (const x of [-0.105, 0.105])
      group.add(
        box(
          [0.085, 0.003, roofFront - roofRear + 0.01],
          [x, top + 0.037, (roofFront + roofRear) / 2],
          m.secondary,
          0.001,
        ),
      );
}

export function hatchCabin(group, s, m) {
  cabin(group, s, m, {
    base: 0.864,
    top: 1.18,
    rear: -1.105,
    front: 0.5,
    roofRear: -0.93,
    roofFront: 0.22,
    half: 0.55,
    roofHalf: 0.47,
  });
}
export function wagonCabin(group, s, m) {
  cabin(group, s, m, {
    base: 0.72,
    top: 1.16,
    rear: -1.48,
    front: 0.54,
    roofRear: -1.34,
    roofFront: 0.2,
    half: 0.54,
    roofHalf: 0.46,
  });
  group.add(
    box([1.08, 0.065, 0.7], [0, 0.718, 0.94], m.paint, 0.022, "estate-hood"),
  );
}
