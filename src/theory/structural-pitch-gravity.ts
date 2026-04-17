/**
 * Structural pitch gravity — notes near structural pitches get gain boost.
 *
 * Structural pitches (root, fifth, third of current chord) are gravitational
 * attractors. Notes that land on or near these pitches sound more
 * "correct" and get subtle gain emphasis, while notes far from
 * structural pitches are de-emphasized.
 *
 * Applied as gain multiplier based on proximity to structural pitches.
 */

import type { Mood } from '../types';

/**
 * Per-mood gravity strength (higher = more emphasis on structural pitches).
 */
const GRAVITY_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // strong — chord tones emphasized
  avril:     0.55,  // strong — classical pitch hierarchy
  disco:     0.40,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.45,  // moderate — but jazz allows color
  flim:      0.25,  // weak — floating
  xtal:      0.30,  // weak — ethereal
  syro:      0.15,  // weakest — all pitches equal
  ambient:   0.20,  // weak — drifting,
  plantasia: 0.20,
};

/**
 * Calculate proximity to nearest structural pitch.
 *
 * @param notePc Note pitch class (0-11)
 * @param chordPcs Chord pitch classes (structural pitches)
 * @returns Distance to nearest structural pitch (0-6 semitones)
 */
export function structuralDistance(notePc: number, chordPcs: number[]): number {
  if (chordPcs.length === 0) return 0;

  let minDist = 12;
  for (const cpc of chordPcs) {
    const raw = Math.abs(((notePc - cpc) % 12 + 12) % 12);
    const dist = Math.min(raw, 12 - raw);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/**
 * Gain multiplier based on proximity to structural pitches.
 *
 * @param notePc Note pitch class (0-11)
 * @param chordPcs Chord pitch classes
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.08)
 */
export function structuralGravityGain(
  notePc: number,
  chordPcs: number[],
  mood: Mood
): number {
  const strength = GRAVITY_STRENGTH[mood];
  const distance = structuralDistance(notePc, chordPcs);

  // On chord tone = boost, far away = reduction
  const normalized = distance / 6; // 0-1
  const deviation = (0.5 - normalized) * strength * 0.35;

  return Math.max(0.90, Math.min(1.08, 1.0 + deviation));
}

/**
 * Get gravity strength for a mood (for testing).
 */
export function gravityStrength(mood: Mood): number {
  return GRAVITY_STRENGTH[mood];
}
