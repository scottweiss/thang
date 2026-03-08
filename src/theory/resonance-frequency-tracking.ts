/**
 * Resonance frequency tracking — filter resonance follows the root note.
 *
 * When a resonant filter is tuned to harmonics of the root note,
 * the sound feels more "in tune" and resonant. This module calculates
 * optimal resonance frequencies based on the current chord root,
 * creating a singing quality in the filter.
 *
 * Applied as a filter frequency suggestion.
 */

import type { Mood } from '../types';

/**
 * Per-mood tracking accuracy (higher = tighter lock to harmonics).
 */
const TRACKING_ACCURACY: Record<Mood, number> = {
  trance:    0.50,  // strong — resonant filter sweeps
  avril:     0.35,  // moderate
  disco:     0.45,  // strong — resonant bass
  downtempo: 0.40,  // moderate
  blockhead: 0.55,  // strong — resonant 808 style
  lofi:      0.30,  // moderate — warm filtering
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.60,  // strongest — acid-style tracking
  ambient:   0.25,  // weak — gentle filtering
};

/**
 * Concert pitch A4 in Hz.
 */
const A4 = 440;

/**
 * Convert a root note name to frequency (octave 2 for bass reference).
 */
function rootToFreq(rootPc: number): number {
  // C2 = MIDI 36, A4 = MIDI 69 = 440Hz
  const midi = 36 + rootPc; // C2 octave
  return A4 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Calculate resonance frequencies tuned to the current root.
 * Returns harmonics of the root that fall in useful filter range.
 *
 * @param rootPc Root pitch class (0-11)
 * @param harmonicNumber Which harmonic to target (1-8)
 * @returns Frequency in Hz
 */
export function resonanceTarget(rootPc: number, harmonicNumber: number): number {
  const fundamental = rootToFreq(rootPc);
  return fundamental * harmonicNumber;
}

/**
 * Calculate LPF value that tracks the root for a given mood.
 *
 * @param rootPc Root pitch class (0-11)
 * @param currentLpf Current LPF value
 * @param mood Current mood
 * @returns Adjusted LPF value
 */
export function trackingLpf(
  rootPc: number,
  currentLpf: number,
  mood: Mood
): number {
  const accuracy = TRACKING_ACCURACY[mood];
  // Target the 5th harmonic of the root (musically pleasant)
  const target = resonanceTarget(rootPc, 5);
  // Blend between current LPF and harmonic target
  return currentLpf * (1 - accuracy * 0.3) + target * accuracy * 0.3;
}

/**
 * Get tracking accuracy for a mood (for testing).
 */
export function trackingAccuracy(mood: Mood): number {
  return TRACKING_ACCURACY[mood];
}
