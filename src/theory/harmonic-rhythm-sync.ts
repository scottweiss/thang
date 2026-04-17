/**
 * Harmonic rhythm sync — chord changes align with metric strong points.
 *
 * Chord changes that land on strong beats feel more natural and grounded.
 * This module calculates optimal chord change timing based on metric
 * position and provides alignment corrections.
 *
 * Applied as chord timing nudge toward strong beats.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sync strength (higher = stronger alignment to grid).
 */
const SYNC_STRENGTH: Record<Mood, number> = {
  trance:    0.65,  // strongest — downbeat-locked
  avril:     0.50,  // strong — classical phrasing
  disco:     0.60,  // strong — groove-locked
  downtempo: 0.40,  // moderate
  blockhead: 0.55,  // strong — beat-aligned
  lofi:      0.35,  // moderate — loose timing
  flim:      0.30,  // weak — off-grid OK
  xtal:      0.25,  // weak — floating changes
  syro:      0.15,  // weakest — anywhere goes
  ambient:   0.20,  // weak — drifting changes,
  plantasia: 0.20,
};

/**
 * Beat strength pattern for 4/4 time.
 * Beat 1 strongest, beat 3 secondary, beats 2/4 weak.
 */
const BEAT_STRENGTH = [1.0, 0.3, 0.7, 0.2]; // beats 1-4

/**
 * Calculate alignment score for a chord change at a given beat.
 *
 * @param beatPosition Which beat (0-3, fractional OK)
 * @param mood Current mood
 * @returns Alignment quality (0.0 - 1.0)
 */
export function chordChangeAlignment(
  beatPosition: number,
  mood: Mood
): number {
  const syncStr = SYNC_STRENGTH[mood];
  const beat = Math.floor(((beatPosition % 4) + 4) % 4);
  const beatStr = BEAT_STRENGTH[beat];
  // Blend between uniform (0.5) and beat-aligned
  return 0.5 * (1 - syncStr) + beatStr * syncStr;
}

/**
 * Calculate timing nudge to align chord change with nearest strong beat.
 *
 * @param beatPosition Current beat position (fractional)
 * @param mood Current mood
 * @returns Nudge amount in beats (-0.5 to 0.5)
 */
export function chordChangeNudge(
  beatPosition: number,
  mood: Mood
): number {
  const syncStr = SYNC_STRENGTH[mood];
  const pos = ((beatPosition % 4) + 4) % 4;
  // Find nearest strong beat (0 or 2)
  let nearestStrong: number;
  if (pos < 1) nearestStrong = 0;
  else if (pos < 3) nearestStrong = 2;
  else nearestStrong = 4; // wrap to next bar

  const nudge = nearestStrong - pos;
  return nudge * syncStr * 0.3;
}

/**
 * Get sync strength for a mood (for testing).
 */
export function harmonicRhythmSyncStrength(mood: Mood): number {
  return SYNC_STRENGTH[mood];
}
