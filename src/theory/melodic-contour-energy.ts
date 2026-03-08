import type { Mood } from '../types';

/**
 * Melodic contour energy — ascending melodic motion gets an energy
 * boost (natural crescendo), descending gets softening (natural
 * diminuendo). Models the performance tendency to push upward phrases.
 */

const moodContourDepth: Record<Mood, number> = {
  ambient: 0.25,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.35,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.20,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.30,
};

/**
 * Gain multiplier based on melodic direction.
 * direction: 'ascending' | 'descending' | 'static'
 */
export function contourEnergyGain(
  direction: 'ascending' | 'descending' | 'static',
  mood: Mood,
): number {
  const depth = moodContourDepth[mood];
  if (direction === 'static') return 1.0;
  const boost = direction === 'ascending' ? depth * 0.04 : -depth * 0.03;
  return Math.max(0.97, Math.min(1.04, 1.0 + boost));
}

/** Per-mood contour depth for testing */
export function contourDepth(mood: Mood): number {
  return moodContourDepth[mood];
}
