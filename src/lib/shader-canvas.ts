import type * as Three from "three";

type THREE = typeof Three;

/*
 * Shared plumbing for the full-screen fragment-shader backgrounds (HeroCanvas, ReviewsCanvas):
 * three.js loaded on demand, one full-screen triangle pair, sizing, pointer, and a frame loop that
 * only draws while the canvas is on screen and the tab is visible. Each background supplies its
 * shader, uniforms and per-frame updates.
 */

export const FULLSCREEN_VERTEX = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/*
 * The SAVA aurora, as on zerrorstudios.com: a slow "plasma" of interfering sine waves — broad dark
 * and bright bands drifting over time, the pointer (uMouse) shifting the wave phases so the bands
 * slide and bend. plasma(p) returns the band value 0–1 at drawing-buffer position p; map it to colour.
 * Needs: uniform float uTime; uniform vec2 uMouse; uniform vec2 uResolution;
 */
export const PLASMA_GLSL = /* glsl */ `
  #define T (uTime * 3.0)
  #define X (uv.x * 32.0)
  #define Y (uv.y * 32.0)

  float plasma(vec2 p) {
    vec2 uv = (p - uResolution) / uResolution;
    vec2 m = uMouse;

    float c = sin(
      (X + m.x * 0.0092) / (20.0 + cos(T + 100.0) * 10.0) +
      (Y + m.y * 0.0115) / (25.0 + sin(T * 0.5) * 15.0)
    ) * sin(
      ((X + m.x * 0.01725) * cos(T) + (Y + m.y * 0.02875) * sin(T) * 1.5) * (0.025 + sin(T) * 0.05)
    );
    c += cos((X + m.x * 0.01725) * (0.075 + cos(T) * 0.025) + T) * abs(sin(Y * (0.05 + sin(T + 75.0) * 0.025)));

    return smoothstep(-1.0, 1.0, c);
  }
`;

export interface ShaderScene {
  fragmentShader: string;
  uniforms: Record<string, Three.IUniform>;
  /** Drawing-buffer pixels per CSS pixel for this viewport width (defaults: 1, or 0.5 on phones) */
  pixelScale?: (viewportWidth: number) => number;
  /** After every resize, with the drawing-buffer size and the scale in use */
  resize?: (size: Three.Vector2, scale: number) => void;
  /** Pointer position in drawing-buffer pixels, y up */
  pointer?: (x: number, y: number) => void;
  /** Pointer has left the page */
  leave?: () => void;
  /** Each drawn frame, before rendering; `ms` since the background started */
  frame?: (ms: number) => void;
}

/**
 * Mounts a shader background on `canvas`. `build` receives three.js once it has loaded; `onReady`
 * fires after the first frame (fade the canvas in then). Returns a cleanup. Without WebGL it does
 * nothing, so whatever sits behind the canvas stays.
 */
export function mountShaderCanvas(
  canvas: HTMLCanvasElement,
  build: (THREE: THREE) => ShaderScene,
  onReady: () => void,
) {
  let disposed = false;
  let cleanup = () => {};

  // Loaded on demand so three.js stays out of the page's first bundle
  import("three").then((THREE) => {
    if (disposed) return;

    let renderer: InstanceType<typeof THREE.WebGLRenderer>;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // No WebGL
    }

    const scene = build(THREE);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: scene.fragmentShader,
      uniforms: scene.uniforms,
    });
    const stage = new THREE.Scene();
    stage.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.Camera();

    let scale = 1;
    const size = new THREE.Vector2();
    const resize = () => {
      scale = scene.pixelScale?.(window.innerWidth) ?? (window.innerWidth < 768 ? 0.5 : 1);
      renderer.setPixelRatio(scale);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      scene.resize?.(renderer.getDrawingBufferSize(size), scale);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      scene.pointer?.((e.clientX - rect.left) * scale, (rect.bottom - e.clientY) * scale);
    };
    const onLeave = () => scene.leave?.();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let visible = true;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(canvas);

    const start = performance.now();
    let frame = 0;
    let first = true;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      scene.frame?.(performance.now() - start);
      renderer.render(stage, camera);
      if (first) {
        first = false;
        onReady();
      }
    };
    tick();

    cleanup = () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      // Free the context now, not at GC: browsers cap live WebGL contexts (~16) and kill the oldest
      // past that, and backgrounds that mount on demand (the open FAQ item's) come and go. Only once
      // the canvas is really gone — a lost context stays with its canvas, so an effect re-run on the
      // same element (Fast Refresh, StrictMode) would be left blank.
      if (!canvas.isConnected) renderer.forceContextLoss();
    };
  });

  return () => {
    disposed = true;
    cleanup();
  };
}
