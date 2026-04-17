/**
 * Harmonic rhythm variance — non-uniform chord change timing within sections.
 *
 * Uniform chord changes sound mechanical. Natural music varies harmonic
 * rhythm: quick changes build tension, slow changes create repose.
 * This module suggests timing variance for chord changes based on
 * position within a section.
 *
 * Applied as duration multiplier on chord change timing.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood variance intensity (higher = more timing variation).
 */
const VARIANCE_INTENSITY: Record<Mood, number> = {
  trance:    0.20,  // low — steady pulse
  avril:     0.55,  // high — expressive timing
  disco:     0.15,  // low — grooveLocked
  downtempo: 0.45,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // high — rubato jazz
  flim:      0.40,  // moderate
  xtal:      0.45,  // moderate
  syro:      0.35,  // moderate — already erratic
  ambient:   0.60,  // highest — free timing,
  plantasia: 0.60,
};

/**
 * Section variance scaling.
 */
const SECTION_SCALE: Record<Section, number> = {
  intro: 0.6,
  build: 1.2,     // accelerating changes
  peak: 0.8,      // moderate
  breakdown: 1.4, // most variance (expressive)
  groove: 0.9,    // steady
};

/**
 * Duration multiplier for chord changes based on section position.
 *
 * Values < 1 = quicker changes, > 1 = longer holds.
 *
 * @param sectionProgress Progress through current section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Duration multiplier (0.6 - 1.5)
 */
export function harmonicRhythmVariance(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = VARIANCE_INTENSITY[mood] * SECTION_SCALE[section];
  const progress = Math.max(0, Math.min(1, sectionProgress));

  // Create a wave pattern: quick-slow-quick within each section
  const wave = Math.sin(progress * Math.PI * 2) * intensity * 0.5;

  return Math.max(0.6, Math.min(1.5, 1.0 + wave));
}

/**
 * Get variance intensity for a mood (for testing).
 */
export function varianceIntensity(mood: Mood): number {
  return VARIANCE_INTENSITY[mood];
}
