/*
 * Spin state for a 3D SAVA stick (HomeModel, FooterModel): an optional idle spin, a hover spin,
 * drag with inertia (plus a forward/back tip that springs back), and — whenever nothing is turning
 * it — an ease round to the nearest front-facing turn.
 */

export const AUTO_SPIN = 0.6; // rad/s idle spin
export const HOVER_SPIN = 1.6; // rad/s while hovered
export const TURN = Math.PI * 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface Turntable {
  angle: number;
  velocity: number;
  tip: number;
  tipTarget: number;
  hover: number; // 0–1, eased
  hovered: boolean;
}

export const turntable = (): Turntable => ({ angle: 0, velocity: 0, tip: 0, tipTarget: 0, hover: 0, hovered: false });

/** Advance a turntable by dt (seconds). `idle` (0–1) is how much of the idle spin applies. */
export function turn(t: Turntable, dt: number, idle: number, dragging: boolean) {
  t.hover = lerp(t.hover, t.hovered ? 1 : 0, 1 - Math.exp(-dt * 5));
  t.tip = lerp(t.tip, t.tipTarget, 1 - Math.exp(-dt * 8));
  if (dragging) return;

  t.velocity = lerp(t.velocity, 0, 1 - Math.exp(-dt * 3));
  t.angle += (AUTO_SPIN * idle + HOVER_SPIN * t.hover + t.velocity) * dt;

  // Not spinning on its own (and the flick has died down) → ease round to the nearest front-facing turn
  const free = (1 - Math.max(idle, t.hover)) * (Math.abs(t.velocity) < 0.6 ? 1 : 0);
  t.angle = lerp(t.angle, Math.round(t.angle / TURN) * TURN, free * (1 - Math.exp(-dt * 4)));
}

/** Drag a turntable by a pointer move (dx, dy in px, dtMs since the last move) */
export function drag(t: Turntable, dx: number, dy: number, dtMs: number) {
  t.angle += dx * 0.012;
  t.velocity = (dx * 0.012) / Math.max(dtMs / 1000, 0.008);
  t.tipTarget = Math.max(-0.5, Math.min(0.5, t.tipTarget + dy * 0.006));
}
