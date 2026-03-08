import type { Mood, Section } from '../types';

/**
 * Melodic cambiata figure — the nota cambiata is a four-note
 * ornamental figure: step, leap of a 3rd in the same direction,
 * then step back. It creates elegant melodic turns.
 * Boost gain when the pattern is approximated.
 */

const cambiataStrength: Record<Mood, number> = {
  ambient: 0.15,
  downtempo: 0.25,
  lofi: 0.30,
  trance: 0.20,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.25,
  blockhead: 0.10,
  flim: 0.50,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.1,
  groove: 0.8,
};

/**
 * Scores how closely three consecutive intervals match a cambiata.
 * Ideal cambiata: step (1-2), leap of 3rd (3-4) same dir, step back (1-2) opposite.
 *
 * @param int1 - first interval (signed semitones)
 * @param int2 - second interval (signed semitones)
 * @param int3 - third interval (signed semitones)
 * @returns similarity score 0-1
 */
export function cambiataScore(
  int1: number,
  int2: number,
  int3: number
): number {
  const abs1 = Math.abs(int1);
  const abs2 = Math.abs(int2);
  const abs3 = Math.abs(int3);

  // First must be a step
  if (abs1 < 1 || abs1 > 2) return 0;
  // Second must be a 3rd in same direction
  if (abs2 < 3 || abs2 > 4) return 0;
  if (Math.sign(int1) !== Math.sign(int2)) return 0;
  // Third must be a step back
  if (abs3 < 1 || abs3 > 2) return 0;
  if (Math.sign(int2) === Math.sign(int3)) return 0;

  return 1.0;
}

/**
 * Returns a gain multiplier for cambiata figures.
 *
 * @param int1 - first interval
 * @param int2 - second interval
 * @param int3 - third interval
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function cambiataFigureGain(
  int1: number,
  int2: number,
  int3: number,
  mood: Mood,
  section: Section
): number {
  const score = cambiataScore(int1, int2, int3);
  if (score <= 0) return 1.0;
  const depth = cambiataStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * score * depth;
}

export function cambiataStrengthValue(mood: Mood): number {
  return cambiataStrength[mood];
}
