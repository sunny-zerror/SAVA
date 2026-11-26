/*
 * The assistant orb's shaders, ported from emotion-agency.com's voice orb: a gyroid volume raymarched
 * inside a sphere (renderBody), three noisy corona rings round it (renderAura), a ripple fed by the
 * voice history (voiceRipple) and a comet circling while it thinks (loadingComet). The bloom passes
 * light what's brightest. Driven by src/lib/assistant/orb-scene.ts.
 */

export const ORB_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ORB_FRAGMENT = /* glsl */ `
uniform float uOrbAspect;
uniform float uTime;
uniform float uFlow;
uniform float uEnergy;
uniform float uGlow;
uniform float uLoading;
uniform float uWave;
uniform float uRaw;
uniform float uInk;
uniform int uSteps;
uniform float uRotPhase;
uniform float uDomainPhase;
uniform float uTiltPhase;
uniform float uHistDt;
uniform vec3 uPal[4];
uniform vec3 uColorHot;
uniform vec3 uColorAccent;
uniform float uVoiceHist[64];
uniform vec2 uPointer;

varying vec2 vUv;

const float CORE_R = 1.45;
const float SCREEN_CORE = 0.72;
const float WAVE_SPEED = 0.55;
const float EDGE_FADE = 0.3;
const float ORB_FILL = 1.15;

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3(p3.x + p3.y, p3.x + p3.z, p3.y + p3.z) * p3.zyx);
}

float snoise3(vec3 p) {
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;
  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 d1 = d0 - (i1 - K2);
  vec3 d2 = d0 - (i2 - K1);
  vec3 d3 = d0 - 0.5;
  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));
  return dot(vec4(31.316), n);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

vec3 coronaRamp(float t) {
  t = fract(t) * 4.0;
  vec3 c = mix(uPal[0], uPal[1], smoothstep(0.0, 1.0, t));
  c = mix(c, uPal[2], smoothstep(1.0, 2.0, t));
  c = mix(c, uPal[3], smoothstep(2.0, 3.0, t));
  return mix(c, uPal[0], smoothstep(3.0, 4.0, t));
}

vec3 bodyRamp(float t) {
  vec3 blueP = mix(uPal[1], uPal[2], 0.4);
  vec3 purp = uPal[1];
  vec3 mag = mix(uPal[0], uPal[1], 0.2);
  t = fract(t) * 3.0;
  float f = smoothstep(0.0, 1.0, fract(t));
  int i = int(t);
  vec3 c0 = blueP, c1 = purp;
  if(i == 1) {
    c0 = purp;
    c1 = mag;
  } else if(i >= 2) {
    c0 = mag;
    c1 = blueP;
  }
  return mix(c0, c1, f);
}

float map(vec3 p, mat2 rA, mat2 rB) {
  float d = 100.0;
  float scale = 0.4;
  p += vec3(12.6, 4.4, 5.569);
  p *= 2.4;
  for(int i = 1; i < 4; i++) {
    p.xy *= rA;
    p.yz *= rB;
    float dotp = dot(sin(p), cos(p.zxy));
    float gyroid = sqrt(dotp * dotp + 0.055) - 0.137;
    d = smin(d, gyroid / abs(scale), 0.15);
    p *= 0.76;
    scale *= 2.196;
    p += vec3(-1.7, 1.2, 3.5);
  }
  return d;
}

vec4 auraLayer(
  vec2 dir,
  float ang,
  float sr,
  float seed,
  float baseScale,
  float deformAmp,
  float angOff,
  float swirl,
  float morph,
  float thick
) {
  float wob = snoise3(vec3(dir * 0.85 + seed, morph));

  float deform = deformAmp + uFlow * 0.03 + uRaw * uWave * 0.11;
  float swell = uRaw * uWave * 0.06;
  float outerR = SCREEN_CORE * baseScale + swell + wob * deform;
  float innerR = SCREEN_CORE * 0.74 + wob * deform * 0.25;

  float band = (1.0 - smoothstep(outerR - SCREEN_CORE * thick, outerR, sr)) *
    smoothstep(innerR, innerR + SCREEN_CORE * 0.16, sr);
  float t1 = ang / 6.2831853 + swirl + angOff + wob * 0.03;
  vec3 c = coronaRamp(t1);
  float innerMix = 1.0 - smoothstep(innerR, innerR + SCREEN_CORE * 0.32, sr);
  c = mix(c, mix(uPal[1], uPal[0], 0.3), innerMix * 0.55);
  return vec4(c * band, band);
}

float histSample(float age) {
  float fi = min(age / uHistDt, 63.0 - 0.001);
  int i0 = int(fi);
  int i1 = i0 + 1;
  if(i1 > 63)
    i1 = 63;
  float env = mix(uVoiceHist[i0], uVoiceHist[i1], fract(fi));
  return env * (1.0 - fi / 63.0);
}

void cameraRay(vec2 uv, out vec3 ro, out vec3 rd) {
  ro = vec3(0.0, 0.0, 5.0);
  rd = normalize(vec3(uv * 0.42, -1.0));
  float ry = -uPointer.y * 0.18;
  float rx = uPointer.x * 0.18 + uTiltPhase;
  ro.yz *= rot(ry);
  rd.yz *= rot(ry);
  ro.xz *= rot(rx);
  rd.xz *= rot(rx);
  ro.xz *= rot(uRotPhase);
  rd.xz *= rot(uRotPhase);
}

vec4 renderBody(vec3 ro, vec3 rd) {
  float sphB = dot(ro, rd);
  float sphC = dot(ro, ro) - CORE_R * CORE_R;
  float disc = sphB * sphB - sphC;
  float edgeAA = clamp(disc / max(fwidth(disc), 1e-5) + 0.5, 0.0, 1.0);
  if(edgeAA <= 0.001)
    return vec4(0.0);

  vec3 lightDir = normalize(vec3(-0.3, 0.5, 0.45));
  float hh = sqrt(max(disc, 0.0));
  float tN = max(0.0, -sphB - hh);
  float tF = -sphB + hh;

  vec3 hp = ro + rd * tN;
  vec3 sn = normalize(hp);
  float facing = clamp(dot(sn, -rd), 0.0, 1.0);

  float dens = 0.0;
  float ridge = 0.0;
  vec3 colAccum = vec3(0.0);

  if(disc > 0.0) {

    float slab = tF - tN;
    float dtMax = (2.0 * CORE_R) / float(uSteps);
    int localSteps = int(ceil(clamp(slab / dtMax, 1.0, float(uSteps))));
    float dt = slab / float(localSteps);
    float stepScale = float(uSteps) / float(localSteps);
    float t = tN + hash(gl_FragCoord.xy) * dt;
    float gi = 0.004 + uEnergy * 0.005;

    mat2 rA = rot(uDomainPhase + 0.2);
    mat2 rB = rot(uDomainPhase * 1.5 - 0.1);
    for(int i = 0; i < 96; i++) {
      if(i >= localSteps)
        break;
      vec3 p = ro + rd * t;

      float d = map(p * vec3(1.25, 0.78, 1.0), rA, rB);
      float dist = length(p);
      float fade = 1.0 - smoothstep(CORE_R - EDGE_FADE, CORE_R, dist);
      float fil = gi / (abs(d) + 0.09);

      float rg = 1.0 - smoothstep(0.0, 0.08, abs(d));
      float lit = 0.5 + 0.5 * max(dot(normalize(p), lightDir), 0.0);
      float base = 0.003 * lit;
      float dd = (fil + base) * fade;
      float cphase = dist * 0.5 - uTime * 0.04 + d * 1.3;
      vec3 sc = bodyRamp(cphase) * mix(0.65, 1.45, smoothstep(0.3, 1.0, lit));
      colAccum += sc * dd * stepScale;
      dens += dd * stepScale;
      ridge += rg * fade * stepScale;
      t += dt;
    }
  }
  vec3 bodyCol = colAccum * 0.92;

  bodyCol += mix(uPal[0], uColorHot, 0.55) * smoothstep(0.3, 2.2, ridge) * 0.6;

  float fres = pow(1.0 - facing, 3.5);
  bodyCol += mix(uPal[2], uColorHot, 0.4) * fres * (0.9 + uGlow * 0.4);

  float innerFres = pow(1.0 - facing, 8.0);
  bodyCol += uColorHot * innerFres * 0.55;

  float spec = pow(max(dot(reflect(rd, sn), lightDir), 0.0), 90.0);
  bodyCol += uColorHot * spec * 1.3;

  float bodyMask = smoothstep(0.0, 0.22, dens);
  return vec4(bodyCol * edgeAA, max(bodyMask, fres * 0.85) * edgeAA);
}

vec4 renderAura(vec2 uv, float sr) {
  if(sr <= SCREEN_CORE * 0.5 || sr >= SCREEN_CORE * 1.55)
    return vec4(0.0);
  vec2 dir = sr > 1e-4 ? uv / sr : vec2(1.0, 0.0);
  float ang = atan(uv.y, uv.x);
  float breathe = sin(uTime * 1.1) * 0.02;
  float swirl = uRotPhase * 0.1;
  float morph = uRotPhase * 0.8;
  vec4 aura = vec4(0.0);

  aura += auraLayer(dir, ang, sr, 0.0, 1.04 + breathe, 0.07, 0.0, swirl, morph, 0.18);
  aura += auraLayer(dir, ang, sr, 13.7, 1.12, 0.06, 0.34, swirl, morph + 4.0, 0.2) * 0.9;
  aura += auraLayer(dir, ang, sr, 27.4, 1.2, 0.08, 0.66, swirl, morph + 9.0, 0.16) * 0.75;
  return vec4(aura.rgb, clamp(aura.a, 0.0, 1.0) * 0.9);
}

vec4 voiceRipple(float sr) {
  if(uWave <= 0.001)
    return vec4(0.0);
  float d2 = max(sr - SCREEN_CORE, 0.0);

  float reach = 1.0 - smoothstep(ORB_FILL - 0.22, ORB_FILL, sr);
  float wave = smoothstep(0.05, 0.5, histSample(d2 / WAVE_SPEED)) * exp(-d2 * 3.2) * reach;
  return vec4(uPal[1] * wave * uWave * 0.3, wave * uWave * 0.4);
}

vec4 loadingComet(vec2 uv, float sr) {
  if(uLoading <= 0.01)
    return vec4(0.0);
  float orbitR = SCREEN_CORE * 1.18;
  float head = -uRotPhase * 2.0;
  float a = atan(uv.y, uv.x);
  float behind = mod(a - head, 6.2831853);
  float band = exp(-pow((sr - orbitR) / (SCREEN_CORE * 0.05), 2.0));
  float comet = band * exp(-behind * 2.2);
  return vec4(uColorAccent * comet * uLoading * 1.3, comet * uLoading);
}

vec3 gradeAndTone(vec3 col, float sr, inout float alpha) {
  col *= uGlow;
  float disk = 1.0 - smoothstep(SCREEN_CORE - 0.18, SCREEN_CORE + 0.04, sr);
  alpha = max(alpha, disk * uInk * 0.92);
  col = mix(col / (1.0 + col), col, uInk * 0.5);
  col = pow(max(col, 0.0), vec3(0.4545));

  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(luma), col, 1.5), 0.0, 1.0);
  return col * 0.9;
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0 * ORB_FILL;
  uv.x *= uOrbAspect;
  float sr = length(uv);

  vec3 ro, rd;
  cameraRay(uv, ro, rd);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  vec4 body = renderBody(ro, rd);
  col += body.rgb;
  alpha = max(alpha, body.a);

  vec4 aura = renderAura(uv, sr);
  col += aura.rgb;
  alpha = max(alpha, aura.a);

  vec4 ripple = voiceRipple(sr);
  col += ripple.rgb;
  alpha = max(alpha, ripple.a);

  vec4 comet = loadingComet(uv, sr);
  col += comet.rgb;
  alpha = max(alpha, comet.a);

  col = gradeAndTone(col, sr, alpha);
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

/** Full-screen quad for the bloom passes */
export const QUAD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** Keeps what's brighter than the threshold */
export const BRIGHT_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform float uThreshold;
uniform float uSmoothing;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uTexture, vUv);
  float br = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  float k = smoothstep(uThreshold - uSmoothing, uThreshold + uSmoothing, br);
  gl_FragColor = vec4(c.rgb * k, 1.0);
}
`;

