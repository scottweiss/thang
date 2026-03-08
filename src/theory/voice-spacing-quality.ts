/**
 * Voice spacing quality — evaluate intervallic spacing between adjacent voices.
 *
 * Good voicings follow the "open position" principle: wider intervals
 * in the bass, closer intervals in the treble. Voices too close in
 * the bass register create mud; voices too far apart in treble
 * sound hollow.
 *
 * Applied as gain correction for voicing quality.
 */

import type { Mood } from '../types';

/**
 * Per-mood spacing preference (higher = stricter spacing rules).
 */
const SPACING_STRICTNESS: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.60,  // strict — orchestral voicing rules
  disco:     0.30,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.25,  // low — compact OK
  lofi:      0.55,  // strict — jazz voicing
  flim:      0.45,  // moderate
  xtal:      0.50,  // moderate
  syro:      0.20,  // low — anything goes
  ambient:   0.50,  // moderate — open spacing preferred
};

/**
 * Score the spacing quality of a voicing.
 *
 * @param midiNotes Sorted MIDI note numbers (low to high)
 * @returns Quality score (0.0 = poor spacing, 1.0 = ideal spacing)
 */
export function spacingQuality(midiNotes: number[]): number {
  if (midiNotes.length <= 1) return 0.5;

  const sorted = [...midiNotes].sort((a, b) => a - b);
  let score = 0;

  for (let i = 1; i < sorted.length; i++) {
    const interval = sorted[i] - sorted[i - 1];
    const avgPitch = (sorted[i] + sorted[i - 1]) / 2;

    // Low register: prefer wider spacing (7-12 semitones)
    // High register: prefer closer spacing (3-7 semitones)
    let idealMin: number, idealMax: number;
    if (avgPitch < 48) {
      idealMin = 7; idealMax = 14; // bass register
    } else if (avgPitch < 60) {
      idealMin = 5; idealMax = 12; // mid-low
    } else if (avgPitch < 72) {
      idealMin = 3; idealMax = 9;  // mid-high
    } else {
      idealMin = 2; idealMax = 7;  // high
    }

    if (interval >= idealMin && interval <= idealMax) {
      score += 1.0;
    } else {
      const deviation = interval < idealMin
        ? idealMin - interval
        : interval - idealMax;
      score += Math.max(0, 1.0 - deviation * 0.15);
    }
  }

  return score / (sorted.length - 1);
}

/**
 * Gain correction based on voicing spacing quality.
 *
 * @param midiNotes Voicing MIDI notes
 * @param mood Current mood
 * @returns Gain multiplier (0.90 - 1.08)
 */
export function spacingGainCorrection(
  midiNotes: number[],
  mood: Mood
): number {
  const strictness = SPACING_STRICTNESS[mood];
  const quality = spacingQuality(midiNotes);
  const deviation = (quality - 0.5) * strictness * 0.35;
  return Math.max(0.90, Math.min(1.08, 1.0 + deviation));
}

/**
 * Get spacing strictness for a mood (for testing).
 */
export function spacingStrictness(mood: Mood): number {
  return SPACING_STRICTNESS[mood];
}
