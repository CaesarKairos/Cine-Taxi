import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildVehicle } from "../car.js";
import { disposeGroup } from "./geometry.js";
import { refreshPlate } from "./parts.js";
import { models } from "./models.js";

function lighting(renderer) {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight("#fff6dc", "#858e89", 1.1));
  const key = new THREE.DirectionalLight("#fff4de", 2.5);
  key.position.set(-3, 6, -4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -3,
    right: 3,
    top: 3,
    bottom: -3,
    near: 0.1,
    far: 18,
  });
  key.shadow.normalBias = 0.015;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#d6e8ff", 0.85);
  fill.position.set(4, 3, 2);
  scene.add(fill);
  const env = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(env, 0.05);
  scene.environment = envMap.texture;
  scene.environmentIntensity = 0.4;
  env.dispose();
  pmrem.dispose();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ color: "#445344", opacity: 0.085 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.004;
  floor.receiveShadow = true;
  scene.add(floor);
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  grad.addColorStop(0, "rgba(27,39,31,.23)");
  grad.addColorStop(0.45, "rgba(27,39,31,.13)");
  grad.addColorStop(1, "rgba(27,39,31,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 3.5),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  scene.add(shadow);
  return { scene, floor, shadow, envMap };
}

class Engine {
  constructor({ canvas, pixelRatio = 1 } = {}) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setClearColor(0, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    Object.assign(this, lighting(this.renderer));
    this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 40);
    this.view = "three-quarter";
    this.width = 800;
    this.height = 500;
  }
  resize(w, h) {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    this.renderer.setSize(this.width, this.height, false);
  }
  draw({ transparent = false, view = this.view } = {}) {
    if (!this.model) return;
    this.floor.visible = this.shadow.visible = !transparent;
    const bounds = new THREE.Box3().setFromObject(this.model),
      center = bounds.getCenter(new THREE.Vector3());
    const configuration = this.model.userData.configuration;
    const openCabin =
      configuration.roof === "open" ||
      (models[configuration.body].bedCover &&
        configuration.bedCover === "open");
    const offset =
      view === "rear"
        ? new THREE.Vector3(0, openCabin ? 2.9 : 2.3, -10)
        : new THREE.Vector3(-2.8, openCabin ? 3.5 : 2.8, -10);
    this.camera.position.copy(center).add(offset);
    this.camera.lookAt(center);
    this.camera.updateMatrixWorld();
    const projected = new THREE.Box3();
    // Project the actual vertices rather than the empty corners of the bounding box.
    this.model.updateMatrixWorld(true);
    this.model.traverse((o) => {
      if (!o.geometry) return;
      const positions = o.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const p = new THREE.Vector3()
          .fromBufferAttribute(positions, i)
          .applyMatrix4(o.matrixWorld)
          .applyMatrix4(this.camera.matrixWorldInverse);
        projected.expandByPoint(p);
      }
    });
    const aspect = this.width / this.height,
      size = projected.getSize(new THREE.Vector3());
    const h = Math.max(size.y * 1.34, (size.x / aspect) * 1.22, 1.65);
    this.camera.left = (-h * aspect) / 2;
    this.camera.right = (h * aspect) / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }
  setModel(model) {
    if (this.model) disposeGroup(this.model);
    this.model = model;
    this.scene.add(model);
    this.renderer.shadowMap.needsUpdate = true;
  }
  dispose() {
    if (this.model) disposeGroup(this.model);
    this.envMap.dispose();
    this.floor.geometry.dispose();
    this.floor.material.dispose();
    this.shadow.geometry.dispose();
    this.shadow.material.map.dispose();
    this.shadow.material.dispose();
    this.renderer.dispose();
  }
}

let captureEngine;
export async function captureVehicle(
  s,
  { width = 1600, height = 1160, view = "three-quarter" } = {},
) {
  await document.fonts.ready;
  captureEngine ??= new Engine();
  captureEngine.setModel(await buildVehicle(s));
  captureEngine.resize(width, height);
  captureEngine.draw({ transparent: true, view });
  return captureEngine.renderer.domElement.toDataURL("image/png");
}

export class VehicleStudio {
  constructor(host) {
    this.host = host;
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-label", "Miniatura 3D vista pela traseira");
    this.canvas.setAttribute("role", "img");
    host.replaceChildren(this.canvas);
    this.engine = new Engine({
      canvas: this.canvas,
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.revision = 0;
    const report = (error) => {
      console.error("Mini Motor: renderização interrompida", error);
      host.dataset.ready = "false";
      let notice = host.querySelector(".render-error");
      if (!notice) {
        notice = document.createElement("p");
        notice.className = "render-error";
        notice.setAttribute("role", "alert");
        host.append(notice);
      }
      notice.textContent =
        "A visualização 3D foi interrompida. Recarregue a página para recuperar o contexto gráfico. Sua garagem permanece neste navegador.";
    };
    this.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      report(new Error("Contexto WebGL perdido"));
    });
    this.resizeObserver = new ResizeObserver(() => {
      try {
        this.engine.resize(host.clientWidth, host.clientHeight);
        this.engine.draw();
      } catch (error) {
        report(error);
      }
    });
    this.resizeObserver.observe(host);
  }
  async update(s) {
    const revision = ++this.revision;
    this.host.dataset.ready = "false";
    const structureKey = JSON.stringify({ ...s, plate: null });
    let model;
    if (this.engine.model && this.structureKey === structureKey) {
      await document.fonts.load(
        `${s.plate.font === "Barlow Condensed" ? s.plate.weight : 400} ${s.plate.size}px "${s.plate.font}"`,
      );
      if (revision !== this.revision) return false;
      model = this.engine.model;
      const old = model.userData.configuration.plate;
      if (old.width !== s.plate.width || old.height !== s.plate.height)
        this.engine.renderer.shadowMap.needsUpdate = true;
      refreshPlate(model, s.plate);
      model.userData.configuration = structuredClone(s);
    } else {
      model = await buildVehicle(s);
      if (revision !== this.revision) {
        disposeGroup(model);
        return false;
      }
      this.engine.setModel(model);
      this.structureKey = structureKey;
    }
    this.engine.resize(this.host.clientWidth, this.host.clientHeight);
    this.engine.draw();
    this.host.dataset.body = s.body;
    this.host.dataset.ready = "true";
    this.host.dataset.triangles = model.userData.triangles;
    this.host.dispatchEvent(new Event("vehicle-rendered"));
    return true;
  }
  setView(view) {
    this.engine.view = view;
    this.host.dataset.view = view;
    this.engine.draw();
  }
  dispose() {
    this.resizeObserver.disconnect();
    this.engine.dispose();
    captureEngine?.dispose();
    captureEngine = null;
  }
}
