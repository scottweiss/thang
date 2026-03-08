import type { Mood, Section } from '../types';

/**
 * Timbral evolution rate — limits how fast FM depth can change between
 * ticks, creating smooth timbral transitions rather than abrupt jumps.
 * Higher rate = more responsive, lower = more smoothed.
 */

const moodRate: Record<Mood, number> = {
  ambient: 0.25,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.50,
  avril: 0.40,
  xtal: 0.30,
  syro: 0.55,
  blockhead: 0.45,
  flim: 0.35,
  disco: 0.45,
};

const sectionMult: Record<Section, number> = {
  intro: 0.7,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.8,
  groove: 1.0,
};

/**
 * FM smoothing multiplier — blends current FM toward target at mood rate.
 * currentFm: current FM depth
 * targetFm: desired FM depth
 * Returns a smoothed FM value between current and target.
 */
export function smoothedFm(
  currentFm: number,
  targetFm: number,
  mood: Mood,
  section: Section,
): number {
  const rate = moodRate[mood] * sectionMult[section];
  // Interpolate toward target at mood-dependent rate
  return currentFm + (targetFm - currentFm) * rate;
}

/** Per-mood evolution rate for testing */
export function evolutionRate(mood: Mood): number {
  return moodRate[mood];
}
