/**
 * Inversion context preference — score inversions by harmonic context.
 *
 * Root position chords provide stability (good for tonic/cadential moments).
 * First inversion provides smooth bass motion (good for passing chords).
 * Second inversion creates suspension-like instability (good for pre-cadence).
 * This module scores each inversion based on harmonic context.
 *
 * Applied as voicing selection weight for harmony layer.
 */

import type { Mood } from '../types';

/**
 * Per-mood inversion freedom (higher = more inversions allowed).
 */
const INVERSION_FREEDOM: Record<Mood, number> = {
  trance:    0.20,  // low — root position heavy
  avril:     0.55,  // high — classical inversions
  disco:     0.25,  // low — strong roots
  downtempo: 0.45,  // moderate
  blockhead: 0.15,  // low — simple
  lofi:      0.60,  // highest — jazz voicings
  flim:      0.50,  // moderate
  xtal:      0.45,  // moderate
  syro:      0.35,  // moderate
  ambient:   0.40,  // moderate — open voicings
};

/**
 * Score an inversion choice given harmonic context.
 *
 * @param inversion 0 = root position, 1 = first, 2 = second
 * @param isTonicChord Whether this is a tonic (I) chord
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @returns Score (0.0 - 1.0)
 */
export function inversionScore(
  inversion: number,
  isTonicChord: boolean,
  sectionProgress: number,
  mood: Mood
): number {
  const freedom = INVERSION_FREEDOM[mood];

  // Base scores by inversion
  let base: number;
  if (inversion === 0) {
    base = isTonicChord ? 0.9 : 0.6; // root strong for tonic
  } else if (inversion === 1) {
    base = isTonicChord ? 0.4 : 0.8; // 1st good for passing
  } else {
    base = isTonicChord ? 0.3 : 0.5; // 2nd = pre-cadential
  }

  // Pre-cadential area (late in section) favors second inversion
  if (sectionProgress > 0.8 && inversion === 2) {
    base += 0.2;
  }

  // Scale by freedom — low freedom pushes toward root position
  const freedomBonus = inversion === 0 ? (1 - freedom) * 0.3 : freedom * 0.2;

  return Math.max(0, Math.min(1, base + freedomBonus));
}

/**
 * Gain adjustment for non-root-position voicings.
 *
 * @param inversion Current inversion (0, 1, 2)
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.05)
 */
export function inversionGainAdjustment(
  inversion: number,
  mood: Mood
): number {
  if (inversion === 0) return 1.0;
  const freedom = INVERSION_FREEDOM[mood];
  // Less freedom = more gain reduction for inversions
  const penalty = (1 - freedom) * 0.1;
  return Math.max(0.90, 1.0 - penalty);
}

/**
 * Get inversion freedom for a mood (for testing).
 */
export function inversionFreedom(mood: Mood): number {
  return INVERSION_FREEDOM[mood];
}
