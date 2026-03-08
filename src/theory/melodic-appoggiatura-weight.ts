import type { Mood, Section } from '../types';

/**
 * Melodic appoggiatura weight — an appoggiatura is an accented
 * non-chord tone that resolves by step. Unlike neighbor tones,
 * appoggiaturas arrive by leap and resolve by step, creating
 * a characteristic "lean" that deserves emphasis.
 */

const appoggiaturaStrength: Record<Mood, number> = {
  ambient: 0.20,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.25,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.30,
  blockhead: 0.15,
  flim: 0.50,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 0.9,
  peak: 1.2,
  breakdown: 1.0,
  groove: 0.8,
};

/**
 * Detects if a note functions as an appoggiatura.
 * Arrives by leap (>2 semitones) and resolves by step (1-2 semitones)
 * in the opposite direction.
 *
 * @param arrivalInterval - interval arriving at this note (signed semitones)
 * @param resolutionInterval - interval leaving this note (signed semitones)
 * @returns true if this note is an appoggiatura
 */
export function isAppoggiatura(
  arrivalInterval: number,
  resolutionInterval: number
): boolean {
  const arrAbs = Math.abs(arrivalInterval);
  const resAbs = Math.abs(resolutionInterval);
  // Arrives by leap
  if (arrAbs <= 2) return false;
  // Resolves by step
  if (resAbs < 1 || resAbs > 2) return false;
  // Opposite direction
  return Math.sign(arrivalInterval) !== Math.sign(resolutionInterval);
}

/**
 * Returns a gain multiplier that emphasizes appoggiaturas.
 *
 * @param arrivalInterval - interval arriving at note (signed semitones)
 * @param resolutionInterval - interval leaving note (signed semitones)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.04]
 */
export function appoggiaturaWeightGain(
  arrivalInterval: number,
  resolutionInterval: number,
  mood: Mood,
  section: Section
): number {
  if (!isAppoggiatura(arrivalInterval, resolutionInterval)) return 1.0;
  const depth = appoggiaturaStrength[mood] * sectionMultiplier[section];
  // Larger leaps create more dramatic appoggiaturas
  const leapFactor = Math.min((Math.abs(arrivalInterval) - 2) / 10, 1.0);
  return 1.0 + 0.04 * depth * (0.6 + 0.4 * leapFactor);
}

export function appoggiaturaStrengthValue(mood: Mood): number {
  return appoggiaturaStrength[mood];
}
