import * as THREE from "three";
import { box, cylinder, mesh } from "./geometry.js";
import { plateCanvas } from "../plate.js";

export function refreshPlate(group, p) {
  const plane = group.getObjectByName("license-plate"),
    bracket = group.getObjectByName("plate-bracket");
  const width = Math.min(0.66, p.width * 0.0037, (0.255 * p.width) / p.height),
    height = (width * p.height) / p.width;
  plane.geometry.dispose();
  plane.geometry = new THREE.PlaneGeometry(width, height);
  const texture = new THREE.CanvasTexture(plateCanvas(p));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  plane.material.map.dispose();
  plane.material.map = texture;
  const original = bracket.geometry.parameters;
  bracket.scale.set(
    (width + 0.035) / original.width,
    (height + 0.027) / original.height,
    1,
  );
}

export function wheels(group, data, s, m, a) {
  for (const center of data.axles) {
    const g = new THREE.Group();
    g.name = "wheel";
    g.position.set(...center);
    const radius = center[1];
    // The donor wheel nodes also contain an inboard axle stub. Seat the tire
    // against the fender, not at the bounding-box center of that stub.
    g.position.x = Math.sign(center[0]) * (a.width / 2 - radius * 0.39);
    const profile = [
      [0.63, -0.38],
      [0.86, -0.38],
      [0.98, -0.25],
      [1, -0.17],
      [1, 0.17],
      [0.98, 0.25],
      [0.86, 0.38],
      [0.63, 0.38],
    ].map(([r, d]) => new THREE.Vector2(r * radius, d * radius));
    const tire = mesh(new THREE.LatheGeometry(profile, 20), m.rubber);
    tire.rotation.z = Math.PI / 2;
    g.add(tire);
    const rim = cylinder(
      radius * 0.67,
      radius * 0.75,
      s.wheels === "dark" ? m.dark : m.chrome,
      16,
    );
    rim.rotation.set(0, 0, Math.PI / 2);
    g.add(rim);
    const inset = cylinder(radius * 0.54, radius * 0.79, m.dark);
    inset.rotation.set(0, 0, Math.PI / 2);
    g.add(inset);
    const side = Math.sign(center[0]),
      face = side * radius * 0.405;
    const count = s.wheels === "classic" ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const spoke = box(
        [0.018, radius * 0.5, s.wheels === "sport" ? 0.041 : 0.025],
        [
          face,
          Math.cos(angle) * radius * 0.28,
          Math.sin(angle) * radius * 0.28,
        ],
        s.wheels === "dark" ? m.dark : m.chrome,
        0.005,
      );
      spoke.rotation.x = angle;
      g.add(spoke);
    }
    const hub = cylinder(radius * 0.15, 0.026, m.chrome, 12);
    hub.rotation.set(0, 0, Math.PI / 2);
    hub.position.x = face;
    g.add(hub);
    group.add(g);
  }
}

