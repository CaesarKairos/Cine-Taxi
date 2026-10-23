import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
export function mesh(geometry, material, name = "") {
  const obj = new THREE.Mesh(geometry, material);
  obj.name = name;
  obj.castShadow = true;
  obj.receiveShadow = true;
  return obj;
}
export function box(size, position, material, radius = 0.025, name = "") {
  const geo = radius
    ? new RoundedBoxGeometry(...size, 1, radius)
    : new THREE.BoxGeometry(...size);
  const obj = mesh(geo, material, name);
  obj.position.set(...position);
  return obj;
}
export function surface(points, material, name = "") {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flat(), 3),
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return mesh(geometry, material, name);
}
export function cylinder(radius, depth, material, segments = 16) {
  const m = mesh(
    new THREE.CylinderGeometry(radius, radius, depth, segments),
    material,
  );
  m.rotation.x = Math.PI / 2;
  return m;
}
export function disposeGroup(group) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  group.traverse((o) => {
    if (o.geometry) geometries.add(o.geometry);
    if (o.material)
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
        materials.add(m),
      );
  });
  (group.userData.materials || []).forEach((m) => materials.add(m));
  materials.forEach((m) => {
    for (const value of Object.values(m))
      if (value?.isTexture && !value.userData.shared) textures.add(value);
    m.dispose();
  });
  geometries.forEach((g) => g.dispose());
  textures.forEach((t) => t.dispose());
  group.removeFromParent();
}
