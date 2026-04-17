/**
 * Interval direction bias — ascending vs descending preference.
 *
 * Different moods and sections favor different melodic directions:
 * - Builds favor ascending motion (energy rising)
 * - Breakdowns favor descending motion (releasing)
 * - Some moods (avril) favor ascending for brightness
 * - Others (ambient) favor descending for calm
 *
 * Applied as gain emphasis for notes moving in the favored direction.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood ascending bias (-1 = descending, 0 = neutral, 1 = ascending).
 */
const MOOD_DIRECTION: Record<Mood, number> = {
  trance:    0.20,   // slight ascending — energy
  avril:     0.35,   // ascending — bright, hopeful
  disco:     0.15,   // slight ascending — uplifting
  downtempo: -0.15,  // slight descending — relaxed
  blockhead: 0.00,   // neutral — raw
  lofi:      -0.20,  // descending — melancholy
  flim:      0.10,   // slight ascending — delicate
  xtal:      -0.10,  // slight descending — atmospheric
  syro:      0.00,   // neutral — unpredictable
  ambient:   -0.25,  // descending — settling,
  plantasia: -0.25,
};

/**
 * Section direction modifier.
 */
const SECTION_DIRECTION: Record<Section, number> = {
  intro:     -0.10,  // neutral to descending
  build:      0.30,  // ascending — building energy
  peak:       0.10,  // slight ascending
  breakdown: -0.30,  // descending — releasing
  groove:     0.05,  // neutral
};

/**
 * Calculate direction bias gain for a melodic interval.
 *
 * @param intervalDirection 1 for ascending, -1 for descending, 0 for unison
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.93 - 1.07)
 */
export function directionBiasGain(
  intervalDirection: number,
  mood: Mood,
  section: Section
): number {
  const moodBias = MOOD_DIRECTION[mood];
  const sectionBias = SECTION_DIRECTION[section];
  const totalBias = moodBias + sectionBias;
  const dir = Math.sign(intervalDirection);

  // Alignment: direction matches bias = boost
  const alignment = dir * totalBias;
  const adjustment = alignment * 0.10;

  return Math.max(0.93, Math.min(1.07, 1.0 + adjustment));
}

/**
 * Get mood direction bias (for testing).
 */
export function moodDirection(mood: Mood): number {
  return MOOD_DIRECTION[mood];
}
