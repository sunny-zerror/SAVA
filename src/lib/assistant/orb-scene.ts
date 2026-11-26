import { gsap } from "@/lib/gsap";
import {
  BLUR_FRAGMENT,
  BRIGHT_FRAGMENT,
  COMPOSITE_FRAGMENT,
  ORB_FRAGMENT,
  ORB_VERTEX,
  QUAD_VERTEX,
} from "@/lib/assistant/orb-shaders";

/*
 * The assistant's orb in three.js, ported from emotion-agency.com's voice orb (its orb, bloom and
 * phase table, with their numbers): one quad drawn by a raymarching shader (orb-shaders.ts), then a
 * bloom — bright pass, blur across and down at a quarter size, composite. It fills its canvas, which
 * sits half as large again as the orb's box so the corona and glow have room. Light theme, as on a
 * light page there: an inked core (uInk 1) and a faint bloom.
 */

type Hex = string;
interface PhaseLook {
  flow: number;
  speed: number;
  spin: number;
  blobEnergy: number;
  glow: number;
  loading: number;
  waves: number;
  palette: readonly [Hex, Hex, Hex, Hex];
  hot: Hex;
}

const BASE = ["#661f7f", "#6200b3", "#578fff", "#250eaa"] as const;

/** Each phase's look and pace */
export const ORB_PHASES = {
  idle: {
    flow: 0.5,
    speed: 0.32,
    spin: 0.1,
    blobEnergy: 0.2,
    glow: 0.95,
    loading: 0,
    waves: 0,
    palette: BASE,
    hot: "#572886",
  },
  entering: {
    flow: 0.7,
    speed: 0.6,
    spin: 0.14,
    blobEnergy: 0.45,
    glow: 1,
    loading: 0,
    waves: 0,
    palette: BASE,
    hot: "#572886",
  },
  listening: {
    flow: 0.5,
    speed: 0.32,
    spin: 0.1,
    blobEnergy: 0.5,
    glow: 1,
    loading: 0,
    waves: 0,
    palette: BASE,
    hot: "#572886",
  },
  thinking: {
    flow: 1.4,
    speed: 1.5,
    spin: 0.3,
    blobEnergy: 0.7,
    glow: 1.1,
    loading: 1,
    waves: 0,
    palette: ["#b07cff", "#9c6bff", "#6c9cff", "#c08cff"],
    hot: "#efe8ff",
  },
  speaking: {
    flow: 1.2,
    speed: 0.8,
    spin: 0.18,
    blobEnergy: 1,
    glow: 1.15,
    loading: 0,
    waves: 1,
    palette: ["#ff4fd8", "#9c6bff", "#54c8ff", "#ff8ad0"],
    hot: "#fff0fa",
  },
  sleeping: {
    flow: 0.12,
    speed: 0.1,
    spin: 0.04,
    blobEnergy: 0.1,
    glow: 0.4,
    loading: 0,
    waves: 0,
    palette: ["#8a7ab0", "#7a6aa0", "#8a8ab8", "#9a8ab8"],
    hot: "#b8c0e0",
  },
  exiting: {
    flow: 0.6,
    speed: 0.5,
    spin: 0.12,
    blobEnergy: 0.3,
    glow: 0.8,
    loading: 0,
    waves: 0,
    palette: BASE,
    hot: "#572886",
  },
} satisfies Record<string, PhaseLook>;

export type OrbPhase = keyof typeof ORB_PHASES;

const VOICE_HIST = 64;
const HIST_DT = 0.025;
const BLOOM = { downscale: 4, intensity: 0.15, threshold: 0.55, glowAlpha: 0.5 };

export type OrbScene = NonNullable<Awaited<ReturnType<typeof createOrbScene>>>;

