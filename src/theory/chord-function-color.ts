/**
 * Chord function color — tonic/subdominant/dominant get unique FM character.
 *
 * Each harmonic function has a distinct sonic character:
 * - Tonic: warm, settled (low FM)
 * - Subdominant: open, expansive (moderate FM)
 * - Dominant: tense, bright (high FM)
 *
 * This timbral differentiation makes functional harmony audible.
 */

import type { Mood } from '../types';

/**
 * Per-mood function coloring intensity.
 */
const COLORING_INTENSITY: Record<Mood, number> = {
  trance:    0.45,  // moderate
  avril:     0.60,  // highest — classical function clarity
  disco:     0.35,  // moderate
  downtempo: 0.50,  // high
  blockhead: 0.30,  // low
  lofi:      0.55,  // high — jazz function awareness
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.20,  // low — functions blurred
  ambient:   0.30,  // moderate — gentle coloring
};

type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant' | 'other';

/**
 * Map chord degree to harmonic function.
 */
function degreeToFunction(degree: number): HarmonicFunction {
  const d = ((degree - 1) % 7 + 7) % 7 + 1;
  if (d === 1 || d === 3 || d === 6) return 'tonic';
  if (d === 2 || d === 4) return 'subdominant';
  if (d === 5 || d === 7) return 'dominant';
  return 'other';
}

/**
 * FM multiplier by harmonic function.
 */
const FUNCTION_FM: Record<HarmonicFunction, number> = {
  tonic:       0.85,  // warm — less FM
  subdominant: 1.00,  // neutral
  dominant:    1.15,  // bright — more FM
  other:       1.00,
};

/**
 * Calculate chord function FM multiplier.
 *
 * @param degree Chord degree (1-7)
 * @param mood Current mood
 * @returns FM multiplier (0.90 - 1.12)
 */
export function functionFmMultiplier(
  degree: number,
  mood: Mood
): number {
  const intensity = COLORING_INTENSITY[mood];
  const func = degreeToFunction(degree);
  const baseFm = FUNCTION_FM[func];

  // Blend toward 1.0 based on intensity (low intensity = less coloring)
  const multiplier = 1.0 + (baseFm - 1.0) * intensity;
  return Math.max(0.90, Math.min(1.12, multiplier));
}

/**
 * Get coloring intensity for a mood (for testing).
 */
export function coloringIntensity(mood: Mood): number {
  return COLORING_INTENSITY[mood];
}
