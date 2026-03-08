import type { Mood, Section } from '../types';

/**
 * Harmonic cadence weight — boosts gain on chords that form
 * strong cadential patterns (V→I, IV→I, ii→V). The preceding
 * chord in a cadence gets subtle emphasis to telegraph the resolution.
 */

const cadenceDepth: Record<Mood, number> = {
  ambient: 0.25,
  downtempo: 0.35,
  lofi: 0.30,
  trance: 0.50,
  avril: 0.45,
  xtal: 0.30,
  syro: 0.20,
  blockhead: 0.25,
  flim: 0.35,
  disco: 0.45,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.7,
  groove: 0.9,
};

/**
 * Returns a gain multiplier based on whether the current degree
 * is part of a strong cadential approach. V (degree 5) approaching
 * tonic gets the most weight; IV (degree 4) and ii (degree 2) also
 * get cadential emphasis.
 *
 * @param degree - current chord degree (1-7)
 * @param prevDegree - previous chord degree (1-7), 0 if none
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.04]
 */
export function cadenceWeightGain(
  degree: number,
  prevDegree: number,
  mood: Mood,
  section: Section
): number {
  const depth = cadenceDepth[mood] * sectionMultiplier[section];

  // V→I is the strongest cadence
  if (prevDegree === 5 && degree === 1) return 1.0 + 0.04 * depth;
  // IV→I plagal cadence
  if (prevDegree === 4 && degree === 1) return 1.0 + 0.03 * depth;
  // ii→V approach
  if (prevDegree === 2 && degree === 5) return 1.0 + 0.025 * depth;
  // V chord itself (dominant function)
  if (degree === 5) return 1.0 + 0.015 * depth;
  // IV chord (subdominant approach)
  if (degree === 4) return 1.0 + 0.01 * depth;

  return 1.0;
}

export function cadenceDepthValue(mood: Mood): number {
  return cadenceDepth[mood];
}
