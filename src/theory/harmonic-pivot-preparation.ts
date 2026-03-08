import type { Mood, Section } from '../types';

/**
 * Harmonic pivot preparation — when a chord can function in
 * multiple keys (pivot chord), apply subtle FM enrichment to
 * highlight the ambiguity before the modulation resolves.
 */

const pivotDepth: Record<Mood, number> = {
  ambient: 0.40,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.35,
  avril: 0.55,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.35,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 0.8,
  breakdown: 1.2,
  groove: 0.7,
};

/**
 * Returns an FM multiplier that enriches pivot chords.
 * Common tones between old and new key create harmonic ambiguity —
 * more common tones = stronger pivot = more FM enrichment.
 *
 * @param commonToneCount - number of common tones between keys (0-4)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.04]
 */
export function pivotPreparationFm(
  commonToneCount: number,
  mood: Mood,
  section: Section
): number {
  if (commonToneCount <= 0) return 1.0;
  const clamped = Math.min(commonToneCount, 4);
  const depth = pivotDepth[mood] * sectionMultiplier[section];
  return 1.0 + (clamped / 4) * 0.04 * depth;
}

export function pivotDepthValue(mood: Mood): number {
  return pivotDepth[mood];
}
