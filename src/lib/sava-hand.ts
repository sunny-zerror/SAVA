import type * as Three from "three";

type THREE = typeof Three;

/** The rigged hand (WebXR generic hand; see public/models/hand/LICENSE.md) */
export const HAND_URL = "/models/hand/hand.glb";

/**
 * How the hand holds a SAVA stick (posed around the stick model by fingertip targets): its turn (rad,
 * Euler YXZ) and where its wrist sits, in stick heights from the stick's centre (x right, y up, z towards
 * the viewer). The model is in metres; a stick is about 11cm tall.
 */
export const HOLD = {
  rotation: [0.42, 1.57, 3.0] as const,
  offset: [0.08, -0.98, -0.38] as const,
  stickMetres: 0.11,
};

/**
 * The grip, as each joint's turn from the model's rest pose (local quaternion x, y, z, w): the thumb up the
 * stick's left side, index and middle fingertips under its front, ring and little fingers curled in
 */
const GRIP: Record<string, [number, number, number, number]> = {
  "thumb-metacarpal": [0.0406, -0.4284, 0.0438, 0.9016],
  "thumb-phalanx-proximal": [-0.0281, 0, 0, 0.9996],
  "thumb-phalanx-distal": [-0.0848, 0, 0, 0.9964],
  "index-finger-phalanx-proximal": [0.2644, 0, 0, 0.9644],
  "index-finger-phalanx-intermediate": [0.7833, 0, 0, 0.6216],
  "index-finger-phalanx-distal": [0.6052, 0, 0, 0.7961],
  "middle-finger-phalanx-proximal": [0.0402, 0, 0, 0.9992],
  "middle-finger-phalanx-intermediate": [0.7833, 0, 0, 0.6216],
  "middle-finger-phalanx-distal": [0.6052, 0, 0, 0.7961],
  "ring-finger-phalanx-proximal": [0.6442, 0, 0, 0.7648],
  "ring-finger-phalanx-intermediate": [0.6052, 0, 0, 0.7961],
  "ring-finger-phalanx-distal": [0.3894, 0, 0, 0.9211],
  "pinky-finger-phalanx-proximal": [0.6631, 0, 0, 0.7485],
  "pinky-finger-phalanx-intermediate": [0.6052, 0, 0, 0.7961],
  "pinky-finger-phalanx-distal": [0.3894, 0, 0, 0.9211],
};

const FINGERS = ["index", "middle", "ring", "pinky"];
const CHAINS = [
  ["wrist", "thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip"],
  ...FINGERS.map((f) => [
    "wrist",
    `${f}-finger-metacarpal`,
    `${f}-finger-phalanx-proximal`,
    `${f}-finger-phalanx-intermediate`,
    `${f}-finger-phalanx-distal`,
    `${f}-finger-tip`,
  ]),
];

/**
 * Loads the hand, in a warm skin with a soft sheen, its wrist fading out (so the cut end never shows), and
 * returns its root and `grip(amount)`: 0 an open hand, 1 holding the stick.
 */
export async function createSavaHand(THREE: THREE) {
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const gltf = await new GLTFLoader().loadAsync(HAND_URL);
  const model = gltf.scene;

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd29b7c,
    roughness: 0.62,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xff9c7a),
    sheenRoughness: 0.5,
    transparent: true,
  });
  // Fade the last few centimetres up to the wrist's cut (the model's own +y, in its rest pose)
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vWrist;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWrist = smoothstep(0.04, 0.072, position.y);");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vWrist;")
      .replace("#include <dithering_fragment>", "#include <dithering_fragment>\ngl_FragColor.a *= 1.0 - vWrist;");
  };

  const bones = new Map<string, Three.Bone>();
  model.traverse((object) => {
    const mesh = object as Three.SkinnedMesh;
    if (mesh.isSkinnedMesh) {
      mesh.material = material;
      mesh.frustumCulled = false;
    }
    if ((object as Three.Bone).isBone) bones.set(object.name, object as Three.Bone);
  });

  // The WebXR hand's joints all hang off its root (tracking places each one): chain them, keeping where
  // they are, so a knuckle carries the rest of its finger
  model.updateMatrixWorld(true);
  for (const chain of CHAINS) {
    for (let i = 1; i < chain.length; i++) {
      const parent = bones.get(chain[i - 1]);
      const child = bones.get(chain[i]);
      if (parent && child) parent.attach(child);
    }
  }

  const rest = new Map<string, Three.Quaternion>();
  const turns = new Map<string, Three.Quaternion>();
  bones.forEach((bone, name) => {
    rest.set(name, bone.quaternion.clone());
    const turn = GRIP[name];
    if (turn) turns.set(name, new THREE.Quaternion(...turn).normalize());
  });

  const open = new THREE.Quaternion();
  const step = new THREE.Quaternion();
  const grip = (amount: number) => {
    turns.forEach((turn, name) => {
      step.slerpQuaternions(open, turn, amount);
      bones.get(name)?.quaternion.copy(rest.get(name)!).multiply(step);
    });
  };

  const root = new THREE.Group();
  root.add(model);
  root.rotation.set(HOLD.rotation[0], HOLD.rotation[1], HOLD.rotation[2], "YXZ");
  grip(0);
  return { root, grip };
}

export type SavaHand = Awaited<ReturnType<typeof createSavaHand>>;
