import type { Mood } from '../types';

/**
 * Melodic interval variety tracking — tracks which intervals have been
 * used recently and boosts underused ones. Prevents melodic monotony
 * where the same interval dominates.
 */

const moodVarietyAppetite: Record<Mood, number> = {
  ambient: 0.25,
  plantasia: 0.25,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.30,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.60,
  blockhead: 0.35,
  flim: 0.40,
  disco: 0.25,
};

/**
 * Gain multiplier based on interval variety.
 * recentIntervals: array of recent interval sizes (in semitones)
 * currentInterval: the interval about to be played
 * Underused intervals get boost, overused get reduction.
 */
export function intervalVarietyGain(
  recentIntervals: number[],
  currentInterval: number,
  mood: Mood,
): number {
  if (recentIntervals.length < 3) return 1.0;
  const appetite = moodVarietyAppetite[mood];
  // Count how often this interval appeared recently
  const absInterval = Math.abs(currentInterval);
  const count = recentIntervals.filter(i => Math.abs(i) === absInterval).length;
  const frequency = count / recentIntervals.length;
  // High frequency → overused (reduce), low → fresh (boost)
  const deviation = (0.3 - frequency) * 2; // positive = underused
  const adjustment = deviation * appetite * 0.05;
  return Math.max(0.96, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood variety appetite for testing */
export function varietyAppetite(mood: Mood): number {
  return moodVarietyAppetite[mood];
}
