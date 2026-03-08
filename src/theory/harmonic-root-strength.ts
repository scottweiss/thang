/**
 * Harmonic root strength — bass note alignment with chord root.
 *
 * When the lowest sounding note IS the chord root, the harmony
 * sounds grounded and strong. When it's an inversion (3rd or 5th
 * in bass), it sounds lighter and less stable. This module provides
 * gain/FM adjustments based on root position vs inversion state.
 *
 * Root position gets a slight low-end boost (FM warmth).
 * Inversions get a slight brightness lift (higher FM ratio feel).
 */

import type { Mood } from '../types';

/**
 * Per-mood root strength sensitivity (higher = more root emphasis).
 */
const ROOT_SENSITIVITY: Record<Mood, number> = {
  trance:    0.55,  // high — needs grounding
  avril:     0.45,  // moderate — classical inversions OK
  disco:     0.50,  // moderate — bass-driven
  downtempo: 0.40,  // moderate
  blockhead: 0.60,  // highest — hip-hop bass weight
  lofi:      0.35,  // low — jazz inversions welcome
  flim:      0.30,  // low — IDM ambiguity
  xtal:      0.25,  // low — airy
  syro:      0.20,  // lowest — anything goes
  ambient:   0.30,  // low — floating harmony
};

/**
 * Score how "rooted" the bass note is.
 *
 * @param bassNote MIDI note of lowest voice
 * @param chordRoot MIDI note of chord root (any octave)
 * @returns 1.0 for root position, 0.5 for inversion, 0.0 for non-chord bass
 */
function rootPositionScore(bassNote: number, chordRoot: number): number {
  const bassPc = ((bassNote % 12) + 12) % 12;
  const rootPc = ((chordRoot % 12) + 12) % 12;
  if (bassPc === rootPc) return 1.0;
  // Common inversions (3rd or 5th in bass) are partially grounded
  const interval = ((bassPc - rootPc) + 12) % 12;
  if (interval === 3 || interval === 4 || interval === 7) return 0.5;
  return 0.0;
}

/**
 * Calculate root strength gain multiplier for harmony/drone layers.
 *
 * @param bassNote MIDI note of lowest voice
 * @param chordRoot MIDI note of chord root
 * @param mood Current mood
 * @returns Gain multiplier (0.94 - 1.06)
 */
export function rootStrengthGain(
  bassNote: number,
  chordRoot: number,
  mood: Mood
): number {
  const sensitivity = ROOT_SENSITIVITY[mood];
  const score = rootPositionScore(bassNote, chordRoot);

  // Root position gets boost, inversions get slight reduction
  const adjustment = (score - 0.5) * sensitivity * 0.12;
  return Math.max(0.94, Math.min(1.06, 1.0 + adjustment));
}

/**
 * Get root sensitivity for a mood (for testing).
 */
export function rootSensitivity(mood: Mood): number {
  return ROOT_SENSITIVITY[mood];
}
