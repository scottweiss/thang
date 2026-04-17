/**
 * Melodic contour matching — arp follows melody contour shape.
 *
 * When melody ascends, arp should tend upward too (parallel motion)
 * or deliberately descend (contrary motion). This module provides
 * contour-matching weights so supporting layers echo the melody's
 * directional energy with a slight delay.
 *
 * Applied as note selection bias for arp layer.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood contour matching strength.
 */
const MATCHING_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — parallel motion
  avril:     0.55,  // strong — orchestral following
  disco:     0.30,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // weak — independent
  lofi:      0.50,  // strong — jazz conversation
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.15,  // weakest — independent voices
  ambient:   0.35,  // moderate — gentle following,
  plantasia: 0.35,
};

/**
 * Per-mood preference for parallel vs contrary motion.
 * Positive = parallel, negative = contrary.
 */
const MOTION_PREFERENCE: Record<Mood, number> = {
  trance:    0.6,   // parallel
  avril:     0.3,   // mixed, slight parallel
  disco:     0.7,   // parallel
  downtempo: 0.4,   // mixed
  blockhead: 0.2,   // mostly contrary
  lofi:      0.5,   // balanced
  flim:      0.3,   // mixed
  xtal:      0.4,   // mixed
  syro:     -0.2,   // contrary preferred
  ambient:   0.5,   // balanced,
  plantasia: 0.5,
};

/**
 * Calculate contour direction weight for arp note selection.
 *
 * @param melodyDirection -1 (descending), 0 (static), 1 (ascending)
 * @param candidateDirection -1, 0, or 1 for candidate note
 * @param mood Current mood
 * @returns Weight multiplier (0.5 - 1.5)
 */
export function contourMatchWeight(
  melodyDirection: number,
  candidateDirection: number,
  mood: Mood
): number {
  const strength = MATCHING_STRENGTH[mood];
  const pref = MOTION_PREFERENCE[mood];

  if (melodyDirection === 0) return 1.0; // no contour to match

  // Does candidate follow melody or oppose it?
  const isParallel = melodyDirection === candidateDirection;
  const isContrary = melodyDirection === -candidateDirection;

  if (isParallel) {
    return 1.0 + strength * pref * 0.5;
  } else if (isContrary) {
    return 1.0 + strength * (1 - pref) * 0.5;
  }
  // Static note
  return 1.0 - strength * 0.15;
}

/**
 * Determine melody direction from recent notes.
 *
 * @param recentNotes Array of recent MIDI note numbers
 * @returns -1 (descending), 0 (static), 1 (ascending)
 */
export function melodyDirection(recentNotes: number[]): number {
  if (recentNotes.length < 2) return 0;
  const last = recentNotes[recentNotes.length - 1];
  const prev = recentNotes[recentNotes.length - 2];
  if (last > prev) return 1;
  if (last < prev) return -1;
  return 0;
}

/**
 * Get matching strength for a mood (for testing).
 */
export function contourMatchingStrength(mood: Mood): number {
  return MATCHING_STRENGTH[mood];
}
