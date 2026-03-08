/**
 * Voice leading cost — quantify smoothness of chord transitions.
 *
 * Smooth voice leading moves each voice by the smallest possible interval.
 * This module calculates the total semitone movement between two chords
 * and provides a smoothness score. Lower cost = smoother transition.
 *
 * Applied as chord selection bias toward smooth voice leading.
 */

import type { Mood } from '../types';

/**
 * Per-mood smoothness preference (higher = prefer smoother voice leading).
 */
const SMOOTHNESS_PREFERENCE: Record<Mood, number> = {
  trance:    0.40,  // moderate — some leaps OK
  avril:     0.65,  // strongest — classical smooth voice leading
  disco:     0.30,  // moderate — root motion is fine
  downtempo: 0.50,  // moderate
  blockhead: 0.25,  // weak — dramatic leaps OK
  lofi:      0.60,  // strong — jazz voice leading
  flim:      0.55,  // strong — delicate movement
  xtal:      0.50,  // moderate
  syro:      0.20,  // weakest — any movement OK
  ambient:   0.55,  // strong — gentle transitions
};

/**
 * Calculate minimum voice leading cost between two pitch class sets.
 * Uses greedy nearest-neighbor matching.
 *
 * @param fromPcs Source pitch classes (0-11)
 * @param toPcs Target pitch classes (0-11)
 * @returns Total semitone movement (0 = identical)
 */
export function voiceLeadingCost(fromPcs: number[], toPcs: number[]): number {
  if (fromPcs.length === 0 || toPcs.length === 0) return 0;

  // Pad shorter array with repeated values
  const from = [...fromPcs];
  const to = [...toPcs];
  while (from.length < to.length) from.push(from[from.length - 1]);
  while (to.length < from.length) to.push(to[to.length - 1]);

  // Greedy matching: for each source, find nearest unmatched target
  const used = new Set<number>();
  let totalCost = 0;

  for (const src of from) {
    let bestDist = 12;
    let bestIdx = 0;
    for (let i = 0; i < to.length; i++) {
      if (used.has(i)) continue;
      const diff = Math.abs(src - to[i]);
      const dist = Math.min(diff, 12 - diff);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    used.add(bestIdx);
    totalCost += bestDist;
  }

  return totalCost;
}

/**
 * Calculate smoothness score (0.0 rough - 1.0 smooth).
 *
 * @param fromPcs Source pitch classes
 * @param toPcs Target pitch classes
 * @returns Smoothness score (0.0 - 1.0)
 */
export function voiceLeadingSmoothness(
  fromPcs: number[],
  toPcs: number[]
): number {
  const cost = voiceLeadingCost(fromPcs, toPcs);
  const maxReasonableCost = Math.max(fromPcs.length, toPcs.length) * 6;
  return Math.max(0, 1.0 - cost / Math.max(1, maxReasonableCost));
}

/**
 * Weight for chord selection based on voice leading smoothness.
 *
 * @param fromPcs Current chord pitch classes
 * @param toPcs Candidate chord pitch classes
 * @param mood Current mood
 * @returns Selection weight (0.3 - 1.5)
 */
export function voiceLeadingWeight(
  fromPcs: number[],
  toPcs: number[],
  mood: Mood
): number {
  const pref = SMOOTHNESS_PREFERENCE[mood];
  const smoothness = voiceLeadingSmoothness(fromPcs, toPcs);
  // Smooth transitions weighted higher for moods that prefer it
  const weight = 0.5 + smoothness * pref + (1 - pref) * 0.5;
  return Math.max(0.3, Math.min(1.5, weight));
}

/**
 * Get smoothness preference for a mood (for testing).
 */
export function smoothnessPreference(mood: Mood): number {
  return SMOOTHNESS_PREFERENCE[mood];
}
