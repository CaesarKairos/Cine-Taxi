import * as THREE from "three";
import { box, mesh, surface, cylinder } from "./geometry.js";

// Original coachwork, not a closed donor mesh with its roof removed.
// Sections describe the curved shoulder; the cockpit is a real hole in the shell.
const designs = {
  roadster: {
    sections: [
      [-1.48, 0.6, 0.76],
      [-1.32, 0.6, 0.76],
      [-1.02, 0.65, 0.83],
      [-0.68, 0.64, 0.79],
      [-0.43, 0.61, 0.73],
      [0.16, 0.6, 0.72],
      [0.46, 0.63, 0.79],
      [0.9, 0.65, 0.82],
      [1.27, 0.57, 0.74],
      [1.49, 0.45, 0.6],
    ],
    opening: [-0.43, 0.46],
    inner: 0.48,
    axles: [-0.96, 0.94],
    radius: 0.255,
    screen: [0.43, 0.23, 1.1],
    seatZ: -0.19,
    deckEnd: -0.43,
  },
  convertible: {
    sections: [
      [-1.29, 0.65, 0.79],
      [-1.16, 0.66, 0.79],
      [-0.82, 0.69, 0.84],
      [-0.59, 0.67, 0.82],
      [-0.38, 0.65, 0.78],
      [0.34, 0.65, 0.78],
      [0.58, 0.68, 0.81],
      [0.94, 0.65, 0.77],
      [1.24, 0.53, 0.63],
    ],
    opening: [-0.38, 0.58],
    inner: 0.51,
    axles: [-0.83, 0.83],
    radius: 0.267,
    screen: [0.56, 0.27, 1.25],
    seatZ: -0.12,
    deckEnd: -0.38,
  },
};
export function openModelData(id) {
  const p = designs[id];
  return {
    parts: {},
    axles: p.axles.flatMap((z) =>
      [-1, 1].map((side) => [side * 0.6, p.radius, z]),
    ),
  };
}
function beam(from, to, r, material, name) {
  const a = new THREE.Vector3(...from),
    b = new THREE.Vector3(...to);
  const obj = mesh(
    new THREE.CylinderGeometry(r, r, a.distanceTo(b), 8),
    material,
    name,
  );
  obj.position.copy(a).add(b).multiplyScalar(0.5);
  obj.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.sub(a).normalize(),
  );
  return obj;
}
function panel(group, points, material, name) {
  material.side = THREE.DoubleSide;
  group.add(surface(points, material, name));
}
export function openCoachwork(group, s, m, a) {
  const p = designs[s.body],
    classic = s.body === "roadster";
  const leather = new THREE.MeshStandardMaterial({
    color: s.interior || "#d7aa73",
    roughness: 0.86,
  });
  const fabric = new THREE.MeshStandardMaterial({
    color: "#292d32",
    roughness: 1,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const clear = m.glass.clone();
  Object.assign(clear, {
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    metalness: 0.05,
  });
  // Register extra materials for the same disposal lifecycle as all existing parts.
  Object.assign(m, { leather, fabric, clear });
  const [back, front] = p.opening,
    inner = p.inner;
  for (let i = 0; i < p.sections.length - 1; i++) {
    const [z0, w0, y0] = p.sections[i],
      [z1, w1, y1] = p.sections[i + 1];
    for (const side of [-1, 1]) {
      // Convex fender top, with a bevel into a narrow, upholstered cockpit rim.
      panel(
        group,
        [
          [side * w0, y0 - 0.08, z0],
          [side * w1, y1 - 0.08, z1],
          [side * (w1 - 0.065), y1, z1],
          [side * (w0 - 0.065), y0, z0],
        ],
        m.paint,
        "body-paint",
      );
      panel(
        group,
        [
          [side * (w0 - 0.065), y0, z0],
          [side * (w1 - 0.065), y1, z1],
          [side * inner, y1 - 0.025, z1],
          [side * inner, y0 - 0.025, z0],
        ],
        m.paint,
        "body-paint",
      );
    }
    if (z1 <= back || z0 >= front) {
      panel(
        group,
        [
          [-inner, y0 - 0.025, z0],
          [inner, y0 - 0.025, z0],
          [inner, y1 - 0.025, z1],
          [-inner, y1 - 0.025, z1],
        ],
        m.paint,
        "body-paint",
      );
      if (s.stripes)
        for (const x of [-0.105, 0.105])
          panel(
            group,
            [
              [x - 0.042, y0 - 0.021, z0],
              [x + 0.042, y0 - 0.021, z0],
              [x + 0.042, y1 - 0.021, z1],
              [x - 0.042, y1 - 0.021, z1],
            ],
            m.secondary,
            "racing-stripes",
          );
    }
  }
  // Lower side panels have actual circular wheel cutouts, with matching arch lips.
  for (const side of [-1, 1]) {
    const sample = (z) => {
      const i = Math.max(
        0,
        p.sections.findIndex(
          (v, j) =>
            j < p.sections.length - 1 && z >= v[0] && z <= p.sections[j + 1][0],
        ),
      );
      const v = p.sections[i],
        next = p.sections[i + 1],
        t = THREE.MathUtils.clamp((z - v[0]) / (next[0] - v[0]), 0, 1);
      const w = THREE.MathUtils.lerp(v[1], next[1], t),
        top = THREE.MathUtils.lerp(v[2], next[2], t) - 0.075;
      let bottom = 0.24;
      for (const axle of p.axles) {
        const r = p.radius + 0.035,
          delta = z - axle;
        if (Math.abs(delta) <= r)
          bottom = Math.max(
            bottom,
            p.radius + Math.sqrt(Math.max(0, r * r - delta * delta)),
          );
      }
      return { w, top, bottom };
    };
    const stations = [...p.sections.map((v) => v[0])];
    for (const axle of p.axles)
      for (let i = 0; i <= 12; i++)
        stations.push(axle + Math.cos((i * Math.PI) / 12) * (p.radius + 0.035));
    stations.sort((a, b) => a - b);
    for (let i = 0; i < stations.length - 1; i++) {
      const z0 = stations[i],
        z1 = stations[i + 1];
      if (z1 - z0 < 0.0001) continue;
      const v = sample(z0),
        q = sample(z1);
      // Short connected strips avoid the huge cross-body triangles of a
      // triangulated concave outline. The arch edge is a physical inner lip.
      panel(
        group,
        [
          [side * v.w, v.bottom, z0],
          [side * q.w, q.bottom, z1],
          [side * q.w, q.top, z1],
          [side * v.w, v.top, z0],
        ],
        m.paint,
        "body-paint",
      );
      panel(
        group,
        [
          [side * v.w, v.bottom, z0],
          [side * (v.w - 0.075), v.bottom, z0],
          [side * (q.w - 0.075), q.bottom, z1],
          [side * q.w, q.bottom, z1],
        ],
        m.paint,
        "wheel-arch-return",
      );
    }
    // Door cards, top rails and handles are attached to the cockpit walls.
    group.add(
      box(
        [0.045, 0.29, front - back],
        [side * (inner - 0.005), 0.595, (back + front) / 2],
        leather,
        0.018,
        "door-card",
      ),
    );
    group.add(
      beam(
        [side * inner, 0.752, back],
        [side * inner, 0.752, front],
        0.018,
        m.chrome,
        "cockpit-rail",
      ),
    );
    group.add(
      box(
        [0.025, 0.021, 0.12],
        [side * (inner - 0.035), 0.67, 0.19],
        m.chrome,
        0.008,
        "inside-handle",
      ),
    );
  }
  // Rounded tail and nose have their own connected thickness.
  for (const [z, w, y] of [p.sections[0], p.sections.at(-1)]) {
    group.add(
      box(
        [w * 2, 0.29, 0.09],
        [0, y - 0.16, z],
        m.paint,
        0.035,
        z < 0 ? "tail-shell" : "nose-shell",
      ),
    );
  }
  group.add(
    box(
      [inner * 2, 0.07, front - back],
      [0, 0.36, (back + front) / 2],
      m.rubber,
      0.025,
      "cockpit-floor",
    ),
  );
  group.add(
    box(
      [inner * 2, 0.24, 0.055],
      [0, 0.59, back],
      leather,
      0.02,
      "rear-bulkhead",
    ),
  );
  group.add(
    box(
      [0.14, 0.12, front - back],
      [0, 0.43, (back + front) / 2],
      leather,
      0.03,
      "transmission-tunnel",
    ),
  );
  for (const side of [-1, 1]) {
    const x = side * 0.265;
    group.add(
      box(
        [0.365, 0.11, 0.38],
        [x, 0.46, p.seatZ + 0.08],
        leather,
        0.05,
        "seat-cushion",
      ),
    );
    const seat = box(
      [0.36, classic ? 0.38 : 0.39, 0.105],
      [x, 0.68, p.seatZ - 0.09],
      leather,
      0.043,
      "seat-back",
    );
    seat.rotation.x = -0.13;
    group.add(seat);
    if (!classic)
      group.add(
        box(
          [0.2, 0.14, 0.09],
          [x, 0.92, p.seatZ - 0.13],
          leather,
          0.035,
          "headrest",
        ),
      );
    for (let k = -2; k <= 2; k++)
      group.add(
        box(
          [0.008, 0.006, 0.25],
          [x + k * 0.05, 0.519, p.seatZ + 0.08],
          m.secondary,
          0.002,
          "seat-stitch",
        ),
      );
  }
  const [baseZ, topZ, topY] = p.screen,
    baseY = classic ? 0.79 : 0.82,
    half = inner - 0.015,
    topHalf = half - 0.04;
  const windshield = [
    [-half, baseY, baseZ],
    [-topHalf, topY, topZ],
    [topHalf, topY, topZ],
    [half, baseY, baseZ],
  ];
  panel(group, windshield, clear, "windshield");
  for (let i = 0; i < 4; i++)
    group.add(
      beam(
        windshield[i],
        windshield[(i + 1) % 4],
        classic ? 0.018 : 0.027,
        classic ? m.chrome : m.dark,
        "windshield-frame",
      ),
    );
  group.add(
    box(
      [inner * 2, 0.12, 0.13],
      [0, baseY - 0.09, baseZ - 0.07],
      m.dark,
      0.025,
      "dashboard",
    ),
  );
  // Visible instrument binnacle, gauges, steering wheel, shifter and mirror.
  for (const x of [-0.3, -0.23, -0.16]) {
    const dial = cylinder(0.027, 0.009, m.chrome, 12);
    dial.position.set(x, baseY - 0.075, baseZ - 0.14);
    group.add(dial);
    const face = cylinder(0.021, 0.012, m.dark, 12);
    face.position.copy(dial.position);
    face.position.z -= 0.008;
    group.add(face);
  }
  const steering = mesh(
    new THREE.TorusGeometry(0.093, 0.012, 6, 16),
    classic ? leather : m.dark,
    "steering-wheel",
  );
  steering.position.set(-0.265, 0.75, baseZ - 0.25);
  steering.rotation.x = -0.4;
  group.add(steering);
  for (let i = 0; i < 3; i++) {
    const t = (i * Math.PI * 2) / 3;
    group.add(
      beam(
        [-0.265, 0.75, baseZ - 0.25],
        [
          -0.265 + Math.cos(t) * 0.082,
          0.75 + Math.sin(t) * 0.075,
          baseZ - 0.25,
        ],
        0.006,
        m.chrome,
        "steering-spoke",
      ),
    );
  }
  group.add(
    beam([0, 0.49, 0.1], [0, 0.63, 0.07], 0.009, m.chrome, "gear-lever"),
  );
  group.add(
    box([0.04, 0.04, 0.04], [0, 0.64, 0.07], m.dark, 0.015, "gear-knob"),
  );
  group.add(
    box(
      [0.14, 0.055, 0.035],
      [0, topY - 0.08, topZ - 0.015],
      m.chrome,
      0.012,
      "rearview-mirror",
    ),
  );
  // Folded fabric is present only when open; closed hood replaces it completely.
  if (s.roof !== "closed") {
    group.add(
      box(
        [inner * 1.85, 0.065, 0.16],
        [0, 0.775, back - 0.075],
        fabric,
        0.025,
        "folded-roof",
      ),
    );
    for (const z of [back - 0.12, back - 0.07, back - 0.02])
      group.add(
        box(
          [inner * 1.75, 0.008, 0.009],
          [0, 0.812, z],
          m.dark,
          0.003,
          "roof-fold",
        ),
      );
  } else {
    const rearZ = back - 0.15,
      rearTop = classic ? 1.09 : 1.2;
    const rear = [
      [-inner, 0.78, rearZ],
      [inner, 0.78, rearZ],
      [topHalf, rearTop - 0.035, back + 0.02],
      [-topHalf, rearTop - 0.035, back + 0.02],
    ];
    panel(group, rear, fabric, "soft-top-rear");
    group.add(
      box(
        [inner * 2 + 0.02, 0.04, 0.055],
        [0, 0.774, rearZ],
        fabric,
        0.015,
        "roof-base-seal",
      ),
    );
    const rearGlass = [
      [-0.34, 0.85, rearZ + 0.031],
      [0.34, 0.85, rearZ + 0.031],
      [0.32, rearTop - 0.045, back - 0.01],
      [-0.32, rearTop - 0.045, back - 0.01],
    ];
    const glassCenter = new THREE.Vector3();
    rearGlass.forEach((p) => glassCenter.add(new THREE.Vector3(...p)));
    glassCenter.multiplyScalar(0.25);
    const glassScale = 0.75 + Number(s.window) * 0.0025;
    panel(
      group,
      rearGlass.map((p) =>
        new THREE.Vector3(...p)
          .sub(glassCenter)
          .multiplyScalar(glassScale)
          .add(glassCenter)
          .toArray(),
      ),
      m.glass,
      "rear-window",
    );
    const arc = [
      [-1, -0.035],
      [-0.85, 0.008],
      [0, 0.035],
      [0.85, 0.008],
      [1, -0.035],
    ];
    for (let i = 0; i < arc.length - 1; i++) {
      const [x0, y0] = arc[i],
        [x1, y1] = arc[i + 1];
      // Close both ends of the curved fabric against the flat rear panel
      // and windshield header; do not leave a slit above the rear window.
      for (const [z, baseline, crown] of [
        [back + 0.02, rearTop - 0.035, rearTop],
        [topZ, topY - 0.02, topY + 0.015],
      ])
        panel(
          group,
          [
            [x0 * topHalf, baseline, z],
            [x1 * topHalf, baseline, z],
            [x1 * topHalf, crown + y1, z],
            [x0 * topHalf, crown + y0, z],
          ],
          fabric,
          "soft-top-seam",
        );
      panel(
        group,
        [
          [x0 * topHalf, rearTop + y0, back + 0.02],
          [x1 * topHalf, rearTop + y1, back + 0.02],
          [x1 * topHalf, topY + 0.015 + y1, topZ],
          [x0 * topHalf, topY + 0.015 + y0, topZ],
        ],
        fabric,
        "soft-top",
      );
    }
    for (const side of [-1, 1]) {
      // Only the sail panel is fabric; the main side aperture is clear glazing.
      panel(
        group,
        [
          [side * inner, 0.78, rearZ],
          [side * inner, 0.78, back + 0.17],
          [side * topHalf, rearTop - 0.035, back + 0.02],
          [side * topHalf, rearTop - 0.035, back + 0.02],
        ],
        fabric,
        "soft-top-sail",
      );
      panel(
        group,
        [
          [side * inner, 0.78, back + 0.17],
          [side * half, baseY, baseZ],
          [side * topHalf, topY - 0.02, topZ],
          [side * topHalf, rearTop - 0.035, back + 0.02],
        ],
        clear,
        "side-window",
      );
    }
  }
  // Front trim and headlights complete the miniature even from the rear-quarter.
  for (const side of [-1, 1]) {
    const z = p.sections.at(-1)[0] + 0.045;
    const head = cylinder(classic ? 0.09 : 0.065, 0.025, m.headlight, 12);
    head.position.set(side * 0.34, 0.58, z);
    group.add(head);
    group.add(
      box(
        [0.065, 0.025, 0.13],
        [side * (a.width / 2 + 0.025), 0.84, 0.33],
        m.chrome,
        0.012,
        "side-mirror",
      ),
    );
    group.add(
      box(
        [0.02, 0.06, 0.025],
        [side * (a.width / 2 - 0.005), 0.8, 0.33],
        m.chrome,
        0.006,
        "mirror-stalk",
      ),
    );
  }
  group.add(
    box(
      [a.width * 0.73, 0.1, 0.035],
      [0, 0.41, p.sections.at(-1)[0] + 0.04],
      m.dark,
      0.025,
      "front-grille",
    ),
  );
}
