import { createSavaStick, type SavaStickOptions, type SavaStickVariant, stickLabelUrl } from "@/lib/sava-stick";
import { turntable } from "@/lib/turntable";

/*
 * Shared setup for the fixed, full-viewport canvases that draw SAVA sticks over the page (HomeModel,
 * FooterModel, the /home page's ExperienceStage): three.js loaded on demand, a transparent renderer in neutral tone mapping, soft
 * studio light tuned to match the product photos, and an orthographic camera in CSS pixels (y up)
 * so page rects map straight onto the scene. `build` adds a stick, centred, wrapped as
 * tilt (z, plus tip on x) → spin (y) so it turns on its own axis.
 */

export async function createStickStage(canvas: HTMLCanvasElement) {
  const [THREE, { RoomEnvironment }] = await Promise.all([
    import("three"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]);

  let renderer: InstanceType<typeof THREE.WebGLRenderer>;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return null; // No WebGL — the static images stay
  }
  renderer.setClearColor(0x000000, 0);
  // Neutral keeps the packaging colours true to the photos (ACES would darken and desaturate them)
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.6;
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(-1, 1.5, 2);
  scene.add(key);

  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -5000, 5000);
  const resize = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.right = window.innerWidth;
    camera.bottom = -window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const models: InstanceType<typeof THREE.Object3D>[] = [];
  const loader = new THREE.TextureLoader();

  /** Adds a stick; only its printed label is fetched (a missing label leaves it unprinted) */
  const build = async (variant: SavaStickVariant, options?: SavaStickOptions) => {
    const label = await loader.loadAsync(stickLabelUrl(variant)).catch(() => undefined);
    if (label) {
      label.colorSpace = THREE.SRGBColorSpace;
      label.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    const model = createSavaStick(THREE, variant, label, options);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const spin = new THREE.Group();
    spin.add(model);
    const tilt = new THREE.Group();
    tilt.add(spin);
    scene.add(tilt);
    models.push(model);
    return { model, spin, tilt, size, state: turntable() };
  };

  /**
   * A soft contact shadow for a stick resting on a surface in the page (the /home hero's tabletop): a
   * blurred ellipse on a plane behind the sticks, 1 × 1 px until it's scaled. Place, size and fade it
   * (material.opacity) per frame.
   */
  const shadow = () => {
    const size = 128;
    const disc = document.createElement("canvas");
    disc.width = disc.height = size;
    const context = disc.getContext("2d")!;
    const fade = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    fade.addColorStop(0, "rgba(0, 0, 0, 0.6)");
    fade.addColorStop(0.5, "rgba(0, 0, 0, 0.28)");
    fade.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = fade;
    context.fillRect(0, 0, size, size);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(disc), transparent: true, depthWrite: false }),
    );
    mesh.position.z = -4000;
    scene.add(mesh);
    models.push(mesh);
    return mesh;
  };

  /** Scale that fits a stick into a w × h CSS-pixel slot (× fit) */
  const fitScale = (stick: { size: { x: number; y: number; z: number } }, w: number, h: number, fit = 1) =>
    Math.min(h / stick.size.y, (w * 1.4) / Math.max(stick.size.x, stick.size.z)) * fit;

  const render = () => renderer.render(scene, camera);
  const clear = () => renderer.clear();

  /**
   * Uploads the built sticks' textures and compiles their shaders ahead of the first visible frame
   * (in parallel, off the main thread, where the browser supports it), so that frame doesn't stall
   */
  const warm = async () => {
    for (const model of models) {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        for (const material of [object.material].flat()) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) renderer.initTexture(value);
        }
      });
    }
    await renderer.compileAsync(scene, camera);
  };

  const dispose = () => {
    window.removeEventListener("resize", resize);
    for (const model of models) {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        for (const material of [object.material].flat()) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
          material.dispose();
        }
      });
    }
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  return { build, shadow, warm, fitScale, render, clear, dispose };
}

export type StickStage = NonNullable<Awaited<ReturnType<typeof createStickStage>>>;
export type Stick = Awaited<ReturnType<StickStage["build"]>>;
