/**
 * Harmonic resolution momentum — forward drive approaching tonic.
 *
 * When a chord progression is heading toward resolution (V→I, ii→V→I),
 * the music naturally builds momentum. This module detects proximity
 * to resolution (via circle of fifths distance to tonic) and provides
 * a gain boost that increases as resolution approaches.
 */

import type { Mood } from '../types';

/**
 * Per-mood resolution drive strength.
 */
const DRIVE_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // high — needs arrival energy
  avril:     0.60,  // highest — classical cadential drive
  disco:     0.45,  // moderate — groove momentum
  downtempo: 0.40,  // moderate
  blockhead: 0.35,  // low-moderate
  lofi:      0.50,  // moderate — jazz cadences
  flim:      0.30,  // low
  xtal:      0.25,  // low — floating
  syro:      0.20,  // lowest — no resolution expected
  ambient:   0.15,  // lowest — timeless
};

const FIFTHS_DISTANCE: Record<number, number> = {
  0: 0,   // I — tonic (resolved)
  7: 1,   // V — dominant (1 fifth away)
  2: 2,   // ii — 2 fifths
  9: 3,   // vi — 3 fifths
  4: 4,   // iii — 4 fifths
  11: 5,  // vii — 5 fifths
  5: 1,   // IV — subdominant (1 fourth = 1 fifth back)
  10: 2,  // bVII
  3: 3,   // bIII
  8: 4,   // bVI
  1: 5,   // bII
  6: 6,   // tritone
};

/**
 * Calculate resolution momentum gain.
 *
 * @param chordRootPc Chord root pitch class (0-11)
 * @param tonicPc Tonic pitch class (0-11)
 * @param mood Current mood
 * @returns Gain multiplier (0.97 - 1.08)
 */
export function resolutionMomentumGain(
  chordRootPc: number,
  tonicPc: number,
  mood: Mood
): number {
  const strength = DRIVE_STRENGTH[mood];
  const interval = ((chordRootPc - tonicPc) + 12) % 12;
  const distance = FIFTHS_DISTANCE[interval] ?? 3;

  // Close to tonic = more momentum (V has most drive)
  // Tonic itself = resolved, no boost
  let drive = 0;
  if (distance === 1) drive = 1.0;      // dominant/subdominant
  else if (distance === 2) drive = 0.6;  // pre-dominant
  else if (distance === 0) drive = 0.0;  // already resolved
  else drive = 0.3;                       // distant

  const boost = drive * strength * 0.12;
  return Math.max(0.97, Math.min(1.08, 1.0 + boost));
}

/**
 * Get drive strength for a mood (for testing).
 */
export function driveStrength(mood: Mood): number {
  return DRIVE_STRENGTH[mood];
}
