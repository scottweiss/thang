import type { Mood } from '../types';

/**
 * Harmonic tension color map — maps overall tension to filter warmth.
 * Low tension → warm (lower LPF), high tension → bright (higher LPF).
 * Creates a natural association between harmonic tension and timbral brightness.
 */

const moodColorRange: Record<Mood, number> = {
  ambient: 0.55,
  plantasia: 0.55,
  downtempo: 0.40,
  lofi: 0.50,
  trance: 0.35,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.30,
  blockhead: 0.35,
  flim: 0.45,
  disco: 0.25,
};

/**
 * LPF multiplier based on tension level.
 * tension: 0-1 overall tension
 * Low tension → slight LPF reduction (warmer), high → slight boost (brighter).
 */
export function tensionColorLpf(
  tension: number,
  mood: Mood,
): number {
  const range = moodColorRange[mood];
  // Center at 0.5 tension → neutral
  const deviation = (tension - 0.5) * 2; // -1 to 1
  const adjustment = deviation * range * 0.06;
  return Math.max(0.96, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood color range for testing */
export function colorRange(mood: Mood): number {
  return moodColorRange[mood];
}
