import * as THREE from "three";
import { box, mesh, surface, cylinder } from "./geometry.js";

export const catalogProfiles = {
  van: {
    axles: [-1.02, 1.0],
    radius: 0.25,
    sections: [
      [-1.49, 0.61, 0.38, 0.98],
      [-1.35, 0.67, 0.37, 0.99],
      [1.27, 0.67, 0.37, 0.99],
      [1.48, 0.57, 0.4, 0.96],
    ],
  },
  pickup: {
    axles: [-1.02, 0.98],
    radius: 0.28,
    sections: [
      [-1.55, 0.64, 0.38, 0.84],
      [-1.4, 0.69, 0.38, 0.87],
      [-0.24, 0.69, 0.38, 0.87],
      [0.2, 0.65, 0.38, 0.83],
      [1.12, 0.64, 0.38, 0.83],
      [1.5, 0.53, 0.39, 0.72],
    ],
  },
  offroad: {
    axles: [-0.85, 0.86],
    radius: 0.34,
    sections: [
      [-1.22, 0.62, 0.49, 0.98],
      [-1.1, 0.65, 0.48, 1.0],
      [0.48, 0.65, 0.48, 1.0],
      [0.64, 0.57, 0.5, 0.9],
      [1.19, 0.57, 0.5, 0.9],
      [1.31, 0.51, 0.52, 0.84],
    ],
  },
  wedge: {
    axles: [-0.99, 0.98],
    radius: 0.235,
    sections: [
      [-1.49, 0.73, 0.32, 0.75],
      [-1.3, 0.76, 0.31, 0.8],
      [-0.65, 0.76, 0.31, 0.78],
      [0.42, 0.72, 0.31, 0.7],
      [1.12, 0.67, 0.32, 0.58],
      [1.49, 0.57, 0.34, 0.49],
    ],
  },
  retro: { axles: [-0.7, 0.74], radius: 0.255 },
};
export function catalogData(id) {
  const p = catalogProfiles[id];
  return {
    parts: {},
    axles: p.axles.flatMap((z) => [-1, 1].map((x) => [x * 0.6, p.radius, z])),
  };
}
function quad(g, points, m, name = "body-paint") {
  m.side = THREE.DoubleSide;
  g.add(surface(points, m, name));
}
function ellipsoid(g, size, at, m, name) {
  const o = mesh(new THREE.SphereGeometry(1, 20, 12), m, name);
  o.scale.set(...size);
  o.position.set(...at);
  g.add(o);
  return o;
}
function beam(g, a, b, r, m, name) {
  const start = new THREE.Vector3(...a),
    end = new THREE.Vector3(...b);
  const o = mesh(
    new THREE.CylinderGeometry(r, r, start.distanceTo(end), 8),
    m,
    name,
  );
  o.position.copy(start).add(end).multiplyScalar(0.5);
  o.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    end.sub(start).normalize(),
  );
  g.add(o);
}
function bodyShell(g, p, m, { openFrom = Infinity, openTo = Infinity } = {}) {
  const at = (z) => {
    const i = Math.max(
      0,
      p.sections.findIndex(
        (v, j) =>
          j < p.sections.length - 1 && z >= v[0] && z <= p.sections[j + 1][0],
      ),
    );
    const v = p.sections[i],
      q = p.sections[i + 1],
      t = THREE.MathUtils.clamp((z - v[0]) / (q[0] - v[0]), 0, 1);
    return [
      v[1] + (q[1] - v[1]) * t,
      v[2] + (q[2] - v[2]) * t,
      v[3] + (q[3] - v[3]) * t,
    ];
  };
  const stations = p.sections.map((v) => v[0]);
  for (const axle of p.axles)
    for (let i = 0; i <= 12; i++)
      stations.push(axle + Math.cos((i * Math.PI) / 12) * (p.radius + 0.035));
  stations.sort((a, b) => a - b);
  for (let i = 0; i < stations.length - 1; i++) {
    const z0 = stations[i],
      z1 = stations[i + 1];
    if (z1 - z0 < 0.0001) continue;
    const [w0, b0, y0] = at(z0),
      [w1, b1, y1] = at(z1);
    const bottom = (z, b) => {
      for (const axle of p.axles) {
        const r = p.radius + 0.035,
          d = z - axle;
        if (Math.abs(d) <= r)
          b = Math.max(b, p.radius + Math.sqrt(Math.max(0, r * r - d * d)));
      }
      return b;
    };
    for (const side of [-1, 1]) {
      const lo0 = bottom(z0, b0),
        lo1 = bottom(z1, b1);
      quad(
        g,
        [
          [side * w0, lo0, z0],
          [side * w1, lo1, z1],
          [side * w1, y1 - 0.065, z1],
          [side * w0, y0 - 0.065, z0],
        ],
        m.paint,
      );
      quad(
        g,
        [
          [side * w0, y0 - 0.065, z0],
          [side * w1, y1 - 0.065, z1],
          [side * (w1 - 0.05), y1, z1],
          [side * (w0 - 0.05), y0, z0],
        ],
        m.paint,
      );
      quad(
        g,
        [
          [side * w0, lo0, z0],
          [side * (w0 - 0.075), lo0, z0],
          [side * (w1 - 0.075), lo1, z1],
          [side * w1, lo1, z1],
        ],
        m.paint,
        "wheel-arch-return",
      );
    }
    // Utility beds and passenger cabins leave their top genuinely open.
    if (z1 <= openFrom || z0 >= openTo)
      quad(
        g,
        [
          [-w0 + 0.05, y0, z0],
          [w0 - 0.05, y0, z0],
          [w1 - 0.05, y1, z1],
          [-w1 + 0.05, y1, z1],
        ],
        m.paint,
      );
  }
  for (const [z, w, b, y] of [p.sections[0], p.sections.at(-1)])
    quad(
      g,
      [
        [-w, b, z],
        [w, b, z],
        [w - 0.05, y, z],
        [-w + 0.05, y, z],
      ],
      m.paint,
      "body-paint",
    );
}
function greenhouse(
  g,
  m,
  s,
  {
    half,
    base,
    top,
    rear,
    front,
    roofRear,
    roofFront,
    roofHalf = half - 0.075,
    bays = 2,
    roofMaterial = m.paint,
  },
) {
  const back = [
    [-half, base, rear],
    [half, base, rear],
    [roofHalf, top, roofRear],
    [-roofHalf, top, roofRear],
  ];
  quad(g, back, m.paint, "cabin-rear");
  const inset = (p, u0, v0, u1, v1, off) => {
    const at = (u, v) =>
      new THREE.Vector3(...p[0])
        .lerp(new THREE.Vector3(...p[1]), u)
        .lerp(new THREE.Vector3(...p[3]).lerp(new THREE.Vector3(...p[2]), u), v)
        .add(new THREE.Vector3(...off))
        .toArray();
    return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
  };
  const margin = 0.12 + (100 - Number(s.window)) * 0.0015;
  quad(
    g,
    inset(back, margin, 0.16, 1 - margin, 0.85, [0, 0.002, -0.006]),
    m.glass,
    "rear-window",
  );
  const frontPanel = [
    [-half, base, front],
    [-roofHalf, top, roofFront],
    [roofHalf, top, roofFront],
    [half, base, front],
  ];
  quad(g, frontPanel, m.paint, "windshield-frame");
  quad(
    g,
    inset(frontPanel, 0.1, 0.1, 0.9, 0.9, [0, 0, 0.005]),
    m.glass,
    "windshield",
  );
  for (const side of [-1, 1]) {
    const points = [
      [side * half, base, rear],
      [side * half, base, front],
      [side * roofHalf, top, roofFront],
      [side * roofHalf, top, roofRear],
    ];
    quad(g, points, m.paint, "side-pillars");
    for (let i = 0; i < bays; i++)
      quad(
        g,
        inset(points, (i + 0.12) / bays, 0.13, (i + 0.88) / bays, 0.88, [
          side * 0.005,
          0,
          0,
        ]),
        m.glass,
        "side-window",
      );
  }
  g.add(
    box(
      [roofHalf * 2 + 0.05, 0.095, roofFront - roofRear + 0.08],
      [0, top + 0.015, (roofRear + roofFront) / 2],
      roofMaterial,
      0.045,
      "roof",
    ),
  );
}
function van(g, s, m, a) {
  bodyShell(g, catalogProfiles.van, m);
  greenhouse(g, m, s, {
    half: 0.62,
    base: 0.97,
    top: 1.67,
    rear: -1.47,
    front: 1.4,
    roofRear: -1.35,
    roofFront: 1.25,
    bays: 4,
    roofMaterial: m.secondary,
  });
  // Cream belt, separate engine hatch and loading door seams.
  for (const side of [-1, 1])
    g.add(
      box(
        [0.02, 0.17, 2.65],
        [side * 0.674, 0.94, -0.02],
        m.secondary,
        0.008,
        "two-tone-belt",
      ),
    );
  g.add(
    box([1.19, 0.16, 0.04], [0, 0.94, -1.516], m.secondary, 0.015, "rear-belt"),
  );
  for (const x of [-0.55, 0.55])
    g.add(
      box(
        [0.009, 0.51, 0.013],
        [x, 0.7, -1.512],
        m.dark,
        0.003,
        "rear-door-seam",
      ),
    );
  g.add(
    box([1.1, 0.009, 0.015], [0, 0.9, -1.52], m.dark, 0.003, "rear-hatch-seam"),
  );
  g.add(
    box(
      [0.13, 0.025, 0.023],
      [0, 1.035, -1.49],
      m.chrome,
      0.008,
      "hatch-handle",
    ),
  );
  for (let i = 0; i < 5; i++)
    g.add(
      box(
        [0.17, 0.012, 0.012],
        [-0.4, 0.52 + i * 0.036, -1.516],
        m.dark,
        0.003,
        "engine-vent",
      ),
    );
  if (s.rack) rack(g, m, a);
}
function pickup(g, s, m, a) {
  bodyShell(g, catalogProfiles.pickup, m, { openFrom: -2, openTo: 0.18 });
  // Four inner walls plus a ribbed floor: no solid volume fills the cargo bed.
  g.add(
    box([1.12, 0.07, 1.22], [0, 0.48, -0.85], m.secondary, 0.016, "bed-floor"),
  );
  for (const side of [-1, 1]) {
    g.add(
      box(
        [0.055, 0.35, 1.25],
        [side * 0.585, 0.665, -0.86],
        m.paint,
        0.014,
        "bed-inner-wall",
      ),
    );
    g.add(
      box(
        [0.095, 0.045, 1.3],
        [side * 0.625, 0.875, -0.87],
        m.secondary,
        0.017,
        "bed-rail",
      ),
    );
    g.add(
      box(
        [0.2, 0.18, 0.53],
        [side * 0.48, 0.56, -1.02],
        m.paint,
        0.035,
        "inner-wheel-tub",
      ),
    );
  }
  g.add(box([1.18, 0.38, 0.075], [0, 0.67, -1.51], m.paint, 0.018, "tailgate"));
  g.add(
    box([1.18, 0.35, 0.055], [0, 0.66, -0.23], m.paint, 0.015, "bed-bulkhead"),
  );
  for (let x = -0.45; x < 0.5; x += 0.15)
    g.add(
      box([0.025, 0.016, 1.13], [x, 0.523, -0.85], m.chrome, 0.005, "bed-rib"),
    );
  greenhouse(g, m, s, {
    half: 0.57,
    base: 0.83,
    top: 1.39,
    rear: -0.14,
    front: 0.75,
    roofRear: -0.07,
    roofFront: 0.53,
    bays: 1,
  });
  g.add(box([1.05, 0.025, 0.59], [0, 0.83, 1.03], m.paint, 0.012, "hood"));
  for (const x of [-0.47, 0.47])
    g.add(
      box(
        [0.08, 0.026, 0.025],
        [x, 0.81, -1.56],
        m.chrome,
        0.008,
        "tailgate-hinge",
      ),
    );
  if (s.bedCover === "flat")
    g.add(
      box([1.24, 0.06, 1.27], [0, 0.89, -0.85], m.dark, 0.025, "bed-cover"),
    );
  if (s.bedCover === "canopy") {
    greenhouse(g, m, s, {
      half: 0.59,
      base: 0.88,
      top: 1.38,
      rear: -1.53,
      front: -0.19,
      roofRear: -1.49,
      roofFront: -0.23,
      bays: 2,
      roofMaterial: m.secondary,
    });
  }
}
function offroad(g, s, m, a) {
  bodyShell(g, catalogProfiles.offroad, m, { openFrom: -2, openTo: 0.5 });
  g.add(
    box([1.12, 0.075, 1.53], [0, 0.58, -0.25], m.dark, 0.02, "cabin-floor"),
  );
  greenhouse(g, m, s, {
    half: 0.57,
    base: 0.98,
    top: 1.64,
    rear: -1.18,
    front: 0.5,
    roofRear: -1.13,
    roofFront: 0.3,
    bays: 2,
    roofMaterial: m.secondary,
  });
  // Raised axles, differential housings and suspension links connect all wheels.
  for (const z of catalogProfiles.offroad.axles) {
    beam(g, [-0.58, 0.34, z], [0.58, 0.34, z], 0.035, m.dark, "axle");
    ellipsoid(g, [0.11, 0.08, 0.1], [0, 0.34, z], m.dark, "differential");
    for (const side of [-1, 1]) {
      beam(
        g,
        [side * 0.44, 0.35, z],
        [side * 0.44, 0.57, z + 0.1],
        0.026,
        m.chrome,
        "suspension",
      );
      g.add(
        box(
          [0.24, 0.07, 0.78],
          [side * 0.64, 0.74, z],
          m.dark,
          0.027,
          "fender-flare",
        ),
      );
    }
  }
  g.add(
    box([1.02, 0.055, 0.6], [0, 0.91, 0.86], m.paint, 0.015, "offroad-hood"),
  );
  if (s.rack) rack(g, m, a);
  if (s.spare) {
    // Centered above the plate; no sideways offset can overlap long EU plates.
    const z = a.rear - 0.2,
      y = 1.23;
    g.add(
      box(
        [0.22, 0.14, 0.32],
        [0, y, a.rear - 0.065],
        m.dark,
        0.02,
        "spare-bracket",
      ),
    );
    const tire = mesh(
      new THREE.TorusGeometry(0.235, 0.092, 8, 20),
      m.rubber,
      "spare-tire",
    );
    tire.position.set(0, y, z);
    g.add(tire);
    const rim = cylinder(0.16, 0.1, m.chrome, 16);
    rim.position.set(0, y, z - 0.02);
    g.add(rim);
    const hub = cylinder(0.07, 0.12, m.dark, 12);
    hub.position.set(0, y, z - 0.035);
    g.add(hub);
    for (let i = 0; i < 20; i++) {
      const t = (i * Math.PI * 2) / 20;
      const tread = box(
        [0.075, 0.035, 0.18],
        [Math.cos(t) * 0.31, y + Math.sin(t) * 0.31, z],
        m.rubber,
        0.008,
        "spare-tread",
      );
      tread.rotation.z = t;
      g.add(tread);
    }
  }
}
function wedge(g, s, m, a) {
  bodyShell(g, catalogProfiles.wedge, m);
  greenhouse(g, m, s, {
    half: 0.63,
    base: 0.76,
    top: 1.1,
    rear: -1.15,
    front: 0.68,
    roofRear: -0.39,
    roofFront: 0.3,
    roofHalf: 0.5,
    bays: 1,
  });
  // Louvers follow the sloping rear glass; separate angular engine deck.
  for (let i = 0; i < 7; i++) {
    const t = (i + 1) / 9,
      z = -1.15 + 0.76 * t,
      y = 0.76 + 0.34 * t;
    const l = box(
      [1.03, 0.025, 0.055],
      [0, y + 0.012, z - 0.018],
      m.dark,
      0.003,
      "rear-louver",
    );
    l.rotation.x = -0.42;
    g.add(l);
  }
  for (const side of [-1, 1])
    g.add(
      box(
        [0.025, 0.1, 2.31],
        [side * 0.755, 0.47, -0.1],
        m.dark,
        0.005,
        "impact-strip",
      ),
    );
  g.add(
    box(
      [1.38, 0.07, 0.32],
      [0, 0.73, -1.28],
      m.paint,
      0.006,
      "angular-engine-deck",
    ),
  );
}
const dome = [
  [-0.95, 0.28, 0.72, 0.86],
  [-0.72, 0.43, 0.74, 1.03],
  [-0.45, 0.52, 0.75, 1.23],
  [-0.16, 0.54, 0.75, 1.31],
  [0.2, 0.53, 0.75, 1.3],
  [0.46, 0.48, 0.74, 1.18],
  [0.72, 0.37, 0.73, 0.98],
  [0.91, 0.24, 0.72, 0.84],
];
function domePoint(z, t) {
  const i = Math.max(
    0,
    dome.findIndex(
      (p, j) => j < dome.length - 1 && z >= p[0] && z <= dome[j + 1][0],
    ),
  );
  const a = dome[i],
    b = dome[i + 1],
    u = THREE.MathUtils.clamp((z - a[0]) / (b[0] - a[0]), 0, 1);
  const w = THREE.MathUtils.lerp(a[1], b[1], u),
    base = THREE.MathUtils.lerp(a[2], b[2], u),
    top = THREE.MathUtils.lerp(a[3], b[3], u);
  return [w * Math.cos(t), base + (top - base) * Math.sin(t), z];
}
function retro(g, s, m, a) {
  ellipsoid(g, [0.54, 0.3, 1.13], [0, 0.57, 0], m.paint, "body-paint");
  for (const side of [-1, 1])
    for (const z of catalogProfiles.retro.axles) {
      const o = mesh(
        new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        m.paint,
        "fender",
      );
      o.scale.set(0.245, 0.3, 0.49);
      o.position.set(side * 0.49, 0.34, z);
      g.add(o);
    }
  // Paint and glazing share exactly the same vertex lattice. This prevents
  // intersecting overlay patches and keeps curved glass flush with the body.
  const buckets = new Map();
  const face = (points, material, name) => {
    material.side = THREE.DoubleSide;
    if (!buckets.has(name)) buckets.set(name, { material, vertices: [] });
    const vertices = buckets.get(name).vertices;
    for (const i of [0, 1, 2, 0, 2, 3]) vertices.push(...points[i]);
  };
  const span = 0.38 * (0.75 + Number(s.window) * 0.0025);
  for (let i = 0; i < 40; i++)
    for (let j = 0; j < 24; j++) {
      const z0 = -0.95 + (1.86 * i) / 40,
        z1 = -0.95 + (1.86 * (i + 1)) / 40,
        t0 = (j * Math.PI) / 24,
        t1 = ((j + 1) * Math.PI) / 24;
      const z = (z0 + z1) / 2,
        t = (t0 + t1) / 2;
      const rear =
        z > -0.76 && z < -0.49 && Math.abs(t / Math.PI - 0.5) < span / 2;
      const side =
        z > -0.42 &&
        z < 0.47 &&
        Math.abs(z - 0.02) > 0.025 &&
        ((t > 0.2 && t < 1.03) || (t > Math.PI - 1.03 && t < Math.PI - 0.2));
      const front =
        z > 0.49 && z < 0.72 && t > Math.PI * 0.28 && t < Math.PI * 0.72;
      const striped = s.stripes && (j === 10 || j === 13);
      face(
        [
          domePoint(z0, t0),
          domePoint(z0, t1),
          domePoint(z1, t1),
          domePoint(z1, t0),
        ],
        rear || side || front ? m.glass : striped ? m.secondary : m.paint,
        rear
          ? "rear-window"
          : side
            ? "side-window"
            : front
              ? "windshield"
              : striped
                ? "racing-stripes"
                : "body-paint",
      );
    }
  for (const z of [-0.95, 0.91])
    for (let j = 0; j < 24; j++)
      face(
        [
          [0, 0.72, z],
          domePoint(z, (j * Math.PI) / 24),
          domePoint(z, ((j + 1) * Math.PI) / 24),
          [0, 0.72, z],
        ],
        m.paint,
        "body-paint",
      );
  for (const [name, { material, vertices }] of buckets) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.computeVertexNormals();
    g.add(mesh(geometry, material, name));
  }
  ellipsoid(g, [0.4, 0.26, 0.21], [0, 0.57, -1.01], m.paint, "engine-lid");
  // Small center panel supports the plate; fenders retain their round silhouettes.
  g.add(
    box([0.72, 0.25, 0.07], [0, 0.56, -1.19], m.paint, 0.035, "plate-recess"),
  );
  for (let i = 0; i < 4; i++)
    g.add(
      box(
        [0.32, 0.008, 0.012],
        [0, 0.77 + i * 0.026, -1.07 + i * 0.025],
        m.dark,
        0.003,
        "engine-vent",
      ),
    );
  g.add(
    box(
      [0.12, 0.022, 0.025],
      [0, 0.71, -1.2],
      m.chrome,
      0.008,
      "engine-handle",
    ),
  );
}
function rack(g, m, a) {
  const y = a.rackY,
    z = a.rackZ;
  for (const side of [-1, 1])
    for (const end of [-1, 1])
      g.add(
        box(
          [0.045, 0.13, 0.065],
          [side * 0.43, y - 0.065, z + end * 0.59],
          m.chrome,
          0.008,
          "rack-foot",
        ),
      );
  for (const side of [-1, 1])
    beam(
      g,
      [side * 0.49, y + 0.07, z - 0.65],
      [side * 0.49, y + 0.07, z + 0.65],
      0.019,
      m.chrome,
      "rack-rail",
    );
  for (const end of [-1, 1])
    beam(
      g,
      [-0.49, y + 0.07, z + end * 0.65],
      [0.49, y + 0.07, z + end * 0.65],
      0.019,
      m.chrome,
      "rack-rail",
    );
  for (let k = -3; k <= 3; k++)
    g.add(
      box(
        [0.95, 0.028, 0.035],
        [0, y, z + k * 0.19],
        m.chrome,
        0.005,
        "rack-slat",
      ),
    );
}
const builders = { van, pickup, offroad, wedge, retro };
export function catalogCoachwork(g, s, m, a) {
  builders[s.body](g, s, m, a);
}
