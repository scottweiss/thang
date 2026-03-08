import type { Mood } from '../types';

/**
 * Voice overlap avoidance — when two layers occupy the same pitch register,
 * the less important one gets a gain reduction to maintain clarity.
 * Priority: melody > arp > harmony > drone > atmosphere > texture
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.55,
  downtempo: 0.40,
  lofi: 0.50,
  trance: 0.30,
  avril: 0.45,
  xtal: 0.50,
  syro: 0.25,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.30,
};

const layerPriority: Record<string, number> = {
  melody: 6,
  arp: 5,
  harmony: 4,
  drone: 3,
  atmosphere: 2,
  texture: 1,
};

/**
 * Gain multiplier for a layer when it overlaps with another.
 * Returns < 1.0 for the lower-priority layer when registers overlap.
 * overlapSemitones: how close the two layers' center pitches are (0 = same)
 */
export function overlapAvoidanceGain(
  layerName: string,
  otherLayerName: string,
  overlapSemitones: number,
  mood: Mood,
): number {
  if (overlapSemitones > 12) return 1.0; // no overlap
  const myPriority = layerPriority[layerName] ?? 1;
  const otherPriority = layerPriority[otherLayerName] ?? 1;
  if (myPriority >= otherPriority) return 1.0; // I'm dominant

  const sensitivity = moodSensitivity[mood];
  const closeness = 1.0 - overlapSemitones / 12; // 1.0 at unison, 0 at octave
  const reduction = closeness * sensitivity * 0.06;
  return Math.max(0.94, 1.0 - reduction);
}

/** Per-mood sensitivity for testing */
export function overlapSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
