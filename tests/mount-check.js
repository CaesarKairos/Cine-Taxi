import * as THREE from "three";
import { buildVehicle } from "../src/car.js";
import { initial } from "../src/state.js";
import { disposeGroup } from "../src/vehicle/geometry.js";

// Ray-test the visible plate surface, independently of the mounting formulas.
// This catches body parts in front of the text even when all UI controls work.
export async function checkMounts() {
  const failures = [];
  for (const body of ["sedan", "hatch", "coupe", "muscle", "wagon"]) {
    for (const bumper of ["chrome", "painted", "sport"]) {
      for (const [width, height] of [
        [164, 72],
        [280, 45],
        [95, 130],
      ]) {
        const model = await buildVehicle({
          ...initial,
          body,
          bumper,
          plate: { ...initial.plate, width, height },
        });
        model.updateMatrixWorld(true);
        const plate = model.getObjectByName("license-plate");
        const center = new THREE.Box3()
          .setFromObject(model)
          .getCenter(new THREE.Vector3());
        for (const offset of [
          [0, 2.3, -10],
          [-2.8, 2.8, -10],
        ]) {
          const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 40);
          camera.position.copy(center).add(new THREE.Vector3(...offset));
          camera.lookAt(center);
          camera.updateMatrixWorld();
          for (const x of [-0.85, 0, 0.85])
            for (const y of [-0.85, 0, 0.85]) {
              const p = plate.localToWorld(
                new THREE.Vector3(
                  (x * plate.geometry.parameters.width) / 2,
                  (y * plate.geometry.parameters.height) / 2,
                  0,
                ),
              );
              const ndc = p.clone().project(camera),
                ray = new THREE.Raycaster();
              ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
              const hit = ray.intersectObjects(model.children, true)[0];
              if (hit?.object !== plate)
                failures.push({
                  body,
                  bumper,
                  width,
                  height,
                  offset,
                  x,
                  y,
                  blockedBy: hit?.object.name,
                });
            }
        }
        disposeGroup(model);
      }
    }
  }
  return failures;
}
