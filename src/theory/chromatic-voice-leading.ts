/**
 * Chromatic voice leading — semitone motion between chord tones.
 *
 * The smoothest chord transitions move individual voices by semitone.
 * This module detects when a chord change allows chromatic voice leading
 * and boosts the gain/clarity of the moving voice to highlight it.
 *
 * Applied as gain emphasis on the chromatically moving voice.
 */

import type { Mood } from '../types';

/**
 * Per-mood chromatic emphasis strength.
 */
const CHROMATIC_EMPHASIS: Record<Mood, number> = {
  trance:    0.20,  // weak — pad transitions
  avril:     0.55,  // strong — classical voice leading
  disco:     0.25,  // moderate
  downtempo: 0.40,  // strong
  blockhead: 0.15,  // weak — hip-hop less voice-leading focused
  lofi:      0.50,  // strong — jazz voice leading
  flim:      0.35,  // moderate
  xtal:      0.30,  // moderate
  syro:      0.20,  // weak — IDM chords jump
  ambient:   0.45,  // strong — smooth transitions
};

/**
 * Count chromatic (semitone) movements between two chord voicings.
 *
 * @param prevNotes Previous chord notes (pitch classes 0-11)
 * @param nextNotes Next chord notes (pitch classes 0-11)
 * @returns Number of voices that move by exactly 1 semitone
 */
export function countChromaticMotions(
  prevNotes: number[],
  nextNotes: number[]
): number {
  let count = 0;
  const usedNext = new Set<number>();
  for (const prev of prevNotes) {
    for (const next of nextNotes) {
      if (usedNext.has(next)) continue;
      const dist = Math.abs(((next - prev) % 12 + 12) % 12);
      if (dist === 1 || dist === 11) { // semitone up or down
        count++;
        usedNext.add(next);
        break;
      }
    }
  }
  return count;
}

/**
 * Calculate gain boost for chromatic voice leading emphasis.
 *
 * @param chromaticMotions Number of chromatic voice movements
 * @param totalVoices Total voice count
 * @param mood Current mood
 * @returns Gain multiplier (1.0 - 1.12)
 */
export function chromaticLeadingGain(
  chromaticMotions: number,
  totalVoices: number,
  mood: Mood
): number {
  if (chromaticMotions === 0 || totalVoices === 0) return 1.0;
  const ratio = chromaticMotions / totalVoices;
  const emphasis = CHROMATIC_EMPHASIS[mood];
  return 1.0 + ratio * emphasis * 0.12;
}

/**
 * Get chromatic emphasis for a mood (for testing).
 */
export function chromaticEmphasis(mood: Mood): number {
  return CHROMATIC_EMPHASIS[mood];
}
