/**
 * Accent rotation — rotate accent patterns across layers for variety.
 *
 * When every layer accents the same beat, it sounds heavy but static.
 * Rotating accents so different layers emphasize different beats
 * creates polyphonic rhythmic interest and prevents monotony.
 *
 * Applied as per-layer gain multiplier based on rotated accent position.
 */

import type { Mood } from '../types';

/**
 * Per-mood rotation depth (higher = more accent rotation between layers).
 */
const ROTATION_DEPTH: Record<Mood, number> = {
  trance:    0.20,  // low — unified downbeat
  avril:     0.35,  // moderate — orchestral interplay
  disco:     0.30,  // moderate — groove interlock
  downtempo: 0.45,  // moderate
  blockhead: 0.40,  // moderate — rhythmic interplay
  lofi:      0.50,  // high — jazz conversation
  flim:      0.55,  // high — delicate interplay
  xtal:      0.45,  // moderate
  syro:      0.60,  // highest — maximal rotation
  ambient:   0.25,  // low — gentle
};

/**
 * Layer rotation offsets (in 16th notes).
 */
const LAYER_OFFSETS: Record<string, number> = {
  drone: 0,
  harmony: 0,
  melody: 2,
  texture: 4,
  arp: 6,
  atmosphere: 1,
};

/**
 * Calculate accent gain for a layer at a given beat.
 *
 * @param beatPosition Global beat position (0-15)
 * @param layerName Layer identifier
 * @param mood Current mood
 * @returns Gain multiplier (0.88 - 1.12)
 */
export function rotatedAccentGain(
  beatPosition: number,
  layerName: string,
  mood: Mood
): number {
  const depth = ROTATION_DEPTH[mood];
  const offset = LAYER_OFFSETS[layerName] ?? 0;
  const rotatedPos = ((beatPosition - offset) % 16 + 16) % 16;

  // Accent pattern: strong on 0, medium on 4/8/12, weak elsewhere
  let accentStrength: number;
  if (rotatedPos === 0) accentStrength = 1.0;
  else if (rotatedPos === 8) accentStrength = 0.7;
  else if (rotatedPos === 4 || rotatedPos === 12) accentStrength = 0.5;
  else accentStrength = 0.2;

  const deviation = (accentStrength - 0.5) * depth * 0.5;
  return Math.max(0.88, Math.min(1.12, 1.0 + deviation));
}

/**
 * Get rotation depth for a mood (for testing).
 */
export function rotationDepth(mood: Mood): number {
  return ROTATION_DEPTH[mood];
}