/** A nine-tap blur along one direction */
export const BLUR_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uDirection;
uniform vec2 uResolution;
varying vec2 vUv;
void main() {
  vec2 t = uDirection / uResolution;
  vec4 s = vec4(0.0);
  s += texture2D(uTexture, vUv - 4.0 * t) * 0.02;
  s += texture2D(uTexture, vUv - 3.0 * t) * 0.05;
  s += texture2D(uTexture, vUv - 2.0 * t) * 0.09;
  s += texture2D(uTexture, vUv - 1.0 * t) * 0.15;
  s += texture2D(uTexture, vUv) * 0.18;
  s += texture2D(uTexture, vUv + 1.0 * t) * 0.15;
  s += texture2D(uTexture, vUv + 2.0 * t) * 0.09;
  s += texture2D(uTexture, vUv + 3.0 * t) * 0.05;
  s += texture2D(uTexture, vUv + 4.0 * t) * 0.02;
  gl_FragColor = s * 1.25;
}
`;

/** The scene with its bloom added, the glow lending alpha where it spills past the orb */
export const COMPOSITE_FRAGMENT = /* glsl */ `
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uIntensity;
uniform float uGlowAlpha;
varying vec2 vUv;
void main() {
  vec4 s = texture2D(uScene, vUv);
  vec3 b = texture2D(uBloom, vUv).rgb;
  vec3 rgb = s.rgb + b * uIntensity;
  float a = clamp(s.a + dot(b, vec3(0.3333)) * uGlowAlpha, 0.0, 1.0);
  gl_FragColor = vec4(rgb, a);
}
`;
