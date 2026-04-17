import type { Mood } from '../types';

/**
 * Melodic phrase completion — when a phrase reaches its expected length,
 * the final notes get a satisfying emphasis. Incomplete phrases that
 * cut short get no bonus. Rewards musical completeness.
 */

const moodCompletionBonus: Record<Mood, number> = {
  ambient: 0.30,
  plantasia: 0.30,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.50,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.20,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.45,
};

/**
 * Gain multiplier for phrase completion emphasis.
 * phraseProgress: 0-1 position in phrase
 * Near completion (0.85-1.0) → slight gain emphasis for satisfying cadence.
 */
export function phraseCompletionGain(
  phraseProgress: number,
  mood: Mood,
): number {
  if (phraseProgress < 0.85) return 1.0;
  const bonus = moodCompletionBonus[mood];
  // Ramp up toward phrase end
  const completion = (phraseProgress - 0.85) / 0.15;
  const boost = completion * bonus * 0.04;
  return Math.min(1.03, 1.0 + boost);
}

/** Per-mood completion bonus for testing */
export function completionBonus(mood: Mood): number {
  return moodCompletionBonus[mood];
}
