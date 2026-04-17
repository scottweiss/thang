/**
 * Harmonic expectation fulfillment — gain boost when expected chord arrives.
 *
 * In tonal music, certain chord progressions are expected (V→I, ii→V).
 * When the expected resolution arrives, it creates satisfaction.
 * This module detects fulfilled expectations and provides a gain
 * boost for that moment of arrival.
 */

import type { Mood } from '../types';

/**
 * Per-mood fulfillment emphasis (higher = more reward for expected chords).
 */
const FULFILLMENT_EMPHASIS: Record<Mood, number> = {
  trance:    0.55,  // high — strong expectations
  avril:     0.65,  // highest — classical satisfaction
  disco:     0.45,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // low — hip-hop surprises
  lofi:      0.50,  // moderate — jazz cadences
  flim:      0.35,  // low-moderate
  xtal:      0.30,  // low
  syro:      0.15,  // lowest — subverts expectations
  ambient:   0.25,  // low — no strong expectations,
  plantasia: 0.25,
};

/**
 * Common expected progressions (interval from previous to current).
 * Fifth down (7 semitones down = 5 up) is the strongest expectation.
 */
const EXPECTED_INTERVALS: Array<{ interval: number; strength: number }> = [
  { interval: 5, strength: 1.0 },   // V→I (perfect 4th up = 5th down)
  { interval: 7, strength: 0.8 },   // IV→I (perfect 5th up)
  { interval: 2, strength: 0.5 },   // ii→iii or similar step
  { interval: 10, strength: 0.4 },  // iii→IV (step)
];

/**
 * Calculate expectation fulfillment gain.
 *
 * @param prevRootPc Previous chord root pitch class (0-11)
 * @param currentRootPc Current chord root pitch class (0-11)
 * @param mood Current mood
 * @returns Gain multiplier (0.97 - 1.08)
 */
export function expectationFulfillmentGain(
  prevRootPc: number,
  currentRootPc: number,
  mood: Mood
): number {
  const emphasis = FULFILLMENT_EMPHASIS[mood];
  const interval = ((currentRootPc - prevRootPc) + 12) % 12;

  for (const exp of EXPECTED_INTERVALS) {
    if (interval === exp.interval) {
      return Math.min(1.08, 1.0 + exp.strength * emphasis * 0.10);
    }
  }

  return 1.0; // unexpected progression — neutral
}

/**
 * Get fulfillment emphasis for a mood (for testing).
 */
export function fulfillmentEmphasis(mood: Mood): number {
  return FULFILLMENT_EMPHASIS[mood];
}
