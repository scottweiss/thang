/**
 * Harmonic color — FM synthesis parameters that respond to harmonic tension.
 *
 * In acoustic instruments, timbre naturally reflects harmonic context:
 * consonant intervals produce pure, singing tones while dissonant
 * intervals create beating and roughness. We can replicate this with FM:
 *
 * - Low tension: integer fmh ratios (1, 2, 3) → pure, harmonic tones
 * - Medium tension: simple ratios (1.5, 2.5) → warm, slightly complex
 * - High tension: non-integer ratios (1.414, 2.76) → inharmonic, bell-like
 *
 * This creates a synesthetic connection: listeners literally HEAR
 * the harmonic tension in the timbre, not just the notes.
 */

import type { Mood } from '../types';

/**
 * Compute an FM harmonicity ratio that reflects current tension.
 * Returns a value to use as .fmh() parameter.
 *
 * @param baseFmh     The mood's default fmh ratio
 * @param tension     Overall tension (0-1)
 * @param mood        Current mood (controls how much timbre responds)
 * @returns Adjusted fmh ratio
 */
export function tensionFmh(
  baseFmh: number,
  tension: number,
  mood: Mood
): number {
  const depth = MOOD_COLOR_DEPTH[mood];
  if (depth < 0.01) return baseFmh;

  // At low tension, snap toward nearest integer (pure harmonics)
  // At high tension, drift toward inharmonic ratios
  const nearestInt = Math.round(baseFmh);
  const deviation = baseFmh - nearestInt;

  // Low tension: pull toward integer
  // High tension: push away from integer
  const t = Math.max(0, Math.min(1, tension));
  const pull = (0.5 - t) * 2 * depth; // positive at low tension, negative at high

  // Inharmonic drift at high tension: add a non-integer offset
  const inharmonicOffset = t > 0.6
    ? (t - 0.6) * 0.8 * depth * (baseFmh > 2 ? 1 : -1)
    : 0;

  const adjusted = baseFmh + (nearestInt - baseFmh) * pull * 0.5 + inharmonicOffset;
  return Math.max(0.5, adjusted);
}

/**
 * Compute an FM index multiplier based on tension.
 * Higher tension = more FM modulation = brighter, more complex timbre.
 *
 * @param tension  Overall tension (0-1)
 * @param mood     Current mood
 * @returns FM index multiplier (0.7 - 1.4)
 */
export function tensionFmIndex(tension: number, mood: Mood): number {
  const depth = MOOD_COLOR_DEPTH[mood];
  if (depth < 0.01) return 1.0;

  // Low tension: reduce FM index (warmer, simpler)
  // High tension: increase FM index (brighter, more complex)
  const t = Math.max(0, Math.min(1, tension));
  return 1.0 + (t - 0.5) * 0.6 * depth;
}

/**
 * Should harmonic color modulation be applied?
 */
export function shouldApplyHarmonicColor(mood: Mood): boolean {
  return MOOD_COLOR_DEPTH[mood] > 0.05;
}

/**
 * How deeply timbre responds to tension for each mood.
 * 0 = fixed timbre, 1 = maximum timbral variation.
 */
const MOOD_COLOR_DEPTH: Record<Mood, number> = {
  ambient:   0.6,    // rich timbral movement
  xtal:      0.5,    // dreamy color shifts
  flim:      0.5,    // delicate timbral expression
  avril:     0.4,    // subtle warmth variation
  downtempo: 0.4,    // warm color changes
  lofi:      0.3,    // some color (GM instruments less affected)
  syro:      0.7,    // maximum timbral complexity
  blockhead: 0.3,    // hip-hop — more stable timbre
  trance:    0.2,    // timbre should be consistent
  disco:     0.2,    // groove-focused, stable timbre
};
