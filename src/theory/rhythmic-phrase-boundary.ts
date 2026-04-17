import type { Mood, Section } from '../types';

/**
 * Rhythmic phrase boundary — note density drops at phrase boundaries
 * to create articulation between musical ideas. The gap gives the listener
 * time to process the previous phrase before the next begins.
 */

const moodBoundaryDepth: Record<Mood, number> = {
  ambient: 0.55,
  plantasia: 0.55,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.20,
  avril: 0.40,
  xtal: 0.45,
  syro: 0.30,
  blockhead: 0.40,
  flim: 0.50,
  disco: 0.25,
};

const sectionMult: Record<Section, number> = {
  intro: 1.3,
  build: 0.8,
  peak: 0.6,
  breakdown: 1.4,
  groove: 1.0,
};

/**
 * Gain multiplier at phrase boundaries.
 * phraseProgress: 0-1 position in phrase
 * Near boundaries (0-0.05 and 0.95-1.0) → gain reduction for articulation.
 */
export function phraseBoundaryGain(
  phraseProgress: number,
  mood: Mood,
  section: Section,
): number {
  const depth = moodBoundaryDepth[mood] * sectionMult[section];
  // Check if near start or end of phrase
  const distFromBoundary = Math.min(phraseProgress, 1.0 - phraseProgress);
  if (distFromBoundary > 0.08) return 1.0;
  // Smooth reduction near boundary
  const t = 1.0 - distFromBoundary / 0.08; // 1 at boundary, 0 at threshold
  const reduction = t * t * depth * 0.06;
  return Math.max(0.95, 1.0 - reduction);
}

/** Per-mood boundary depth for testing */
export function boundaryDepth(mood: Mood): number {
  return moodBoundaryDepth[mood];
}
