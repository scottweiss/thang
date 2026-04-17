import type { Mood } from '../types';

/**
 * Note density saturation — when too many notes play simultaneously
 * across layers, individual notes lose impact. Apply gain thinning
 * to preserve clarity when density is high.
 */

const moodThreshold: Record<Mood, number> = {
  ambient: 3.0,
  plantasia: 3.0,
  downtempo: 4.0,
  lofi: 4.5,
  trance: 5.5,
  avril: 4.0,
  xtal: 3.5,
  syro: 6.0,
  blockhead: 5.0,
  flim: 4.0,
  disco: 5.5,
};

/**
 * Gain multiplier for density saturation.
 * activeLayers: number of currently active layers
 * Returns < 1.0 when density exceeds mood threshold.
 */
export function densitySaturationGain(
  activeLayers: number,
  mood: Mood,
): number {
  const threshold = moodThreshold[mood];
  if (activeLayers <= threshold) return 1.0;
  const excess = activeLayers - threshold;
  const reduction = excess * 0.03;
  return Math.max(0.94, 1.0 - reduction);
}

/** Per-mood threshold for testing */
export function saturationThreshold(mood: Mood): number {
  return moodThreshold[mood];
}
