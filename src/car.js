import { openCoachwork, openModelData } from "./vehicle/convertibles.js";
import { normalizeConfiguration } from "./state.js";
import * as THREE from "three";
import { materials } from "./materials.js";
import { models, modelData } from "./vehicle/models.js";
import { mesh, box, surface } from "./vehicle/geometry.js";
import { wheels, rearParts, accessories } from "./vehicle/parts.js";
import { hatchCabin, wagonCabin } from "./vehicle/cabins.js";

function semanticGeometry(positions) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}
function normalOf(triangle) {
  return new THREE.Vector3()
    .subVectors(triangle[1], triangle[0])
    .cross(new THREE.Vector3().subVectors(triangle[2], triangle[0]))
    .normalize();
}
function clipX(poly, bound, keepGreater) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i],
      q = poly[(i + 1) % poly.length],
      pin = keepGreater ? p.x >= bound : p.x <= bound,
      qin = keepGreater ? q.x >= bound : q.x <= bound;
    if (pin) out.push(p);
    if (pin !== qin) out.push(p.clone().lerp(q, (bound - p.x) / (q.x - p.x)));
  }
  return out;
}
function stripes(group, positions, material) {
  const vertices = [];
  for (let i = 0; i < positions.length; i += 9) {
    const tri = [0, 3, 6].map(
      (k) => new THREE.Vector3(...positions.slice(i + k, i + k + 3)),
    );
    const n = normalOf(tri);
    if (Math.abs(n.y) < 0.35 || tri.every((p) => p.y < 0.7)) continue;
    if (n.y < 0) n.negate();
    for (const [lo, hi] of [
      [-0.15, -0.065],
      [0.065, 0.15],
    ]) {
      const clipped = clipX(clipX(tri, lo, true), hi, false);
      for (let j = 1; j < clipped.length - 1; j++)
        for (const p of [clipped[0], clipped[j], clipped[j + 1]])
          vertices.push(...p.clone().addScaledVector(n, 0.003).toArray());
    }
  }
  if (vertices.length) {
    material.side = THREE.DoubleSide;
    group.add(mesh(semanticGeometry(vertices), material, "racing-stripes"));
  }
}
function glass(group, positions, s, m) {
  const rear = [],
    others = [];
  for (let i = 0; i < positions.length; i += 9) {
    const tri = [0, 3, 6].map(
      (k) => new THREE.Vector3(...positions.slice(i + k, i + k + 3)),
    );
    const n = normalOf(tri);
    (n.z < -0.2 ? rear : others).push(...positions.slice(i, i + 9));
  }
  if (others.length)
    group.add(mesh(semanticGeometry(others), m.glass, "windows"));
  if (rear.length) {
    const base = mesh(semanticGeometry(rear), m.paint, "rear-window-surround");
    group.add(base);
    const center = new THREE.Vector3();
    for (let i = 0; i < rear.length; i += 3)
      center.add(new THREE.Vector3(...rear.slice(i, i + 3)));
    center.multiplyScalar(3 / rear.length);
    const scale = 0.75 + Number(s.window) * 0.0025;
    const small = [];
    for (let i = 0; i < rear.length; i += 3) {
      const p = new THREE.Vector3(...rear.slice(i, i + 3));
      p.sub(center).multiplyScalar(scale).add(center);
      p.z -= 0.002;
      small.push(...p.toArray());
    }
    group.add(mesh(semanticGeometry(small), m.glass, "rear-window"));
  }
}
// Muscle has its own broad cabin, sail panels and raised trunk, authored on the
// donor chassis. This replaces the sports sedan's greenhouse rather than scaling it.
function muscleCabin(group, a, s, m) {
  m.paint.side = THREE.DoubleSide;
  const baseY = 0.81,
    topY = 1.14;
  group.add(
    box([1.05, 0.065, 0.82], [0, 1.155, -0.13], m.paint, 0.035, "muscle-roof"),
  );
  for (const side of [-1, 1]) {
    const body = surface(
      [
        [side * 0.62, baseY, -0.89],
        [side * 0.62, baseY, 0.57],
        [side * 0.51, topY, 0.27],
        [side * 0.51, topY, -0.54],
      ],
      m.paint,
      "muscle-sail-panel",
    );
    group.add(body);
    group.add(
      surface(
        [
          [side * 0.605, 0.86, -0.68],
          [side * 0.605, 0.86, 0.47],
          [side * 0.527, 1.1, 0.23],
          [side * 0.527, 1.1, -0.47],
        ],
        m.glass,
        "muscle-side-window",
      ),
    );
    const pillar = box(
      [0.028, 0.27, 0.036],
      [side * 0.56, 0.98, 0.01],
      m.paint,
      0.005,
    );
    pillar.rotation.z = side * 0.32;
    group.add(pillar);
  }
  group.add(
    surface(
      [
        [-0.62, baseY, -0.89],
        [0.62, baseY, -0.89],
        [0.51, topY, -0.54],
        [-0.51, topY, -0.54],
      ],
      m.paint,
      "muscle-rear-pillars",
    ),
  );
  const rw = 0.46 * (0.75 + Number(s.window) * 0.0025);
  group.add(
    surface(
      [
        [-rw, 0.856, -0.849],
        [rw, 0.856, -0.849],
        [rw * 0.9, 1.101, -0.585],
        [-rw * 0.9, 1.101, -0.585],
      ],
      m.glass,
      "rear-window",
    ),
  );
  group.add(
    surface(
      [
        [-0.62, baseY, 0.57],
        [-0.51, topY, 0.27],
        [0.51, topY, 0.27],
        [0.62, baseY, 0.57],
      ],
      m.paint,
    ),
  );
  group.add(
    surface(
      [
        [-0.53, 0.861, 0.528],
        [-0.46, 1.1, 0.309],
        [0.46, 1.1, 0.309],
        [0.53, 0.861, 0.528],
      ],
      m.glass,
    ),
  );
  group.add(
    box([1.4, 0.052, 0.49], [0, 0.818, -1.16], m.paint, 0.025, "muscle-trunk"),
  );
  if (s.stripes)
    for (const x of [-0.105, 0.105])
      group.add(
        box([0.085, 0.003, 0.73], [x, 1.189, -0.13], m.secondary, 0.001),
      );
}
export async function buildVehicle(configuration) {
  const s = normalizeConfiguration(configuration),
    a = models[s.body] || models.coupe;
  await document.fonts.load(
    `${s.plate.font === "Barlow Condensed" ? s.plate.weight : 400} ${s.plate.size}px "${s.plate.font}"`,
  );
  const data = a.procedural ? openModelData(s.body) : await modelData(s.body);
  const m = materials(s),
    group = new THREE.Group();
  group.name = `vehicle-${s.body}`;
  for (const [kind, source] of Object.entries(data.parts)) {
    let positions = source;
    if (["muscle", "hatch", "wagon"].includes(s.body)) {
      const cutoff = { muscle: 0.84, hatch: 0.865, wagon: 0.721 }[s.body];
      positions = [];
      for (let i = 0; i < source.length; i += 9)
        if (
          [source[i + 1], source[i + 4], source[i + 7]].every((y) => y < cutoff)
        )
          positions.push(...source.slice(i, i + 9));
    }
    if (!positions.length) continue;
    if (kind === "glass") glass(group, positions, s, m);
    else {
      const obj = mesh(
        semanticGeometry(positions),
        m[kind] || m.paint,
        `body-${kind}`,
      );
      group.add(obj);
      if (s.stripes && ["paint", "lower"].includes(kind))
        stripes(group, positions, m.secondary);
    }
  }
  if (s.body === "muscle") muscleCabin(group, a, s, m);
  if (s.body === "hatch") hatchCabin(group, s, m);
  if (s.body === "wagon") wagonCabin(group, s, m);
  if (a.procedural) openCoachwork(group, s, m, a);
  wheels(group, data, s, m, a);
  rearParts(group, a, s, m);
  accessories(group, a, s, m);
  // A floor-hugging chassis connects all four wheels and hides no tire silhouette.
  group.add(
    box(
      [a.width * 0.68, 0.07, Math.abs(a.rear) * 1.35],
      [0, 0.22, 0],
      m.dark,
      0.02,
      "chassis",
    ),
  );
  group.userData = { body: s.body, configuration: s, triangles: 0 };
  group.traverse((o) => {
    if (o.geometry)
      group.userData.triangles +=
        (o.geometry.index?.count || o.geometry.attributes.position.count) / 3;
  });
  // Dispose materials which a configuration did not use, too.
  group.userData.materials = Object.values(m);
  return group;
}
