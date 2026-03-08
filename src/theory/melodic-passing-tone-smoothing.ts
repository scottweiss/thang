import type { Mood, Section } from '../types';

/**
 * Melodic passing tone smoothing — passing tones connect two
 * chord tones by stepwise motion. They should be slightly
 * softer than their surrounding chord tones to maintain
 * smooth linear flow without drawing too much attention.
 */

const smoothingDepth: Record<Mood, number> = {
  ambient: 0.40,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.20,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.15,
  blockhead: 0.10,
  flim: 0.45,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.8,
  build: 1.0,
  peak: 0.9,
  breakdown: 1.1,
  groove: 0.9,
};

/**
 * Detects if the current note is a passing tone.
 * A passing tone has stepwise motion in the same direction
 * both arriving and departing (both ascending or both descending).
 *
 * @param arrivalInterval - signed semitones arriving
 * @param departureInterval - signed semitones departing
 * @returns true if passing tone
 */
export function isPassingTone(
  arrivalInterval: number,
  departureInterval: number
): boolean {
  const arrAbs = Math.abs(arrivalInterval);
  const depAbs = Math.abs(departureInterval);
  // Both must be steps (1-2 semitones)
  if (arrAbs < 1 || arrAbs > 2) return false;
  if (depAbs < 1 || depAbs > 2) return false;
  // Must continue in same direction
  return Math.sign(arrivalInterval) === Math.sign(departureInterval);
}

/**
 * Returns a gain multiplier that smooths passing tones.
 * Passing tones get slightly reduced gain for smooth flow.
 *
 * @param arrivalInterval - signed semitones arriving
 * @param departureInterval - signed semitones departing
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [0.97, 1.0]
 */
export function passingToneSmoothingGain(
  arrivalInterval: number,
  departureInterval: number,
  mood: Mood,
  section: Section
): number {
  if (!isPassingTone(arrivalInterval, departureInterval)) return 1.0;
  const depth = smoothingDepth[mood] * sectionMultiplier[section];
  return 1.0 - 0.03 * depth;
}

export function smoothingDepthValue(mood: Mood): number {
  return smoothingDepth[mood];
}
