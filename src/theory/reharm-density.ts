/**
 * Reharmonization density control — prevent harmonic fatigue from
 * too many consecutive chord substitutions.
 *
 * When every chord change uses a reharmonization technique (tritone sub,
 * chromatic approach, relative sub, secondary dominant, modal interchange),
 * the harmony becomes unpredictable and loses its grounding. The ear needs
 * periodic "rest" on simple diatonic progressions to appreciate the color
 * of reharmonization.
 *
 * This module tracks recent reharmonization activity and applies a
 * cooldown multiplier that reduces the probability of further substitutions
 * after a streak of reharmonized chords.
 *
 * The pattern mirrors natural musical phrasing:
 * - 1-2 diatonic chords → reharmonize → 2-3 diatonic → reharmonize
 * This creates a rhythm of "expected → surprise → expected → surprise"
 * that's fundamental to musical interest.
 */

import type { Mood } from '../types';

/** Per-mood tolerance for consecutive reharmonizations */
const REHARM_TOLERANCE: Record<Mood, number> = {
  lofi:      3,    // jazz — can handle more chromaticism
  downtempo: 3,    // smooth — tolerant
  blockhead: 2,    // hip-hop — moderate
  flim:      2,    // delicate — moderate
  disco:     2,    // funk — moderate
  syro:      3,    // IDM — complex tolerance
  avril:     2,    // intimate — moderate
  xtal:      2,    // dreamy — moderate
  trance:    1,    // driving — prefer diatonic clarity
  ambient:   1,    // static — minimal reharmonization,
  plantasia: 1,
};

/**
 * Compute a cooldown multiplier for reharmonization probability.
 * Returns a value between 0 and 1 that should multiply the
 * reharmonization probability.
 *
 * @param recentReharmCount   Number of reharmonized chords in the last N changes
 * @param mood                Current mood
 * @returns Multiplier (1.0 = no cooldown, 0.0 = fully suppressed)
 */
export function reharmCooldown(
  recentReharmCount: number,
  mood: Mood
): number {
  const tolerance = REHARM_TOLERANCE[mood];

  if (recentReharmCount <= 0) return 1.0;  // no recent reharms — full green light
  if (recentReharmCount <= 1) return 0.8;  // one recent — slight cooldown

  // Beyond tolerance: exponential suppression
  if (recentReharmCount > tolerance) {
    const excess = recentReharmCount - tolerance;
    return Math.max(0.05, 0.3 * Math.exp(-excess * 0.8));
  }

  // Within tolerance: gradual reduction (1.0 → 0.3 at tolerance)
  const ratio = recentReharmCount / tolerance;
  return 1.0 - ratio * 0.7;
}

/**
 * Whether the recent chord history suggests we should cool down
 * on reharmonization.
 *
 * @param recentReharmCount   Count of reharmonized chords recently
 * @param mood                Current mood
 * @returns true if cooldown should be applied (multiplier < 0.8)
 */
export function shouldCooldownReharm(
  recentReharmCount: number,
  mood: Mood
): boolean {
  return reharmCooldown(recentReharmCount, mood) < 0.8;
}

/**
 * Get the tolerance for a mood (for testing).
 */
export function reharmTolerance(mood: Mood): number {
  return REHARM_TOLERANCE[mood];
}
