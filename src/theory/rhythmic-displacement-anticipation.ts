import type { Mood, Section } from '../types';

/**
 * Rhythmic displacement anticipation — notes that arrive
 * slightly before the expected beat (anticipation) create
 * forward pull and energy. Boost gain on positions that
 * represent anticipated arrivals (just before strong beats).
 */

const anticipationStrength: Record<Mood, number> = {
  ambient: 0.10,
  downtempo: 0.25,
  lofi: 0.35,
  trance: 0.40,
  avril: 0.30,
  xtal: 0.25,
  syro: 0.55,
  blockhead: 0.45,
  flim: 0.30,
  disco: 0.50,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 1.0,
  peak: 1.1,
  breakdown: 0.5,
  groove: 1.2,
};

/**
 * Determines if a position is an anticipation (just before
 * a strong beat). In 16-step grid, positions 15, 3, 7, 11
 * anticipate beats 0, 4, 8, 12 respectively.
 *
 * @param position - position in 16-step pattern (0-15)
 * @returns anticipation strength 0-1
 */
export function isAnticipation(position: number): number {
  const pos = ((position % 16) + 16) % 16;
  // Position just before a strong beat
  if (pos === 15) return 1.0;  // anticipates beat 1 (strongest)
  if (pos === 3) return 0.7;   // anticipates beat 2
  if (pos === 7) return 0.8;   // anticipates beat 3
  if (pos === 11) return 0.7;  // anticipates beat 4
  return 0;
}

/**
 * Returns a gain multiplier for anticipated notes.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function anticipationGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const antic = isAnticipation(beatPosition);
  if (antic < 0.01) return 1.0;

  const depth = anticipationStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * antic * depth;
}

export function anticipationStrengthValue(mood: Mood): number {
  return anticipationStrength[mood];
}
