/**
 * Tension-responsive orchestration — dynamic layer balance based on tension.
 *
 * In a great mix, the relative prominence of layers shifts with intensity:
 * - Low tension: drone/atmosphere dominate, melody sparse, arp quiet
 * - Medium tension: balanced mix, all layers audible
 * - High tension: melody/arp push forward, drone recedes, harmony brightens
 *
 * This creates a cinematic quality where the "camera" shifts focus
 * based on emotional intensity, rather than all layers being equally
 * loud at all times.
 *
 * Applied as a gain multiplier per layer, combined with existing
 * section-based multipliers.
 */

import type { Mood } from '../types';

export type LayerName = 'drone' | 'harmony' | 'melody' | 'texture' | 'arp' | 'atmosphere';

/**
 * Per-layer gain multiplier based on tension level.
 * Returns a value typically between 0.7 and 1.3.
 *
 * @param layer    Layer name
 * @param tension  Overall tension (0-1)
 * @param mood     Current mood (some moods have flatter orchestration)
 * @returns Gain multiplier
 */
export function tensionOrchestrationGain(
  layer: string,
  tension: number,
  mood: Mood
): number {
  const depth = MOOD_ORCHESTRATION_DEPTH[mood];
  if (depth < 0.01) return 1.0;

  const curve = LAYER_TENSION_CURVES[layer as LayerName];
  if (!curve) return 1.0;

  // Interpolate the curve at the current tension point
  const rawMult = evaluateCurve(curve, tension);

  // Scale by mood depth: ambient has subtle orchestration, trance has more
  return 1.0 + (rawMult - 1.0) * depth;
}

/**
 * Should tension orchestration be applied?
 * All moods benefit to varying degrees.
 */
export function shouldApplyTensionOrchestration(mood: Mood): boolean {
  return MOOD_ORCHESTRATION_DEPTH[mood] > 0.01;
}

/**
 * Tension curve: maps tension (0-1) to gain multiplier.
 * Format: array of [tension, multiplier] breakpoints.
 * Linear interpolation between points.
 */
type TensionCurve = [number, number][];

/**
 * Each layer responds differently to tension:
 */
const LAYER_TENSION_CURVES: Record<LayerName, TensionCurve> = {
  // Drone: prominent at low tension, recedes at high tension
  drone: [
    [0.0, 1.15],
    [0.3, 1.05],
    [0.5, 1.0],
    [0.7, 0.90],
    [1.0, 0.80],
  ],

  // Harmony: relatively stable, slight boost at medium-high tension
  harmony: [
    [0.0, 0.90],
    [0.3, 0.95],
    [0.5, 1.0],
    [0.7, 1.05],
    [1.0, 1.0],
  ],

  // Melody: quiet at low tension, prominent at high tension
  melody: [
    [0.0, 0.80],
    [0.3, 0.90],
    [0.5, 1.0],
    [0.7, 1.10],
    [1.0, 1.20],
  ],

  // Texture/drums: builds with tension
  texture: [
    [0.0, 0.85],
    [0.3, 0.90],
    [0.5, 1.0],
    [0.7, 1.05],
    [1.0, 1.15],
  ],

  // Arp: most tension-responsive — quiet at rest, driving at peak
  arp: [
    [0.0, 0.75],
    [0.3, 0.85],
    [0.5, 1.0],
    [0.7, 1.10],
    [1.0, 1.25],
  ],

  // Atmosphere: inverse of melody — fills space when melody is sparse
  atmosphere: [
    [0.0, 1.20],
    [0.3, 1.10],
    [0.5, 1.0],
    [0.7, 0.90],
    [1.0, 0.80],
  ],
};

/**
 * How much orchestration depth each mood allows.
 * 0 = flat (all layers equal), 1 = maximum dynamic range.
 */
const MOOD_ORCHESTRATION_DEPTH: Record<Mood, number> = {
  ambient:   0.4,    // gentle shifting,
  plantasia: 0.4,
  downtempo: 0.6,    // moderate dynamics
  lofi:      0.5,    // warm dynamics
  trance:    0.7,    // dramatic orchestration
  avril:     0.5,    // intimate
  xtal:      0.4,    // dreamy
  syro:      0.6,    // complex dynamics
  blockhead: 0.7,    // cinematic
  flim:      0.5,    // delicate
  disco:     0.6,    // funky dynamics
};

/**
 * Linear interpolation along a tension curve.
 */
function evaluateCurve(curve: TensionCurve, tension: number): number {
  const t = Math.max(0, Math.min(1, tension));

  // Find surrounding breakpoints
  for (let i = 0; i < curve.length - 1; i++) {
    const [t0, v0] = curve[i];
    const [t1, v1] = curve[i + 1];
    if (t >= t0 && t <= t1) {
      const frac = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * frac;
    }
  }

  // Edge case: return last value
  return curve[curve.length - 1][1];
}
