/**
 * Dynamic panning width — stereo width responds to energy and section.
 *
 * Low-energy moments are more intimate (narrow stereo field).
 * High-energy peaks expand to fill the stereo field.
 * This creates a sense of spatial breathing that mirrors
 * the musical intensity.
 *
 * Applied as pan width multiplier for layer spatial placement.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood width range (higher = more width variation).
 */
const WIDTH_RANGE: Record<Mood, number> = {
  trance:    0.45,  // moderate — steady field
  avril:     0.55,  // high — orchestral width
  disco:     0.40,  // moderate
  downtempo: 0.50,  // moderate
  blockhead: 0.35,  // moderate — compact
  lofi:      0.40,  // moderate — intimate
  flim:      0.50,  // moderate
  xtal:      0.60,  // high — crystalline space
  syro:      0.30,  // moderate
  ambient:   0.65,  // highest — vast space,
  plantasia: 0.65,
};

/**
 * Section width targets (0 = narrow, 1 = wide).
 */
const SECTION_WIDTH: Record<Section, number> = {
  intro: 0.3,      // intimate start
  build: 0.6,      // expanding
  peak: 1.0,       // full width
  breakdown: 0.5,  // contracting
  groove: 0.7,     // comfortable width
};

/**
 * Calculate stereo width multiplier.
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Width multiplier (0.5 - 1.3)
 */
export function panWidthMultiplier(
  tension: number,
  mood: Mood,
  section: Section
): number {
  const range = WIDTH_RANGE[mood];
  const sectionTarget = SECTION_WIDTH[section];
  const t = Math.max(0, Math.min(1, tension));

  // Blend section target with tension
  const target = sectionTarget * 0.6 + t * 0.4;
  const width = 0.5 + target * range * 1.5;

  return Math.max(0.5, Math.min(1.3, width));
}

/**
 * Get width range for a mood (for testing).
 */
export function widthRange(mood: Mood): number {
  return WIDTH_RANGE[mood];
}
