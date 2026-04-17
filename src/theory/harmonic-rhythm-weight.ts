import type { Mood } from '../types';

/**
 * Harmonic rhythm weight — chord changes on metrically strong positions
 * get gain/brightness emphasis, weak-position changes are subdued.
 * Models the classical principle that harmonic rhythm aligns with meter.
 */

const moodWeight: Record<Mood, number> = {
  ambient: 0.15,
  plantasia: 0.15,
  downtempo: 0.35,
  lofi: 0.45,
  trance: 0.65,
  avril: 0.55,
  xtal: 0.30,
  syro: 0.10,
  blockhead: 0.40,
  flim: 0.25,
  disco: 0.55,
};

/** Metric weight for 16-step grid position (0=strongest downbeat) */
function metricStrength(position: number): number {
  const p = ((position % 16) + 16) % 16;
  if (p === 0) return 1.0;        // bar downbeat
  if (p === 8) return 0.75;       // half-bar
  if (p === 4 || p === 12) return 0.5; // quarter beats
  if (p % 2 === 0) return 0.3;    // eighth beats
  return 0.15;                    // off-beats
}

/**
 * Gain multiplier for chord change emphasis based on metric position.
 * Strong-beat changes get a boost, weak-beat changes get slight reduction.
 */
export function rhythmWeightGain(
  beatPosition: number,
  chordChanged: boolean,
  mood: Mood,
): number {
  if (!chordChanged) return 1.0;
  const w = moodWeight[mood];
  const strength = metricStrength(beatPosition);
  // Map strength 0-1 to gain range: strong=boost, weak=cut
  // Center at 0.5 strength → 1.0 gain
  const deviation = (strength - 0.5) * 2; // -1 to 1
  return 1.0 + deviation * w * 0.06;
}

/** Per-mood weight strength for testing */
export function rhythmWeightStrength(mood: Mood): number {
  return moodWeight[mood];
}
