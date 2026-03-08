/**
 * Melodic expectancy — Narmour-inspired implication-realization for melody.
 *
 * After a melodic interval, listeners expect certain continuations:
 * - Small interval → same direction (process)
 * - Large interval → reversal (reversal)
 * - Very large → return to middle register (regression)
 *
 * This module scores candidate notes by how well they fulfill or
 * violate expectations, allowing controlled surprise.
 *
 * Applied as a note selection weight multiplier.
 */

import type { Mood } from '../types';

/**
 * Per-mood conformity to expectation (higher = more predictable melody).
 */
const CONFORMITY: Record<Mood, number> = {
  trance:    0.65,  // high — predictable hooks
  avril:     0.55,  // moderate-high — classical phrase logic
  disco:     0.60,  // high — singable
  downtempo: 0.50,  // moderate
  blockhead: 0.40,  // moderate — some surprise
  lofi:      0.45,  // moderate — jazz wandering
  flim:      0.35,  // lower — Aphex unexpectedness
  xtal:      0.30,  // low — ambient drift
  syro:      0.20,  // lowest — IDM defies expectations
  ambient:   0.25,  // low — floating
};

/**
 * Score how well a candidate interval fulfills melodic expectancy.
 *
 * @param prevInterval Previous melodic interval in semitones (signed)
 * @param candidateInterval Proposed next interval in semitones (signed)
 * @param mood Current mood
 * @returns Weight multiplier (0.5 - 2.0)
 */
export function expectancyWeight(
  prevInterval: number,
  candidateInterval: number,
  mood: Mood
): number {
  const conform = CONFORMITY[mood];
  const absPrev = Math.abs(prevInterval);
  const absCandidate = Math.abs(candidateInterval);
  const sameDir = Math.sign(prevInterval) === Math.sign(candidateInterval);

  let score = 0.5; // baseline

  if (absPrev <= 4) {
    // Small interval → expect continuation in same direction
    if (sameDir && absCandidate <= 5) score = 1.0;
    else if (!sameDir && absCandidate <= 2) score = 0.8; // small reversal OK
    else score = 0.4;
  } else if (absPrev <= 7) {
    // Medium interval → expect reversal
    if (!sameDir && absCandidate <= 4) score = 1.0;
    else if (sameDir && absCandidate <= 2) score = 0.7; // deceleration OK
    else score = 0.3;
  } else {
    // Large interval → expect regression to center
    if (!sameDir && absCandidate <= 3) score = 1.0;
    else if (!sameDir) score = 0.7;
    else score = 0.2; // continuing large leaps is very surprising
  }

  // Blend score with neutral (1.0) based on conformity
  return 1.0 + (score - 0.5) * conform;
}

/**
 * Get conformity for a mood (for testing).
 */
export function expectancyConformity(mood: Mood): number {
  return CONFORMITY[mood];
}
