/**
 * Contour arc scoring — score melodic passages for satisfying arch shapes.
 *
 * The most memorable melodies follow arch-shaped contours:
 * rise to a climax, then descend. This module scores melodic
 * contours against ideal arch shapes and provides gain emphasis
 * for well-shaped phrases.
 *
 * Applied as gain multiplier for arch-quality melodies.
 */

import type { Mood } from '../types';

/**
 * Per-mood arch preference (higher = prefer clear arch shapes).
 */
const ARCH_PREFERENCE: Record<Mood, number> = {
  trance:    0.35,  // moderate — driving lines
  avril:     0.65,  // highest — classical arches
  disco:     0.25,  // low — grooveLocked
  downtempo: 0.45,  // moderate
  blockhead: 0.20,  // low — choppy
  lofi:      0.50,  // moderate — jazz phrasing
  flim:      0.55,  // high — delicate arches
  xtal:      0.50,  // moderate
  syro:      0.15,  // lowest — erratic preferred
  ambient:   0.40,  // moderate — flowing arches,
  plantasia: 0.40,
};

/**
 * Score a melodic contour against an ideal arch shape.
 *
 * @param pitches Array of MIDI note numbers (phrase excerpt)
 * @returns Arch quality score (0.0 - 1.0)
 */
export function archScore(pitches: number[]): number {
  if (pitches.length < 3) return 0.5;

  const len = pitches.length;
  const climaxPos = pitches.indexOf(Math.max(...pitches));
  const idealClimaxPos = Math.floor(len * 0.6); // golden section ~60%

  // Score climax position (is it near the golden section?)
  const posDev = Math.abs(climaxPos - idealClimaxPos) / len;
  const posScore = Math.max(0, 1.0 - posDev * 2);

  // Score ascent before climax
  let ascentScore = 0;
  if (climaxPos > 0) {
    let rising = 0;
    for (let i = 1; i <= climaxPos; i++) {
      if (pitches[i] >= pitches[i - 1]) rising++;
    }
    ascentScore = rising / climaxPos;
  }

  // Score descent after climax
  let descentScore = 0;
  if (climaxPos < len - 1) {
    let falling = 0;
    for (let i = climaxPos + 1; i < len; i++) {
      if (pitches[i] <= pitches[i - 1]) falling++;
    }
    descentScore = falling / (len - 1 - climaxPos);
  }

  return posScore * 0.4 + ascentScore * 0.3 + descentScore * 0.3;
}

/**
 * Gain multiplier based on arch quality.
 *
 * @param pitches Recent melody pitches
 * @param mood Current mood
 * @returns Gain multiplier (0.93 - 1.07)
 */
export function archGainMultiplier(
  pitches: number[],
  mood: Mood
): number {
  const preference = ARCH_PREFERENCE[mood];
  const score = archScore(pitches);
  const deviation = (score - 0.5) * preference * 0.3;
  return Math.max(0.93, Math.min(1.07, 1.0 + deviation));
}

/**
 * Get arch preference for a mood (for testing).
 */
export function archPreference(mood: Mood): number {
  return ARCH_PREFERENCE[mood];
}
