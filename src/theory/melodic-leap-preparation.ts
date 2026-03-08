import type { Mood } from '../types';

/**
 * Melodic leap preparation — the note immediately before a large
 * melodic leap gets a slight gain emphasis, functioning as an
 * "announcement" of the coming leap. Classical preparation principle.
 */

const moodPreparation: Record<Mood, number> = {
  ambient: 0.25,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.20,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.30,
};

/**
 * Gain multiplier for leap preparation.
 * nextInterval: absolute interval in semitones to the next note
 * Large intervals (>= 5 semitones) trigger preparation emphasis.
 */
export function leapPreparationGain(
  nextInterval: number,
  mood: Mood,
): number {
  const absInt = Math.abs(nextInterval);
  if (absInt < 5) return 1.0; // not a leap
  const prep = moodPreparation[mood];
  const leapSize = Math.min((absInt - 4) / 8, 1.0); // 0-1 scale
  const boost = leapSize * prep * 0.05;
  return Math.min(1.04, 1.0 + boost);
}

/** Per-mood preparation depth for testing */
export function preparationDepth(mood: Mood): number {
  return moodPreparation[mood];
}
