/**
 * Melodic peak brightness — highest notes in phrases get brightness boost.
 *
 * The highest note in a melodic phrase is often the emotional climax.
 * This module provides a brightness (LPF) and gain boost for notes
 * that are at or near the phrase peak, making them shine through.
 */

import type { Mood } from '../types';

/**
 * Per-mood peak emphasis (higher = more brightness at peaks).
 */
const PEAK_EMPHASIS: Record<Mood, number> = {
  trance:    0.45,  // moderate
  avril:     0.65,  // highest — dramatic peaks
  disco:     0.35,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // low — raw
  lofi:      0.50,  // moderate
  flim:      0.55,  // high — delicate peaks
  xtal:      0.50,  // moderate
  syro:      0.25,  // low — peaks less meaningful
  ambient:   0.45,  // moderate,
  plantasia: 0.45,
};

/**
 * Calculate peak brightness gain.
 *
 * @param currentMidi Current MIDI note
 * @param phrasePeakMidi Highest MIDI note in the phrase
 * @param mood Current mood
 * @returns Gain multiplier (0.96 - 1.10)
 */
export function peakBrightnessGain(
  currentMidi: number,
  phrasePeakMidi: number,
  mood: Mood
): number {
  const emphasis = PEAK_EMPHASIS[mood];

  // How close to the peak (in semitones)
  const distance = Math.abs(currentMidi - phrasePeakMidi);

  if (distance === 0) {
    // At the peak — maximum boost
    return Math.min(1.10, 1.0 + emphasis * 0.14);
  }
  if (distance <= 2) {
    // Near the peak — moderate boost
    return Math.min(1.05, 1.0 + emphasis * 0.06);
  }

  // Not near peak — no adjustment
  return 1.0;
}

/**
 * Calculate peak brightness LPF multiplier.
 *
 * @param currentMidi Current MIDI note
 * @param phrasePeakMidi Highest MIDI note in the phrase
 * @param mood Current mood
 * @returns LPF multiplier (1.0 - 1.15)
 */
export function peakBrightnessLpf(
  currentMidi: number,
  phrasePeakMidi: number,
  mood: Mood
): number {
  const emphasis = PEAK_EMPHASIS[mood];
  const distance = Math.abs(currentMidi - phrasePeakMidi);

  if (distance <= 1) {
    return Math.min(1.15, 1.0 + emphasis * 0.20);
  }
  return 1.0;
}

/**
 * Get peak emphasis for a mood (for testing).
 */
export function peakEmphasis(mood: Mood): number {
  return PEAK_EMPHASIS[mood];
}