/** The orb drawing into `canvas`; null without WebGL */
export async function createOrbScene(canvas: HTMLCanvasElement) {
  const THREE = await import("three");

  let renderer: InstanceType<typeof THREE.WebGLRenderer>;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);

  // Lighter on phones and tablets, as there
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const renderScale = coarse ? 0.6 : 0.7;

  // ---------- The orb ----------
  const pal = BASE.map((hex) => new THREE.Color(hex));
  const colorHot = new THREE.Color("#572886");
  const voiceHist = new Float32Array(VOICE_HIST);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOrbAspect: { value: 1 },
      uFlow: { value: 0.5 },
      uEnergy: { value: 0.3 },
      uGlow: { value: 0.8 },
      uLoading: { value: 0 },
      uSteps: { value: coarse ? 36 : 48 },
      uRotPhase: { value: 0 },
      uDomainPhase: { value: 0 },
      uTiltPhase: { value: 0 },
      uWave: { value: 0 },
      uRaw: { value: 0 },
      uInk: { value: 1 },
      uHistDt: { value: HIST_DT },
      uPal: { value: pal },
      uColorHot: { value: colorHot },
      uColorAccent: { value: new THREE.Color("#9047ff") },
      uVoiceHist: { value: voiceHist },
      uPointer: { value: new THREE.Vector2() },
    },
    vertexShader: ORB_VERTEX,
    fragmentShader: ORB_FRAGMENT,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const plane = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(plane, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });

  // ---------- Bloom ----------
  const bloomOptions = {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  };
  const rtA = new THREE.WebGLRenderTarget(1, 1, bloomOptions);
  const rtB = new THREE.WebGLRenderTarget(1, 1, bloomOptions);
  const pass = { depthTest: false, depthWrite: false, blending: THREE.NoBlending, vertexShader: QUAD_VERTEX };
  const bright = new THREE.ShaderMaterial({
    ...pass,
    fragmentShader: BRIGHT_FRAGMENT,
    uniforms: { uTexture: { value: null }, uThreshold: { value: BLOOM.threshold }, uSmoothing: { value: 0.25 } },
  });
  const blur = new THREE.ShaderMaterial({
    ...pass,
    fragmentShader: BLUR_FRAGMENT,
    uniforms: {
      uTexture: { value: null },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    },
  });
  const composite = new THREE.ShaderMaterial({
    ...pass,
    fragmentShader: COMPOSITE_FRAGMENT,
    uniforms: {
      uScene: { value: null },
      uBloom: { value: null },
      uIntensity: { value: BLOOM.intensity },
      uGlowAlpha: { value: BLOOM.glowAlpha },
    },
  });
  const quadScene = new THREE.Scene();
  const quad = new THREE.Mesh(plane, bright);
  quad.frustumCulled = false;
  quadScene.add(quad);

  const drawPass = (passMaterial: InstanceType<typeof THREE.ShaderMaterial>, target: typeof rtA | null) => {
    quad.material = passMaterial;
    renderer.setRenderTarget(target);
    renderer.render(quadScene, camera);
  };

  // ---------- Motion (their orb's update, as is) ----------
  const look = { flow: 0.5, speed: 0.4, spin: 0.1, blobEnergy: 0.3, glow: 0.8, loading: 0 };
  let waveGain = 0;
  let uTime = 0;
  let rotPhase = 0;
  let domainPhase = 0;
  let tiltPhase = 0;
  let mic = 0;
  let agent = 0;
  let rawAgent = 0;
  let voiceSmooth = 0;
  let rawSmooth = 0;
  let histAccum = 0;
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  let lookTween: gsap.core.Tween | undefined;
  let paletteTween: gsap.core.Tween | undefined;

  const onPointer = (event: PointerEvent) =>
    pointerTarget.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  window.addEventListener("pointermove", onPointer);

  const size = new THREE.Vector2();
  const resize = () => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * renderScale);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.getDrawingBufferSize(size);
    sceneTarget.setSize(size.x, size.y);
    const w = Math.max(1, Math.floor(size.x / BLOOM.downscale));
    const h = Math.max(1, Math.floor(size.y / BLOOM.downscale));
    rtA.setSize(w, h);
    rtB.setSize(w, h);
    blur.uniforms.uResolution.value.set(w, h);
    material.uniforms.uOrbAspect.value = size.x / size.y;
  };
  resize();

  return {
    resize,

    /** Eases into a phase's look and colours (at once when `instant`) */
    setPhase(phase: OrbPhase, instant = false) {
      const next = ORB_PHASES[phase];
      waveGain = next.waves;
      const values = {
        flow: next.flow,
        speed: next.speed,
        spin: next.spin,
        blobEnergy: next.blobEnergy,
        glow: next.glow,
        loading: next.loading,
      };
      const colors = [...pal, colorHot];
      const targets = [...next.palette, next.hot].map((hex) => new THREE.Color(hex));
      lookTween?.kill();
      paletteTween?.kill();
      if (instant) {
        Object.assign(look, values);
        colors.forEach((color, i) => color.copy(targets[i]!));
        return;
      }
      lookTween = gsap.to(look, { ...values, duration: 0.7, ease: "power2.inOut" });
      const from = colors.map((color) => color.clone());
      const mix = { t: 0 };
      paletteTween = gsap.to(mix, {
        t: 1,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => colors.forEach((color, i) => color.copy(from[i]!).lerp(targets[i]!, mix.t)),
      });
    },

    /** The microphone's level and the reply's (smoothed, and raw for the ripple), 0–1 */
    setVoice(micLevel: number, agentLevel: number, raw = agentLevel) {
      mic = micLevel;
      agent = agentLevel;
      rawAgent = raw;
    },

    update(dt: number) {
      const voice = Math.max(mic, agent);
      voiceSmooth += (voice - voiceSmooth) * 0.12;
      rawSmooth += (rawAgent - rawSmooth) * 0.18;
      pointer.x += (pointerTarget.x - pointer.x) * 0.06;
      pointer.y += (pointerTarget.y - pointer.y) * 0.06;
      const step = dt * (0.5 + look.speed * 0.6 + voiceSmooth * 0.08);
      uTime += step;
      const flow = look.flow * (1 + voiceSmooth * 0.12);
      rotPhase += step * (0.12 + look.speed * 0.45);
      domainPhase += step * (0.04 + flow * 0.04);
      tiltPhase += step * look.spin * 0.25;

      const u = material.uniforms;
      u.uTime.value = uTime;
      u.uFlow.value = flow;
      u.uRotPhase.value = rotPhase;
      u.uDomainPhase.value = domainPhase;
      u.uTiltPhase.value = tiltPhase;
      u.uEnergy.value = look.blobEnergy;
      u.uGlow.value = look.glow;
      u.uLoading.value = look.loading;
      u.uWave.value = waveGain;
      u.uRaw.value = rawSmooth;
      u.uPointer.value.set(pointer.x, pointer.y);
      // The voice's recent history, newest first, for the ripple running outward
      for (histAccum += dt; histAccum >= HIST_DT; histAccum -= HIST_DT) {
        voiceHist.copyWithin(1, 0, VOICE_HIST - 1);
        voiceHist[0] = rawAgent * waveGain;
      }
    },

    render() {
      renderer.setRenderTarget(sceneTarget);
      renderer.clear();
      renderer.render(scene, camera);
      // Bloom: bright → blur across → blur down → composite onto the canvas
      bright.uniforms.uTexture.value = sceneTarget.texture;
      drawPass(bright, rtA);
      blur.uniforms.uTexture.value = rtA.texture;
      blur.uniforms.uDirection.value.set(1, 0);
      drawPass(blur, rtB);
      blur.uniforms.uTexture.value = rtB.texture;
      blur.uniforms.uDirection.value.set(0, 1);
      drawPass(blur, rtA);
      composite.uniforms.uScene.value = sceneTarget.texture;
      composite.uniforms.uBloom.value = rtA.texture;
      drawPass(composite, null);
    },

    dispose() {
      window.removeEventListener("pointermove", onPointer);
      lookTween?.kill();
      paletteTween?.kill();
      [material, bright, blur, composite].forEach((m) => m.dispose());
      [sceneTarget, rtA, rtB].forEach((target) => target.dispose());
      plane.dispose();
      renderer.dispose();
    },
  };
}
