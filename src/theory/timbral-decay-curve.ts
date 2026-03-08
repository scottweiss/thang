import type { Mood, Section } from '../types';

/**
 * Timbral decay curve — FM depth diminishes over the life of a sustained note,
 * modeling how acoustic instruments lose harmonic richness as notes decay.
 * Fresh attacks are bright (high FM), sustained tails are pure (low FM).
 */

const moodDecayRate: Record<Mood, number> = {
  ambient: 0.55,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.25,
  avril: 0.50,
  xtal: 0.60,
  syro: 0.35,
  blockhead: 0.30,
  flim: 0.50,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 1.2,
  build: 0.9,
  peak: 0.7,
  breakdown: 1.3,
  groove: 1.0,
};

/**
 * FM multiplier that decays with time since chord change.
 * ticksSinceChange: how many ticks since last chord change
 * Returns 0.85-1.0 range — slight darkening over time.
 */
export function timbralDecayFm(
  ticksSinceChange: number,
  mood: Mood,
  section: Section,
): number {
  const rate = moodDecayRate[mood] * sectionMultiplier[section];
  // Exponential decay curve, clamped
  const decay = Math.exp(-ticksSinceChange * rate * 0.15);
  // Map from 1.0 (fresh) to slight reduction
  const reduction = (1.0 - decay) * 0.12;
  return Math.max(0.85, 1.0 - reduction);
}

/** Per-mood decay rate for testing */
export function decayRate(mood: Mood): number {
  return moodDecayRate[mood];
}
