/**
 * Scale color and modal character.
 *
 * Different modes carry different emotional weights:
 * - Ionian (major): bright, happy, resolved
 * - Dorian: jazzy, sophisticated, bittersweet
 * - Phrygian: dark, exotic, Spanish
 * - Lydian: dreamy, floating, ethereal
 * - Mixolydian: bluesy, rock, slightly dark
 * - Aeolian (minor): sad, introspective, dark
 * - Locrian: tense, unstable, dissonant
 *
 * This module maps moods to preferred scale colors and provides
 * functions for intelligent scale selection based on musical context.
 */

import type { Mood, ScaleType } from '../types';

export interface ScaleCharacter {
  brightness: number;  // 0 = darkest (locrian), 1 = brightest (lydian)
  tension: number;     // 0 = most resolved, 1 = most tense
  exoticism: number;   // 0 = common, 1 = unusual/exotic
}

const SCALE_CHARACTERS: Record<ScaleType, ScaleCharacter> = {
  major:      { brightness: 0.8, tension: 0.1, exoticism: 0.1 },
  minor:      { brightness: 0.3, tension: 0.3, exoticism: 0.2 },
  dorian:     { brightness: 0.5, tension: 0.25, exoticism: 0.3 },
  phrygian:   { brightness: 0.15, tension: 0.5, exoticism: 0.7 },
  lydian:     { brightness: 0.95, tension: 0.15, exoticism: 0.4 },
  mixolydian: { brightness: 0.6, tension: 0.2, exoticism: 0.25 },
  aeolian:    { brightness: 0.3, tension: 0.3, exoticism: 0.2 },
  locrian:    { brightness: 0.05, tension: 0.9, exoticism: 0.8 },
  pentatonic: { brightness: 0.7, tension: 0.05, exoticism: 0.1 },
  minor_pentatonic: { brightness: 0.35, tension: 0.15, exoticism: 0.2 },
};

/**
 * Preferred scale types for each mood, ordered by preference.
 */
const MOOD_SCALE_PREFERENCES: Record<Mood, ScaleType[]> = {
  ambient:   ['lydian', 'major', 'pentatonic', 'dorian'],
  downtempo: ['dorian', 'minor', 'mixolydian', 'aeolian'],
  lofi:      ['dorian', 'minor', 'pentatonic', 'minor_pentatonic'],
  trance:    ['minor', 'phrygian', 'aeolian', 'major'],
  avril:     ['major', 'lydian', 'dorian', 'pentatonic'],
  xtal:      ['lydian', 'major', 'dorian', 'pentatonic'],
  syro:      ['dorian', 'phrygian', 'mixolydian', 'minor_pentatonic'],
  blockhead: ['dorian', 'minor', 'minor_pentatonic', 'mixolydian'],
  flim:      ['lydian', 'major', 'dorian', 'pentatonic'],
  disco:     ['dorian', 'mixolydian', 'major', 'minor'],
};

/**
 * Get the character profile of a scale type.
 */
export function getScaleCharacter(scaleType: ScaleType): ScaleCharacter {
  return SCALE_CHARACTERS[scaleType] ?? { brightness: 0.5, tension: 0.3, exoticism: 0.2 };
}

/**
 * Get preferred scale types for a mood.
 */
export function getPreferredScales(mood: Mood): ScaleType[] {
  return MOOD_SCALE_PREFERENCES[mood] ?? ['minor', 'dorian'];
}

/**
 * Score how well a scale type fits the current musical context.
 * Higher = better fit.
 *
 * @param scaleType     The scale to evaluate
 * @param mood          Current mood
 * @param tension       Current tension level (0-1)
 * @param sectionDepth  How deep into the piece (0-1, higher = later)
 */
export function scaleContextScore(
  scaleType: ScaleType,
  mood: Mood,
  tension: number,
  sectionDepth: number
): number {
  const char = getScaleCharacter(scaleType);
  const preferences = getPreferredScales(mood);

  // Preference bonus: strongly favor scales in the mood's list
  const prefIdx = preferences.indexOf(scaleType);
  const prefBonus = prefIdx >= 0 ? (preferences.length - prefIdx) / preferences.length : 0;

  // Tension match: high-tension moments benefit from tenser scales
  const tensionMatch = 1 - Math.abs(char.tension - tension * 0.5);

  // Exoticism ramps up over time (keeps things interesting)
  const exoticBonus = char.exoticism * sectionDepth * 0.3;

  return prefBonus * 0.5 + tensionMatch * 0.3 + exoticBonus * 0.2;
}

/**
 * Pick the best scale type for the current context.
 */
export function pickContextualScale(
  mood: Mood,
  tension: number,
  sectionDepth: number,
  currentScale?: ScaleType
): ScaleType {
  const candidates = getPreferredScales(mood);

  let bestScale = candidates[0];
  let bestScore = -Infinity;

  for (const scale of candidates) {
    let score = scaleContextScore(scale, mood, tension, sectionDepth);
    // Small penalty for staying on same scale (encourage modulation)
    if (scale === currentScale) score -= 0.05;
    if (score > bestScore) {
      bestScore = score;
      bestScale = scale;
    }
  }

  return bestScale;
}
