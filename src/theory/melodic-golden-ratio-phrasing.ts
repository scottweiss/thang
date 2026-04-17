import type { Mood, Section } from '../types';

/**
 * Melodic golden ratio phrasing — the golden ratio (~0.618)
 * appears naturally in pleasing musical proportions. Apply
 * gain emphasis at the golden ratio point within a phrase,
 * creating a natural-feeling climax placement.
 */

const goldenStrength: Record<Mood, number> = {
  ambient: 0.25,
  plantasia: 0.25,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.35,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.45,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.7,
  groove: 0.9,
};

const PHI = 0.618;

/**
 * Returns a gain multiplier based on proximity to the golden
 * ratio point within the current section.
 *
 * @param sectionProgress - progress through section (0.0-1.0)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function goldenRatioPhrasingGain(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const dist = Math.abs(sectionProgress - PHI);
  // Boost peaks at golden ratio, fades within ±0.15
  if (dist > 0.15) return 1.0;
  const proximity = 1.0 - dist / 0.15;
  const depth = goldenStrength[mood] * sectionMultiplier[section];
  return 1.0 + 0.03 * proximity * depth;
}

export function goldenStrengthValue(mood: Mood): number {
  return goldenStrength[mood];
}
