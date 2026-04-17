import type { Mood } from '../types';

/**
 * Dynamic sustain tracking — when many layers sustain simultaneously,
 * reduce individual sustain to prevent buildup. When few layers sustain,
 * allow longer sustain for fullness.
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.25,
  plantasia: 0.25,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.50,
  avril: 0.40,
  xtal: 0.30,
  syro: 0.45,
  blockhead: 0.55,
  flim: 0.35,
  disco: 0.50,
};

/**
 * Decay multiplier based on active sustaining layer count.
 * sustainingLayers: number of layers currently holding notes (1-6)
 * More sustaining layers → shorter decay (< 1), fewer → longer (> 1).
 */
export function sustainTrackingDecay(
  sustainingLayers: number,
  mood: Mood,
): number {
  const sensitivity = moodSensitivity[mood];
  const center = 3; // 3 layers is neutral
  const deviation = (sustainingLayers - center) / 3; // -0.67 to 1.0
  const adjustment = -deviation * sensitivity * 0.10;
  return Math.max(0.90, Math.min(1.08, 1.0 + adjustment));
}

/** Per-mood sensitivity for testing */
export function sustainSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
