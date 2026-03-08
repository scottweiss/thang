import type { Mood, Section } from '../types';

/**
 * Melodic climax targeting — applies gain emphasis as melody
 * approaches its registral peak within a phrase. The highest
 * note in a phrase should feel like an arrival point.
 */

const climaxIntensity: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.25,
  lofi: 0.20,
  trance: 0.45,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.35,
  blockhead: 0.25,
  flim: 0.40,
  disco: 0.40,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.0,
  peak: 1.3,
  breakdown: 0.6,
  groove: 0.8,
};

/**
 * Returns a gain multiplier based on proximity to the phrase's
 * registral peak. As currentPitch approaches highestPitch,
 * the gain increases.
 *
 * @param currentPitch - current MIDI note (0-127)
 * @param highestPitch - highest pitch reached in phrase (0-127)
 * @param phrasePitchRange - total semitone range of phrase
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.04]
 */
export function climaxTargetingGain(
  currentPitch: number,
  highestPitch: number,
  phrasePitchRange: number,
  mood: Mood,
  section: Section
): number {
  if (phrasePitchRange <= 0) return 1.0;
  const proximity = 1.0 - Math.abs(currentPitch - highestPitch) / phrasePitchRange;
  if (proximity <= 0) return 1.0;
  const depth = climaxIntensity[mood] * sectionMultiplier[section];
  return 1.0 + proximity * 0.04 * depth;
}

export function climaxIntensityValue(mood: Mood): number {
  return climaxIntensity[mood];
}