export function rearParts(group, a, s, m) {
  const rear = new THREE.Group();
  rear.name = "rear-mount";
  rear.position.set(0, 0, a.rear);
  group.add(rear);
  // Close the donor bumper cutout with a continuous painted return. This joins
  // the lamp panel to the new bumper instead of exposing the old internal faces.
  rear.add(
    box(
      [a.width * 0.94, a.lightY - a.bumperY - 0.02, 0.12],
      [0, (a.lightY + a.bumperY) / 2, 0.029],
      m.paint,
      0.025,
      "rear-body-return",
    ),
  );
  rear.add(
    box(
      [a.width * 0.94, 0.235, 0.046],
      [0, a.lightY - 0.025, -0.016],
      s.body === "muscle" ? m.dark : m.paint,
      0.026,
      "rear-fascia",
    ),
  );
  for (const side of [-1, 1]) {
    const x = side * a.width * 0.364;
    const cluster = new THREE.Group();
    cluster.name = "taillight";
    cluster.position.set(x, a.lightY, -0.047);
    if (s.lights === "round") {
      for (const offset of s.body === "roadster" ? [0] : [-0.071, 0.071]) {
        const bezel = cylinder(0.063, 0.032, m.chrome);
        bezel.position.x = offset;
        cluster.add(bezel);
        const lens = cylinder(
          0.049,
          0.037,
          offset * side > 0 ? m.amber : m.red,
        );
        lens.position.set(offset, 0, -0.009);
        cluster.add(lens);
        const jewel = cylinder(0.027, 0.005, m.red);
        jewel.position.set(offset, 0, -0.03);
        cluster.add(jewel);
      }
    } else {
      const vertical = s.lights === "vertical",
        w = vertical ? 0.074 : 0.27,
        h = vertical ? 0.2 : s.lights === "bar" ? 0.062 : 0.105;
      cluster.add(
        box([w + 0.023, h + 0.023, 0.035], [0, 0, 0], m.chrome, 0.014),
      );
      cluster.add(box([w, h, 0.04], [0, 0, -0.013], m.red, 0.011));
      cluster.add(
        box(
          [
            vertical ? w * 0.8 : w * 0.24,
            vertical ? h * 0.25 : h * 0.82,
            0.005,
          ],
          [vertical ? 0 : side * w * 0.32, vertical ? -h * 0.29 : 0, -0.036],
          m.amber,
          0.005,
        ),
      );
      if (!vertical)
        for (const y of [-0.023, 0, 0.023])
          if (Math.abs(y) < h / 2)
            cluster.add(
              box(
                [w * 0.65, 0.004, 0.004],
                [-side * w * 0.15, y, -0.037],
                m.red,
                0,
              ),
            );
    }
    rear.add(cluster);
  }
  const width = Math.min(
      0.66,
      s.plate.width * 0.0037,
      (0.255 * s.plate.width) / s.plate.height,
    ),
    height = (width * s.plate.height) / s.plate.width;
  const texture = new THREE.CanvasTexture(plateCanvas(s.plate));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  rear.add(
    box(
      [width + 0.035, height + 0.027, 0.033],
      [0, a.plateY, -0.052],
      m.dark,
      0.012,
      "plate-bracket",
    ),
  );
  const p = mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      transparent: true,
    }),
    "license-plate",
  );
  p.rotation.y = Math.PI;
  p.position.set(0, a.plateY, -0.073);
  p.castShadow = false;
  rear.add(p);
  const bumperMat =
    s.bumper === "chrome"
      ? m.chrome
      : s.bumper === "sport"
        ? m.dark
        : m.secondary;
  rear.add(
    box(
      [a.width * 0.91, 0.13, 0.12],
      [0, a.bumperY - 0.125, 0.027],
      m.dark,
      0.025,
      "rear-valance",
    ),
  );
  rear.add(
    box(
      [
        a.width + 0.07,
        s.bumper === "sport" ? 0.18 : s.body === "roadster" ? 0.075 : 0.115,
        0.18,
      ],
      [0, a.bumperY, -0.012],
      bumperMat,
      0.037,
      "bumper",
    ),
  );
  for (const side of [-1, 1]) {
    rear.add(
      box(
        [0.075, 0.1, 0.25],
        [side * a.width * 0.48, a.bumperY, 0.083],
        bumperMat,
        0.022,
      ),
    );
    if (s.bumper === "chrome")
      rear.add(
        box(
          [0.048, 0.14, 0.034],
          [side * a.width * 0.28, a.bumperY, -0.108],
          m.rubber,
          0.012,
        ),
      );
  }
  if (s.bumper === "sport")
    for (let x = -0.28; x < 0.3; x += 0.14)
      rear.add(
        box(
          [0.018, 0.055, 0.14],
          [x, a.bumperY - 0.075, -0.043],
          m.rubber,
          0.003,
        ),
      );
  for (const x of s.exhaust === "single"
    ? [-a.width * 0.33]
    : s.exhaust === "dual"
      ? [-a.width * 0.33, a.width * 0.33]
      : s.exhaust === "quad"
        ? [-a.width * 0.35, -a.width * 0.26, a.width * 0.26, a.width * 0.35]
        : [0]) {
    const tip = cylinder(0.037, 0.13, m.chrome, 12);
    tip.position.set(x, a.bumperY - 0.1, -0.032);
    rear.add(tip);
    const hole = cylinder(0.026, 0.006, m.dark, 12);
    hole.position.set(x, a.bumperY - 0.1, -0.101);
    rear.add(hole);
  }
  const badge = box(
    [0.11, 0.016, 0.008],
    [0, a.deck - 0.022, -0.012],
    m.chrome,
    0.003,
    "badge",
  );
  rear.add(badge);
}

