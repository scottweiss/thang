import type { Mood, Section } from '../types';

/**
 * Melodic neighbor tone emphasis — neighbor tones (chromatic or
 * diatonic notes that step away from and return to a chord tone)
 * create expressive tension. This module boosts gain on notes
 * that function as neighbor tones to highlight their ornamental quality.
 */

const neighborStrength: Record<Mood, number> = {
  ambient: 0.20,
  plantasia: 0.20,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.15,
  avril: 0.50,
  xtal: 0.30,
  syro: 0.40,
  blockhead: 0.20,
  flim: 0.55,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.8,
  groove: 1.1,
};

/**
 * Determines if a note functions as a neighbor tone.
 * A neighbor tone steps away from a chord tone by 1-2 semitones
 * and returns to the same chord tone.
 *
 * @param prevInterval - interval from previous note (semitones, signed)
 * @param curInterval - interval to next note (semitones, signed)
 * @returns true if this note is a neighbor tone
 */
export function isNeighborTone(
  prevInterval: number,
  curInterval: number
): boolean {
  const prevAbs = Math.abs(prevInterval);
  const curAbs = Math.abs(curInterval);
  // Must be a step (1-2 semitones) in each direction
  if (prevAbs < 1 || prevAbs > 2) return false;
  if (curAbs < 1 || curAbs > 2) return false;
  // Must return in opposite direction
  return Math.sign(prevInterval) !== Math.sign(curInterval);
}

/**
 * Returns a gain multiplier that emphasizes neighbor tones.
 *
 * @param prevInterval - interval from previous note (semitones)
 * @param curInterval - interval to next note (semitones)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function neighborToneEmphasisGain(
  prevInterval: number,
  curInterval: number,
  mood: Mood,
  section: Section
): number {
  if (!isNeighborTone(prevInterval, curInterval)) return 1.0;
  const depth = neighborStrength[mood] * sectionMultiplier[section];
  // Chromatic neighbors (1 semitone) get slightly more emphasis
  const chromatic = Math.abs(prevInterval) === 1 ? 1.2 : 1.0;
  return 1.0 + 0.03 * depth * chromatic;
}

export function neighborStrengthValue(mood: Mood): number {
  return neighborStrength[mood];
}
