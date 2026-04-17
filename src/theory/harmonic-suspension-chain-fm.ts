import type { Mood, Section } from '../types';

/**
 * Harmonic suspension chain FM — when consecutive chords each
 * contain a suspended note resolving into the next, the chain
 * creates a flowing connected feeling. Apply FM enrichment
 * proportional to the chain length.
 */

const chainDepth: Record<Mood, number> = {
  ambient: 0.50,
  plantasia: 0.50,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.40,
  avril: 0.55,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.40,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.8,
  build: 1.0,
  peak: 1.2,
  breakdown: 1.1,
  groove: 0.7,
};

/**
 * Returns an FM multiplier based on suspension chain length.
 * Longer chains of suspended notes create more harmonic tension
 * that deserves richer timbral coloring.
 *
 * @param chainLength - number of consecutive suspended chords (0+)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.05]
 */
export function suspensionChainFm(
  chainLength: number,
  mood: Mood,
  section: Section
): number {
  if (chainLength <= 0) return 1.0;
  const clamped = Math.min(chainLength, 4);
  const depth = chainDepth[mood] * sectionMultiplier[section];
  return 1.0 + (clamped / 4) * 0.05 * depth;
}

export function chainDepthValue(mood: Mood): number {
  return chainDepth[mood];
}
