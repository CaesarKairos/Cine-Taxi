import * as THREE from "three";
export function materials(s) {
  const gloss = s.finish === "gloss";
  const paint = new THREE.MeshPhysicalMaterial({
    color: s.color,
    roughness: gloss ? 0.36 : 0.86,
    metalness: 0.05,
    clearcoat: gloss ? 0.22 : 0,
    clearcoatRoughness: 0.38,
    flatShading: true,
  });
  return {
    paint,
    lower: paint.clone(),
    secondary: new THREE.MeshStandardMaterial({
      color: s.secondary,
      roughness: 0.48,
      metalness: 0.12,
    }),
    rubber: new THREE.MeshStandardMaterial({
      color: "#222a2d",
      roughness: 0.94,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: "#273137",
      roughness: 0.55,
      metalness: 0.12,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: "#d5dedc",
      metalness: 0.78,
      roughness: 0.25,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color:
        s.glass === "blue"
          ? "#497c94"
          : s.glass === "amber"
            ? "#7c6447"
            : "#314853",
      roughness: 0.18,
      metalness: 0.38,
      clearcoat: 1,
      side: THREE.DoubleSide,
    }),
    headlight: new THREE.MeshStandardMaterial({
      color: "#ffe6a8",
      emissive: "#ffc870",
      emissiveIntensity: 0.12,
      roughness: 0.25,
    }),
    red: new THREE.MeshPhysicalMaterial({
      color: "#e7432e",
      emissive: "#8d140b",
      emissiveIntensity: 0.2,
      roughness: 0.22,
      clearcoat: 1,
    }),
    amber: new THREE.MeshPhysicalMaterial({
      color: "#ffad3b",
      roughness: 0.24,
      clearcoat: 1,
    }),
    white: new THREE.MeshStandardMaterial({ color: "#f7ead7", roughness: 0.3 }),
  };
}
