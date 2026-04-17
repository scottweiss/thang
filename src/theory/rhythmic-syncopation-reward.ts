import type { Mood, Section } from '../types';

/**
 * Rhythmic syncopation reward — off-beat notes in groove-oriented moods
 * get a gain emphasis to reinforce syncopated feel. On-beat notes
 * in steady moods also get rewarded for stability.
 */

const moodSyncopation: Record<Mood, number> = {
  ambient: 0.10,
  plantasia: 0.10,
  downtempo: 0.35,
  lofi: 0.50,
  trance: 0.15,
  avril: 0.30,
  xtal: 0.25,
  syro: 0.55,
  blockhead: 0.45,
  flim: 0.40,
  disco: 0.40,
};

/**
 * Gain multiplier rewarding syncopation or stability depending on mood.
 * isOffbeat: true if the note falls on an off-beat position
 * Groove moods reward off-beats, steady moods reward on-beats.
 */
export function syncopationRewardGain(
  isOffbeat: boolean,
  mood: Mood,
): number {
  const strength = moodSyncopation[mood];
  // High syncopation moods reward off-beats
  const reward = isOffbeat ? strength * 0.04 : -strength * 0.02;
  return Math.max(0.97, Math.min(1.04, 1.0 + reward));
}

/** Per-mood syncopation reward for testing */
export function syncopationStrength(mood: Mood): number {
  return moodSyncopation[mood];
}
