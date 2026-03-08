/**
 * Pitch set intersection — shared notes between chords create pivots.
 *
 * Common tones between successive chords create smooth transitions.
 * This module calculates the number of shared pitch classes and
 * provides transition smoothness scores for chord selection.
 *
 * Applied as chord selection weight based on common tone count.
 */

import type { Mood } from '../types';

/**
 * Per-mood common tone preference (higher = prefer more shared notes).
 */
const COMMON_TONE_PREFERENCE: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.55,  // strong — classical common tones
  disco:     0.30,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.25,  // weak — dramatic changes OK
  lofi:      0.50,  // strong — smooth jazz
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.15,  // weakest — disjunct OK
  ambient:   0.60,  // strongest — maximal smoothness
};

/**
 * Count shared pitch classes between two sets.
 *
 * @param pcs1 First pitch class set
 * @param pcs2 Second pitch class set
 * @returns Number of shared pitch classes
 */
export function commonToneCount(pcs1: number[], pcs2: number[]): number {
  const set2 = new Set(pcs2.map(pc => ((pc % 12) + 12) % 12));
  return pcs1.filter(pc => set2.has(((pc % 12) + 12) % 12)).length;
}

/**
 * Calculate transition smoothness from common tones.
 *
 * @param pcs1 Current chord pitch classes
 * @param pcs2 Next chord pitch classes
 * @returns Smoothness (0.0 - 1.0)
 */
export function commonToneSmoothness(pcs1: number[], pcs2: number[]): number {
  const shared = commonToneCount(pcs1, pcs2);
  const maxPossible = Math.min(pcs1.length, pcs2.length);
  if (maxPossible === 0) return 0;
  return shared / maxPossible;
}

/**
 * Weight for chord selection based on common tones.
 *
 * @param currentPcs Current chord pitch classes
 * @param candidatePcs Candidate next chord pitch classes
 * @param mood Current mood
 * @returns Selection weight (0.4 - 1.4)
 */
export function commonToneWeight(
  currentPcs: number[],
  candidatePcs: number[],
  mood: Mood
): number {
  const pref = COMMON_TONE_PREFERENCE[mood];
  const smoothness = commonToneSmoothness(currentPcs, candidatePcs);
  return Math.max(0.4, Math.min(1.4, 0.6 + smoothness * pref * 0.8 + (1 - pref) * 0.4));
}

/**
 * Get common tone preference for a mood (for testing).
 */
export function commonTonePreference(mood: Mood): number {
  return COMMON_TONE_PREFERENCE[mood];
}
