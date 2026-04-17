/**
 * Sustain release curve — release time varies by section character.
 *
 * Legato sections (intro, breakdown) benefit from longer release
 * times for smooth note connections. Rhythmic sections (peak, groove)
 * need shorter releases for clarity and punch.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood release sensitivity (higher = more variation).
 */
const RELEASE_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate — clear attacks
  avril:     0.60,  // high — expressive release
  disco:     0.30,  // low — consistent
  downtempo: 0.55,  // high — breathing releases
  blockhead: 0.35,  // moderate
  lofi:      0.50,  // moderate — relaxed
  flim:      0.55,  // high — delicate
  xtal:      0.60,  // high — atmospheric trails
  syro:      0.25,  // low — precise
  ambient:   0.65,  // highest — long releases,
  plantasia: 0.65,
};

/**
 * Section release character (0 = short/staccato, 1 = long/legato).
 */
const SECTION_RELEASE: Record<Section, number> = {
  intro:     0.8,
  build:     0.4,
  peak:      0.2,
  breakdown: 0.9,
  groove:    0.5,
};

/**
 * Calculate release time multiplier.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns Release multiplier (0.70 - 1.40)
 */
export function releaseMultiplier(
  mood: Mood,
  section: Section
): number {
  const sensitivity = RELEASE_SENSITIVITY[mood];
  const character = SECTION_RELEASE[section];

  // Blend: legato sections = longer release
  const multiplier = 1.0 + (character - 0.5) * sensitivity * 0.80;
  return Math.max(0.70, Math.min(1.40, multiplier));
}

/**
 * Get release sensitivity for a mood (for testing).
 */
export function releaseSensitivity(mood: Mood): number {
  return RELEASE_SENSITIVITY[mood];
}
