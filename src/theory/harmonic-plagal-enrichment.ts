import type { Mood, Section } from '../types';

/**
 * Harmonic plagal enrichment — IV→I plagal motions get a warm
 * FM color that distinguishes them from authentic V→I resolutions.
 * The "amen" cadence quality is enhanced with subtle overtone richness.
 */

const plagalDepth: Record<Mood, number> = {
  ambient: 0.50,
  plantasia: 0.50,
  downtempo: 0.40,
  lofi: 0.35,
  trance: 0.20,
  avril: 0.45,
  xtal: 0.40,
  syro: 0.15,
  blockhead: 0.25,
  flim: 0.45,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.8,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.3,
  groove: 0.7,
};

/**
 * Returns an FM multiplier for plagal motion warmth.
 * IV→I gets the strongest enrichment; bVII→I (mixolydian plagal)
 * and ii→I also get subtle warmth.
 *
 * @param prevDegree - previous chord degree (1-7)
 * @param curDegree - current chord degree (1-7)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.05]
 */
export function plagalEnrichmentFm(
  prevDegree: number,
  curDegree: number,
  mood: Mood,
  section: Section
): number {
  if (curDegree !== 1) return 1.0;
  const depth = plagalDepth[mood] * sectionMultiplier[section];

  // IV→I classic plagal
  if (prevDegree === 4) return 1.0 + 0.05 * depth;
  // bVII→I mixolydian plagal (degree 7 in minor context)
  if (prevDegree === 7) return 1.0 + 0.035 * depth;
  // ii→I direct resolution
  if (prevDegree === 2) return 1.0 + 0.02 * depth;

  return 1.0;
}

export function plagalDepthValue(mood: Mood): number {
  return plagalDepth[mood];
}
