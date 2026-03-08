import type { Mood, Section } from '../types';

/**
 * Melodic stepwise recovery — after a large leap, melodies
 * naturally recover by stepping back in the opposite direction.
 * This module applies a subtle gain boost to notes that follow
 * the recovery pattern after a leap.
 */

const recoveryStrength: Record<Mood, number> = {
  ambient: 0.30,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.20,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.15,
  blockhead: 0.20,
  flim: 0.40,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.8,
  groove: 1.0,
};

/**
 * Returns a gain multiplier that rewards stepwise recovery after leaps.
 * If the previous interval was a leap (>4 semitones) and the current
 * interval is a step (1-2 semitones) in the opposite direction,
 * apply a gain boost.
 *
 * @param prevInterval - previous interval in semitones (signed)
 * @param curInterval - current interval in semitones (signed)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function stepwiseRecoveryGain(
  prevInterval: number,
  curInterval: number,
  mood: Mood,
  section: Section
): number {
  const prevAbs = Math.abs(prevInterval);
  const curAbs = Math.abs(curInterval);

  // Previous must be a leap (>4 semitones)
  if (prevAbs <= 4) return 1.0;
  // Current must be a step (1-2 semitones)
  if (curAbs < 1 || curAbs > 2) return 1.0;
  // Must be in opposite direction
  if (Math.sign(prevInterval) === Math.sign(curInterval)) return 1.0;

  const depth = recoveryStrength[mood] * sectionMultiplier[section];
  // Bigger leaps deserve more recovery emphasis
  const leapFactor = Math.min((prevAbs - 4) / 8, 1.0);
  return 1.0 + 0.03 * depth * (0.5 + 0.5 * leapFactor);
}

export function recoveryStrengthValue(mood: Mood): number {
  return recoveryStrength[mood];
}
