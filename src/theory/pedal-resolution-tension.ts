/**
 * Pedal resolution tension — pedal tones create tension that resolves.
 *
 * When a bass pedal sustains while chords move above it, tension
 * builds as the harmony becomes more dissonant against the pedal.
 * When the pedal releases (chord root matches pedal), tension resolves
 * with a satisfying arrival. This module tracks pedal-chord distance.
 *
 * Applied as FM/gain multiplier based on pedal-chord tension.
 */

import type { Mood } from '../types';

/**
 * Per-mood pedal tension sensitivity (higher = more tension response).
 */
const PEDAL_SENSITIVITY: Record<Mood, number> = {
  trance:    0.45,  // moderate — pedal point common
  avril:     0.55,  // high — classical pedal tension
  disco:     0.35,  // moderate
  downtempo: 0.50,  // high — sustained bass
  blockhead: 0.30,  // moderate
  lofi:      0.40,  // moderate
  flim:      0.45,  // moderate
  xtal:      0.50,  // high — crystalline tension
  syro:      0.25,  // low
  ambient:   0.60,  // highest — drone-based tension,
  plantasia: 0.60,
};

/**
 * Calculate tension between pedal tone and chord root.
 *
 * @param pedalPc Pedal pitch class (0-11)
 * @param chordRootPc Current chord root pitch class (0-11)
 * @returns Tension level (0.0 = resolved, 1.0 = maximum tension)
 */
export function pedalTension(pedalPc: number, chordRootPc: number): number {
  const interval = ((chordRootPc - pedalPc) % 12 + 12) % 12;

  // Unison = resolved, tritone = max tension
  const tensions: Record<number, number> = {
    0: 0,      // unison — resolved
    1: 0.7,    // minor 2nd — high
    2: 0.4,    // major 2nd — moderate
    3: 0.3,    // minor 3rd — mild
    4: 0.25,   // major 3rd — mild
    5: 0.15,   // perfect 4th — low
    6: 0.9,    // tritone — highest
    7: 0.1,    // perfect 5th — very low
    8: 0.3,    // minor 6th
    9: 0.35,   // major 6th
    10: 0.6,   // minor 7th — high
    11: 0.75,  // major 7th — very high
  };

  return tensions[interval] ?? 0.5;
}

/**
 * FM multiplier based on pedal tension.
 *
 * @param pedalPc Pedal pitch class
 * @param chordRootPc Chord root pitch class
 * @param mood Current mood
 * @returns FM multiplier (0.85 - 1.20)
 */
export function pedalTensionFm(
  pedalPc: number,
  chordRootPc: number,
  mood: Mood
): number {
  const sensitivity = PEDAL_SENSITIVITY[mood];
  const tension = pedalTension(pedalPc, chordRootPc);
  const boost = tension * sensitivity * 0.5;
  return Math.max(0.85, Math.min(1.20, 1.0 + boost));
}

/**
 * Get pedal sensitivity for a mood (for testing).
 */
export function pedalSensitivity(mood: Mood): number {
  return PEDAL_SENSITIVITY[mood];
}
