/**
 * Rhythmic variation curve — complexity evolves within sections.
 *
 * Musical sections often start simple, build complexity in the
 * middle, then simplify toward the end for resolution. This module
 * provides a complexity multiplier that follows a bell curve within
 * each section, modulating pattern density and syncopation.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood variation range (higher = more rhythmic evolution).
 */
const VARIATION_RANGE: Record<Mood, number> = {
  trance:    0.35,  // moderate — steady but evolving
  avril:     0.55,  // high — classical development
  disco:     0.25,  // low — consistent groove
  downtempo: 0.45,  // moderate
  blockhead: 0.50,  // high — hip-hop variation
  lofi:      0.40,  // moderate
  flim:      0.55,  // high — IDM complexity
  xtal:      0.50,  // high — evolving textures
  syro:      0.60,  // highest — maximum variation
  ambient:   0.30,  // low — gentle evolution,
  plantasia: 0.30,
};

/**
 * Section peak position (where maximum complexity occurs).
 */
const SECTION_PEAK: Record<Section, number> = {
  intro:     0.7,   // complexity builds late in intro
  build:     0.8,   // peaks near end of build
  peak:      0.5,   // centered complexity
  breakdown: 0.3,   // early complexity, then simplify
  groove:    0.6,   // slightly past middle
};

/**
 * Calculate rhythmic variation multiplier.
 *
 * @param sectionProgress Progress through current section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Complexity multiplier (0.7 - 1.3, where 1.0 = normal)
 */
export function rhythmicVariation(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const range = VARIATION_RANGE[mood];
  const peak = SECTION_PEAK[section];
  const t = Math.max(0, Math.min(1, sectionProgress));

  // Bell curve centered at peak position
  const distance = Math.abs(t - peak);
  const curve = Math.exp(-distance * distance * 8);

  // Map curve to complexity: low at edges, high at peak
  const complexity = 1.0 + (curve - 0.5) * range;
  return Math.max(0.7, Math.min(1.3, complexity));
}

/**
 * Get variation range for a mood (for testing).
 */
export function variationRange(mood: Mood): number {
  return VARIATION_RANGE[mood];
}
