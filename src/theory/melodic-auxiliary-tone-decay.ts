import type { Mood, Section } from '../types';

/**
 * Melodic auxiliary tone decay — auxiliary tones (repeated notes
 * with brief departures) create a hovering effect. Apply
 * gradual decay to the gain of repeated auxiliary figures
 * to prevent them from becoming monotonous.
 */

const decayRate: Record<Mood, number> = {
  ambient: 0.15,
  plantasia: 0.15,
  downtempo: 0.25,
  lofi: 0.20,
  trance: 0.30,
  avril: 0.40,
  xtal: 0.25,
  syro: 0.55,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 1.0,
  peak: 0.8,
  breakdown: 1.1,
  groove: 0.9,
};

/**
 * Returns a gain multiplier that decays with auxiliary repetition.
 * The more times a pitch center stays the same, the more
 * the gain decays to encourage movement.
 *
 * @param repetitionCount - how many ticks the pitch has stayed (0+)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [0.96, 1.0]
 */
export function auxiliaryToneDecayGain(
  repetitionCount: number,
  mood: Mood,
  section: Section
): number {
  if (repetitionCount <= 1) return 1.0;
  const clamped = Math.min(repetitionCount, 8);
  const depth = decayRate[mood] * sectionMultiplier[section];
  const decay = (clamped - 1) / 7 * 0.04 * depth;
  return 1.0 - decay;
}

export function decayRateValue(mood: Mood): number {
  return decayRate[mood];
}
