import type { Mood } from '../types';

/**
 * Temporal density wave — layer activity oscillates in long cycles
 * (over many ticks) to create macro-level variety. Prevents the
 * "everything at the same level forever" feeling.
 */

const moodAmplitude: Record<Mood, number> = {
  ambient: 0.50,
  plantasia: 0.50,
  downtempo: 0.40,
  lofi: 0.35,
  trance: 0.20,
  avril: 0.35,
  xtal: 0.45,
  syro: 0.30,
  blockhead: 0.25,
  flim: 0.40,
  disco: 0.15,
};

/**
 * Gain multiplier from long-cycle density wave.
 * tick: current tick count
 * layerIndex: 0-5 for phase offset between layers
 * Returns 0.97-1.03 subtle oscillation.
 */
export function temporalDensityWaveGain(
  tick: number,
  layerIndex: number,
  mood: Mood,
): number {
  const amp = moodAmplitude[mood];
  // Very slow wave — period of roughly 50 ticks (100 seconds)
  const phase = (tick * 0.04 + layerIndex * 1.2) % (2 * Math.PI);
  const wave = Math.sin(phase);
  return 1.0 + wave * amp * 0.04;
}

/** Per-mood amplitude for testing */
export function densityWaveAmplitude(mood: Mood): number {
  return moodAmplitude[mood];
}
