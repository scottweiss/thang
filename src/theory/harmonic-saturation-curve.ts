/**
 * Harmonic saturation curve — diminishing returns from harmonic complexity.
 *
 * Adding more chord extensions (7ths, 9ths, 11ths) yields decreasing
 * perceptual benefit and increasing muddiness. This module calculates
 * the point of diminishing returns and provides correction.
 *
 * Applied as gain/clarity reduction when harmonic content exceeds threshold.
 */

import type { Mood } from '../types';

/**
 * Per-mood saturation threshold (max useful voice count).
 */
const SATURATION_THRESHOLD: Record<Mood, number> = {
  trance:    3.5,   // triads mostly
  avril:     4.5,   // 7th chords welcome
  disco:     3.0,   // simple triads
  downtempo: 4.0,   // some extensions
  blockhead: 3.5,   // simple + occasional 7ths
  lofi:      5.5,   // rich extended chords
  flim:      4.5,   // moderate extensions
  xtal:      5.0,   // rich voicings
  syro:      6.0,   // highest — complex clusters OK
  ambient:   4.0,   // moderate — clarity matters
};

/**
 * Per-mood saturation sensitivity (how quickly returns diminish).
 */
const SATURATION_SENSITIVITY: Record<Mood, number> = {
  trance:    0.45,  // quick falloff
  avril:     0.35,  // moderate
  disco:     0.50,  // very quick
  downtempo: 0.35,  // moderate
  blockhead: 0.40,  // moderate
  lofi:      0.25,  // slow — welcomes complexity
  flim:      0.30,  // moderate
  xtal:      0.25,  // slow
  syro:      0.20,  // slowest — tolerates complexity
  ambient:   0.40,  // moderate
};

/**
 * Calculate gain reduction from harmonic saturation.
 *
 * @param voiceCount Number of simultaneous voices
 * @param mood Current mood
 * @returns Gain multiplier (0.7 - 1.0)
 */
export function saturationGainReduction(
  voiceCount: number,
  mood: Mood
): number {
  const threshold = SATURATION_THRESHOLD[mood];
  const sensitivity = SATURATION_SENSITIVITY[mood];
  const excess = Math.max(0, voiceCount - threshold);
  return Math.max(0.7, 1.0 - excess * sensitivity * 0.15);
}

/**
 * Calculate LPF reduction to maintain clarity at saturation.
 *
 * @param voiceCount Number of simultaneous voices
 * @param mood Current mood
 * @returns LPF multiplier (0.8 - 1.0)
 */
export function saturationLpfCorrection(
  voiceCount: number,
  mood: Mood
): number {
  const threshold = SATURATION_THRESHOLD[mood];
  const sensitivity = SATURATION_SENSITIVITY[mood];
  const excess = Math.max(0, voiceCount - threshold);
  // Darken slightly to reduce harmonic mud
  return Math.max(0.8, 1.0 - excess * sensitivity * 0.1);
}

/**
 * Get saturation threshold for a mood (for testing).
 */
export function saturationThreshold(mood: Mood): number {
  return SATURATION_THRESHOLD[mood];
}
