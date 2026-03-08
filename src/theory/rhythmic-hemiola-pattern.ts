import type { Mood, Section } from '../types';

/**
 * Rhythmic hemiola pattern — creates the feeling of 3-against-2
 * by accenting every 3rd position in a duple meter context.
 * Hemiola is one of the most powerful rhythmic tension devices,
 * commonly used at cadential points.
 */

const hemiolaStrength: Record<Mood, number> = {
  ambient: 0.05,
  downtempo: 0.20,
  lofi: 0.30,
  trance: 0.35,
  avril: 0.40,
  xtal: 0.25,
  syro: 0.55,
  blockhead: 0.45,
  flim: 0.30,
  disco: 0.50,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.3,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.4,
  groove: 0.9,
};

/**
 * Returns a gain multiplier for hemiola accent patterns.
 * In a 16-step pattern, accenting every 3rd step creates
 * a 3-against-4 hemiola. Only active during certain tick
 * ranges to avoid constant polyrhythm fatigue.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param tick - current tick
 * @param sectionProgress - progress through section (0-1)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function hemiolaPatternGain(
  beatPosition: number,
  tick: number,
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const depth = hemiolaStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  // Hemiola is most effective approaching cadences (70-90% of section)
  if (sectionProgress < 0.7 || sectionProgress > 0.95) return 1.0;

  const pos = beatPosition % 16;
  // Every 3rd position in a 12-step cycle (within 16-step grid)
  if (pos % 3 === 0 && pos < 12) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function hemiolaStrengthValue(mood: Mood): number {
  return hemiolaStrength[mood];
}
