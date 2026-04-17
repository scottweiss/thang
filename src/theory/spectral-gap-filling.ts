import type { Mood } from '../types';

/**
 * Spectral gap filling — when a frequency band is unoccupied by other
 * layers, the layer filling that gap gets a gain boost. Creates fuller
 * spectral coverage without over-crowding.
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.55,
  plantasia: 0.55,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.35,
  avril: 0.40,
  xtal: 0.50,
  syro: 0.30,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.30,
};

/**
 * Gain multiplier for a layer filling a spectral gap.
 * myCenter: this layer's center frequency in MIDI
 * otherCenters: center pitches of other active layers
 * Large gap from nearest neighbor → boost.
 */
export function gapFillingGain(
  myCenter: number,
  otherCenters: number[],
  mood: Mood,
): number {
  if (otherCenters.length === 0) return 1.0;
  // Find minimum distance to any other layer
  let minDist = Infinity;
  for (const c of otherCenters) {
    minDist = Math.min(minDist, Math.abs(myCenter - c));
  }
  const sensitivity = moodSensitivity[mood];
  // If far from all others (>12 semitones), boost; if close (<6), neutral
  const gapScore = Math.max(0, (minDist - 6) / 12); // 0 at 6 semitones, 0.5 at 12
  const boost = gapScore * sensitivity * 0.06;
  return Math.min(1.04, 1.0 + boost);
}

/** Per-mood sensitivity for testing */
export function gapSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
