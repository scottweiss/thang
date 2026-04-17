/**
 * Phrase overlap — layers take turns starting phrases to avoid dead spots.
 *
 * When melody ends a phrase, arp or harmony should be starting one.
 * This prevents moments where all layers rest simultaneously
 * (unintentional silence) and creates a tapestry of overlapping
 * musical activity.
 *
 * Models "staggered breathing" like a choir or wind section.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood overlap strength.
 * Higher = more phrase overlap between layers.
 */
const OVERLAP_STRENGTH: Record<Mood, number> = {
  trance:    0.50,  // continuous energy
  avril:     0.35,  // moderate overlap
  disco:     0.45,  // keep the groove going
  downtempo: 0.30,  // some breathing room
  blockhead: 0.40,  // moderate
  lofi:      0.35,  // jazz — some overlap
  flim:      0.30,  // organic
  xtal:      0.25,  // floating, gaps OK
  syro:      0.20,  // intentional gaps
  ambient:   0.15,  // silence is part of the music,
  plantasia: 0.15,
};

/**
 * Section multiplier for overlap.
 */
const SECTION_OVERLAP: Record<Section, number> = {
  intro:     0.6,   // sparse
  build:     1.1,   // filling up
  peak:      1.3,   // maximum continuity
  breakdown: 0.5,   // gaps are fine
  groove:    1.0,   // normal
};

/**
 * Detect if a layer is near the end of its phrase.
 * Uses rest density in the last quarter of the pattern.
 *
 * @param pattern Space-separated note pattern
 * @returns Whether the phrase is ending (high rest density)
 */
export function isPhraseEnding(pattern: string): boolean {
  const parts = pattern.split(' ');
  if (parts.length < 4) return false;

  const quarter = Math.ceil(parts.length / 4);
  const lastQuarter = parts.slice(-quarter);
  const restCount = lastQuarter.filter(p => p === '~').length;
  return restCount / lastQuarter.length > 0.5;
}

/**
 * Calculate a gain boost for a layer when another is ending.
 * The overlapping layer swells as the ending layer fades.
 *
 * @param mood Current mood
 * @param section Current section
 * @param isOtherEnding Whether another prominent layer is ending
 * @returns Gain multiplier (1.0-1.2)
 */
export function overlapGainBoost(
  mood: Mood,
  section: Section,
  isOtherEnding: boolean
): number {
  if (!isOtherEnding) return 1.0;

  const strength = OVERLAP_STRENGTH[mood] * SECTION_OVERLAP[section];
  return 1.0 + strength * 0.2;
}

/**
 * Should phrase overlap management be applied?
 *
 * @param mood Current mood
 * @param activeLayerCount Number of active layers
 * @returns Whether to apply
 */
export function shouldApplyPhraseOverlap(mood: Mood, activeLayerCount: number): boolean {
  return activeLayerCount >= 2 && OVERLAP_STRENGTH[mood] > 0.12;
}

/**
 * Get overlap strength for a mood (for testing).
 */
export function overlapStrength(mood: Mood): number {
  return OVERLAP_STRENGTH[mood];
}
