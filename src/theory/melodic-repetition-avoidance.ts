/**
 * Melodic repetition avoidance — penalize immediate pitch repetition.
 *
 * Repeated notes in melody sound static and robotic. A slight gain
 * reduction on repeated pitches encourages variety. The penalty
 * is mood-dependent: ambient tolerates repetition (meditative),
 * while avril penalizes it (expressive variety).
 */

import type { Mood } from '../types';

/**
 * Per-mood repetition penalty strength (higher = less repetition tolerated).
 */
const PENALTY_STRENGTH: Record<Mood, number> = {
  trance:    0.30,  // moderate — hypnotic repetition OK
  avril:     0.60,  // high — needs variety
  disco:     0.25,  // low — riff repetition is the groove
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // moderate — sample repetition OK
  lofi:      0.45,  // moderate-high
  flim:      0.55,  // high — melodic variety
  xtal:      0.50,  // moderate-high
  syro:      0.65,  // highest — always fresh
  ambient:   0.15,  // lowest — meditative repetition OK,
  plantasia: 0.15,
};

/**
 * Calculate gain penalty for repeated pitch.
 *
 * @param currentPc Current pitch class (0-11)
 * @param previousPc Previous pitch class (0-11)
 * @param mood Current mood
 * @returns Gain multiplier (0.88 - 1.0)
 */
export function repetitionAvoidanceGain(
  currentPc: number,
  previousPc: number,
  mood: Mood
): number {
  const cur = ((currentPc % 12) + 12) % 12;
  const prev = ((previousPc % 12) + 12) % 12;

  if (cur !== prev) return 1.0; // different pitch = no penalty

  const strength = PENALTY_STRENGTH[mood];
  return Math.max(0.88, 1.0 - strength * 0.18);
}

/**
 * Get penalty strength for a mood (for testing).
 */
export function penaltyStrength(mood: Mood): number {
  return PENALTY_STRENGTH[mood];
}
