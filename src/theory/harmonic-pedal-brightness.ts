import type { Mood } from '../types';

/**
 * Harmonic pedal brightness — when a bass pedal tone sustains through
 * chord changes, it gradually darkens (lower LPF) to sit underneath
 * rather than compete with changing harmony above.
 */

const moodDarkeningRate: Record<Mood, number> = {
  ambient: 0.60,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.20,
  avril: 0.40,
  xtal: 0.55,
  syro: 0.30,
  blockhead: 0.25,
  flim: 0.45,
  disco: 0.15,
};

/**
 * LPF multiplier for pedal/drone layers based on sustain duration.
 * ticksSinceChange: how long the bass note has been sustained
 * Returns < 1.0 to darken sustained pedal tones.
 */
export function pedalBrightnessLpf(
  ticksSinceChange: number,
  mood: Mood,
): number {
  const rate = moodDarkeningRate[mood];
  // Gradual darkening curve
  const darkening = 1.0 - (1.0 - Math.exp(-ticksSinceChange * rate * 0.12)) * 0.10;
  return Math.max(0.90, Math.min(1.0, darkening));
}

/** Per-mood darkening rate for testing */
export function darkeningRate(mood: Mood): number {
  return moodDarkeningRate[mood];
}
