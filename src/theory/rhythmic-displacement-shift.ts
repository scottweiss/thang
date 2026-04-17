import type { Mood, Section } from '../types';

/**
 * Rhythmic displacement shift — applies subtle timing offsets
 * that shift accents forward or backward relative to the grid,
 * creating push/pull feel variations across sections.
 */

const displacementAmount: Record<Mood, number> = {
  ambient: 0.10,
  plantasia: 0.10,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.15,
  avril: 0.25,
  xtal: 0.20,
  syro: 0.50,
  blockhead: 0.45,
  flim: 0.40,
  disco: 0.20,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 0.8,
  peak: 1.0,
  breakdown: 0.6,
  groove: 1.2,
};

/**
 * Returns a late() offset amount for rhythmic displacement.
 * Uses beat position to create push/pull patterns — even beats
 * push slightly forward, odd beats pull back.
 *
 * @param beatPosition - position within pattern (0-15)
 * @param tick - current tick for slow evolution
 * @param mood - current mood
 * @param section - current section
 * @returns late offset in [-0.015, 0.015]
 */
export function displacementShiftOffset(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = displacementAmount[mood] * sectionMultiplier[section];
  const maxShift = 0.015;

  // Evolving displacement pattern based on tick
  const phase = (tick * 0.07 + beatPosition * 0.25) % (2 * Math.PI);
  const rawShift = Math.sin(phase) * maxShift * depth;

  // Quantize to avoid micro-artifacts
  if (Math.abs(rawShift) < 0.001) return 0;
  return rawShift;
}

/**
 * Returns a gain multiplier that emphasizes displaced beats.
 * Beats that are displaced get a subtle gain boost to make
 * the displacement more audible.
 *
 * @param offset - the displacement offset amount
 * @param mood - current mood
 * @returns gain multiplier in [1.0, 1.02]
 */
export function displacementEmphasisGain(
  offset: number,
  mood: Mood
): number {
  if (Math.abs(offset) < 0.001) return 1.0;
  const depth = displacementAmount[mood];
  return 1.0 + Math.abs(offset) * depth * 1.33;
}

export function displacementAmountValue(mood: Mood): number {
  return displacementAmount[mood];
}
