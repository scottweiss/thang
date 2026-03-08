/**
 * Melodic tension arc — phrase-level tension from pitch-root distance.
 *
 * Within a phrase, tension rises as melody moves away from chord
 * tones and falls as it returns. This creates a natural tension
 * arc that the gain/FM can follow, making phrases feel alive.
 */

import type { Mood } from '../types';

/**
 * Per-mood tension arc sensitivity.
 */
const ARC_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.60,  // highest — dramatic arcs
  disco:     0.30,  // low — steady
  downtempo: 0.50,  // high
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // high — jazz arcs
  flim:      0.50,  // high
  xtal:      0.45,  // moderate
  syro:      0.25,  // low — flat tension
  ambient:   0.40,  // moderate
};

/**
 * Calculate melodic tension from pitch-root distance.
 *
 * @param notePc Note pitch class (0-11)
 * @param rootPc Root pitch class (0-11)
 * @returns Tension level (0 = consonant, 1 = dissonant)
 */
function pitchTension(notePc: number, rootPc: number): number {
  const interval = ((notePc - rootPc) + 12) % 12;
  // Consonance ranking
  const tensions: Record<number, number> = {
    0: 0.0,   // unison
    7: 0.1,   // P5
    5: 0.15,  // P4
    4: 0.2,   // M3
    3: 0.25,  // m3
    9: 0.3,   // M6
    8: 0.35,  // m6
    2: 0.4,   // M2
    10: 0.45, // m7
    11: 0.6,  // M7
    1: 0.7,   // m2
    6: 0.8,   // tritone
  };
  return tensions[interval] ?? 0.5;
}

/**
 * Calculate melodic tension arc gain.
 *
 * @param notePc Current note pitch class
 * @param rootPc Chord root pitch class
 * @param mood Current mood
 * @returns Gain multiplier (0.94 - 1.08)
 */
export function tensionArcGain(
  notePc: number,
  rootPc: number,
  mood: Mood
): number {
  const sensitivity = ARC_SENSITIVITY[mood];
  const tension = pitchTension(
    ((notePc % 12) + 12) % 12,
    ((rootPc % 12) + 12) % 12
  );

  // Moderate tension = boost (interesting), extreme = slight boost
  // Very consonant = neutral (stable)
  const interest = tension > 0.1 ? tension * 0.8 : 0;
  const adjustment = interest * sensitivity * 0.12;

  return Math.max(0.94, Math.min(1.08, 1.0 + adjustment));
}

/**
 * Get arc sensitivity for a mood (for testing).
 */
export function arcSensitivity(mood: Mood): number {
  return ARC_SENSITIVITY[mood];
}
