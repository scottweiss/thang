import type { Mood, Section } from '../types';

/**
 * Rhythmic agogic accent — longer notes naturally feel
 * accented due to their duration (agogic accent). Boost gain
 * when a note's duration exceeds the average, creating
 * natural emphasis without velocity changes.
 */

const agogicStrength: Record<Mood, number> = {
  ambient: 0.50,
  downtempo: 0.40,
  lofi: 0.35,
  trance: 0.20,
  avril: 0.45,
  xtal: 0.35,
  syro: 0.25,
  blockhead: 0.30,
  flim: 0.55,
  disco: 0.15,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.2,
  groove: 0.8,
};

/**
 * Calculates agogic emphasis based on duration ratio.
 * A note that is 2x the average gets full emphasis.
 *
 * @param noteDuration - duration of this note (any unit)
 * @param averageDuration - average note duration in context
 * @returns emphasis value 0-1
 */
export function agogicEmphasis(
  noteDuration: number,
  averageDuration: number
): number {
  if (averageDuration <= 0 || noteDuration <= averageDuration) return 0;
  const ratio = noteDuration / averageDuration;
  // Linear ramp: 1x = no boost, 2x+ = full boost
  return Math.min((ratio - 1.0), 1.0);
}

/**
 * Returns a gain multiplier for agogic accent emphasis.
 *
 * @param noteDuration - duration of current note
 * @param averageDuration - average duration in context
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function agogicAccentGain(
  noteDuration: number,
  averageDuration: number,
  mood: Mood,
  section: Section
): number {
  const emphasis = agogicEmphasis(noteDuration, averageDuration);
  if (emphasis < 0.01) return 1.0;

  const depth = agogicStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * emphasis * depth;
}

export function agogicStrengthValue(mood: Mood): number {
  return agogicStrength[mood];
}
