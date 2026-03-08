/**
 * Rhythmic expectation reset — gain emphasis after silence for re-entry impact.
 *
 * After a period of silence or very low activity, the first
 * notes back create a powerful moment of re-entry. This module
 * provides a gain/brightness boost for notes that follow silence,
 * making returns feel impactful.
 */

import type { Mood } from '../types';

/**
 * Per-mood re-entry emphasis (higher = more impact after silence).
 */
const REENTRY_EMPHASIS: Record<Mood, number> = {
  trance:    0.55,  // high — dramatic returns
  avril:     0.60,  // highest — classical re-entries
  disco:     0.40,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.50,  // high — punchy returns
  lofi:      0.35,  // moderate
  flim:      0.40,  // moderate
  xtal:      0.45,  // moderate
  syro:      0.30,  // low
  ambient:   0.50,  // high — silence is meaningful
};

/**
 * Calculate re-entry gain boost.
 *
 * @param ticksSinceSilence Number of ticks since last silence/rest
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.12)
 */
export function reentryGain(
  ticksSinceSilence: number,
  mood: Mood
): number {
  const emphasis = REENTRY_EMPHASIS[mood];
  const ticks = Math.max(0, ticksSinceSilence);

  if (ticks > 2) return 1.0; // too long since silence — no boost

  // Exponential decay: immediate re-entry = strongest
  const boost = emphasis * 0.18 * Math.exp(-ticks * 0.8);
  return Math.min(1.12, 1.0 + boost);
}

/**
 * Get re-entry emphasis for a mood (for testing).
 */
export function reentryEmphasis(mood: Mood): number {
  return REENTRY_EMPHASIS[mood];
}
