/**
 * Voicing register distribution — spread voices across optimal registers.
 *
 * Good voicings distribute notes across registers: bass notes low,
 * color tones in the middle, upper extensions high. This module
 * scores voicing distributions and provides register suggestions.
 *
 * Applied as voicing quality score for harmony generation.
 */

import type { Mood } from '../types';

/**
 * Per-mood spread preference (higher = prefer wider voicings).
 */
const SPREAD_PREFERENCE: Record<Mood, number> = {
  trance:    0.40,  // moderate — synth pads
  avril:     0.60,  // strongest — orchestral spread
  disco:     0.30,  // moderate — compact groove
  downtempo: 0.45,  // moderate
  blockhead: 0.25,  // weak — compact
  lofi:      0.55,  // strong — jazz voicings
  flim:      0.50,  // strong
  xtal:      0.55,  // strong — crystalline spread
  syro:      0.35,  // moderate
  ambient:   0.65,  // strongest — wide spacing,
  plantasia: 0.65,
};

/**
 * Calculate voicing spread quality score.
 *
 * @param midiNotes Array of MIDI note numbers in the voicing
 * @returns Quality score (0.0 - 1.0)
 */
export function voicingSpreadScore(midiNotes: number[]): number {
  if (midiNotes.length <= 1) return 0.5;

  const sorted = [...midiNotes].sort((a, b) => a - b);
  const range = sorted[sorted.length - 1] - sorted[0];

  // Ideal range: 12-24 semitones (1-2 octaves)
  let rangeScore: number;
  if (range < 6) rangeScore = range / 6 * 0.5; // too compact
  else if (range <= 24) rangeScore = 0.5 + (range - 6) / 36; // good
  else rangeScore = Math.max(0.3, 1.0 - (range - 24) / 24); // too wide

  // Check for even distribution (no big gaps or clusters)
  let evenness = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    const idealGap = range / (sorted.length - 1);
    evenness += 1.0 - Math.min(1.0, Math.abs(gap - idealGap) / idealGap);
  }
  evenness /= sorted.length - 1;

  return rangeScore * 0.6 + evenness * 0.4;
}

/**
 * Weight for voicing selection based on spread quality.
 *
 * @param midiNotes Voicing MIDI notes
 * @param mood Current mood
 * @returns Selection weight (0.4 - 1.4)
 */
export function spreadWeight(
  midiNotes: number[],
  mood: Mood
): number {
  const pref = SPREAD_PREFERENCE[mood];
  const score = voicingSpreadScore(midiNotes);
  return Math.max(0.4, Math.min(1.4, 0.6 + score * pref * 0.8 + (1 - pref) * 0.4));
}

/**
 * Get spread preference for a mood (for testing).
 */
export function voicingSpreadPreference(mood: Mood): number {
  return SPREAD_PREFERENCE[mood];
}