export function accessories(group, a, s, m) {
  if (s.spoiler !== "none") {
    const high = s.body === "hatch" || s.body === "wagon";
    const baseY = high ? a.roof - 0.03 : (a.spoilerY ?? a.deck);
    const z = high ? a.glassCenter[2] + 0.035 : a.spoilerZ;
    const rise =
      s.spoiler === "wild" ? 0.26 : s.spoiler === "sport" ? 0.13 : 0.025;
    if (s.spoiler !== "lip")
      for (const side of [-1, 1])
        group.add(
          box(
            [0.042, rise, 0.065],
            [side * a.width * 0.31, baseY + rise / 2, z],
            m.dark,
            0.006,
            "spoiler-support",
          ),
        );
    const wing = box(
      [
        a.width * (s.spoiler === "wild" ? 1.1 : 0.94),
        0.048,
        s.spoiler === "lip" ? 0.12 : 0.22,
      ],
      [0, baseY + rise, z],
      s.spoiler === "lip" ? m.paint : m.dark,
      0.018,
      "spoiler",
    );
    wing.rotation.x = -0.05;
    group.add(wing);
    if (s.spoiler === "wild")
      for (const side of [-1, 1])
        group.add(
          box(
            [0.03, 0.12, 0.24],
            [side * a.width * 0.55, baseY + rise + 0.025, z],
            m.dark,
            0.009,
          ),
        );
  }
  if (s.trim) {
    group.updateMatrixWorld(true);
    const panels = group.children.filter(
      (o) => o.name === "body-paint" || o.name === "body-lower",
    );
    for (const side of [-1, 1]) {
      const path = new THREE.CurvePath(),
        points = [];
      for (let z = a.rear * 0.82; z < a.front * 0.84; z += 0.065) {
        const ray = new THREE.Raycaster(
          new THREE.Vector3(side * 3, a.deck - 0.1, z),
          new THREE.Vector3(-side, 0, 0),
        );
        const hit = ray
          .intersectObjects(panels, false)
          .find((h) => Math.abs(h.point.x) <= a.width / 2 + 0.015);
        if (hit) {
          hit.point.x += side * 0.007;
          points.push(hit.point);
        }
      }
      for (let i = 1; i < points.length; i++)
        if (points[i].distanceTo(points[i - 1]) < 0.14)
          path.add(new THREE.LineCurve3(points[i - 1], points[i]));
      if (path.curves.length)
        group.add(
          mesh(
            new THREE.TubeGeometry(path, 64, 0.007, 4, false),
            m.chrome,
            "side-trim",
          ),
        );
    }
  }
  if (s.sticker) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const c = canvas.getContext("2d");
    c.fillStyle = "#f0c45c";
    c.beginPath();
    c.arc(64, 64, 57, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#293a37";
    c.font = "64px sans-serif";
    c.textAlign = "center";
    c.fillText("★", 64, 86);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sticker = mesh(
      new THREE.PlaneGeometry(0.15, 0.15),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        toneMapped: false,
      }),
      "sticker",
    );
    sticker.rotation.y = -Math.PI / 2;
    sticker.position.set(-a.width / 2 - 0.008, 0.72, a.rear + 0.2);
    group.add(sticker);
  }
}
