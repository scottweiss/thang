import type { Mood, Section } from '../types';

/**
 * Rhythmic implied tempo layer — creates the perception of a
 * second tempo by accenting at intervals that don't align with
 * the main pulse. Unlike polymetric accents, this uses
 * irrational-feeling intervals that slowly drift.
 */

const impliedStrength: Record<Mood, number> = {
  ambient: 0.15,
  plantasia: 0.15,
  downtempo: 0.20,
  lofi: 0.15,
  trance: 0.25,
  avril: 0.20,
  xtal: 0.35,
  syro: 0.55,
  blockhead: 0.40,
  flim: 0.30,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.5,
  groove: 1.1,
};

/**
 * Returns a gain multiplier for the implied tempo layer.
 * Uses a slowly drifting accent pattern based on a prime
 * number step size that doesn't align with 4/4 divisions.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param tick - current tick for drift
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function impliedTempoLayerGain(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = impliedStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  // Prime step sizes that don't divide evenly into 16
  const primes = [3, 5, 7, 11, 13];
  const primeIdx = Math.floor(tick / 7) % primes.length;
  const step = primes[primeIdx];

  // Drift offset based on tick
  const offset = (tick * 3) % 16;
  const accentPos = (offset) % 16;

  const pos = beatPosition % 16;
  if (pos === accentPos || pos === (accentPos + step) % 16) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function impliedStrengthValue(mood: Mood): number {
  return impliedStrength[mood];
}
