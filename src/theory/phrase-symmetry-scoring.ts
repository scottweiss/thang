/**
 * Phrase symmetry scoring — balanced phrase lengths get emphasis.
 *
 * Musical phrases often come in balanced pairs (4+4, 8+8 bars).
 * When phrase lengths are symmetric, the music feels more
 * organized and satisfying. This module scores phrase balance
 * and provides a gain emphasis for well-balanced phrases.
 */

import type { Mood } from '../types';

/**
 * Per-mood symmetry preference (higher = more emphasis on balance).
 */
const SYMMETRY_PREFERENCE: Record<Mood, number> = {
  trance:    0.60,  // high — needs structure
  avril:     0.55,  // high — classical balance
  disco:     0.50,  // moderate — regular phrases
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // low — hip-hop asymmetry OK
  lofi:      0.30,  // low — jazz irregularity OK
  flim:      0.25,  // low — IDM likes asymmetry
  xtal:      0.20,  // low — floating phrases
  syro:      0.15,  // lowest — anti-symmetry
  ambient:   0.20,  // low — timeless
};

/**
 * Calculate symmetry score between two phrase lengths.
 *
 * @param length1 Length of first phrase (in beats/ticks)
 * @param length2 Length of second phrase
 * @returns Symmetry score (0 = very asymmetric, 1 = perfectly balanced)
 */
function symmetryScore(length1: number, length2: number): number {
  if (length1 <= 0 || length2 <= 0) return 0.5;
  const ratio = Math.min(length1, length2) / Math.max(length1, length2);
  return ratio; // 1.0 for equal, 0.5 for 2:1, etc.
}

/**
 * Calculate phrase symmetry gain emphasis.
 *
 * @param currentPhraseLength Current phrase length
 * @param previousPhraseLength Previous phrase length
 * @param mood Current mood
 * @returns Gain multiplier (0.96 - 1.06)
 */
export function phraseSymmetryGain(
  currentPhraseLength: number,
  previousPhraseLength: number,
  mood: Mood
): number {
  const preference = SYMMETRY_PREFERENCE[mood];
  const score = symmetryScore(currentPhraseLength, previousPhraseLength);

  // High symmetry in symmetry-preferring mood = boost
  const adjustment = (score - 0.5) * preference * 0.12;
  return Math.max(0.96, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get symmetry preference for a mood (for testing).
 */
export function symmetryPreference(mood: Mood): number {
  return SYMMETRY_PREFERENCE[mood];
}
