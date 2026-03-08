/**
 * Melodic range compression — compress range during quiet sections for intimacy.
 *
 * Quiet, intimate moments sound better with a narrow melodic range.
 * Loud, energetic moments benefit from wide leaps. This module
 * provides a range multiplier that compresses or expands the
 * available melodic range based on dynamic context.
 *
 * Applied as gain correction that favors range-appropriate melodies.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood compression sensitivity (higher = more range variation).
 */
const COMPRESSION_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.60,  // highest — dramatic range shifts
  disco:     0.25,  // low — consistent
  downtempo: 0.50,  // high
  blockhead: 0.30,  // moderate
  lofi:      0.45,  // moderate
  flim:      0.55,  // high — delicate dynamics
  xtal:      0.55,  // high
  syro:      0.20,  // low — always wide
  ambient:   0.50,  // high — breathing range
};

/**
 * Section range targets (0 = compressed, 1 = expanded).
 */
const SECTION_RANGE: Record<Section, number> = {
  intro: 0.3,      // narrow — intimate
  build: 0.6,      // expanding
  peak: 1.0,       // full range
  breakdown: 0.4,  // contracting
  groove: 0.7,     // comfortable
};

/**
 * Calculate range compression multiplier.
 *
 * @param tension Current tension (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Range multiplier (0.4 - 1.2, where 1.0 = normal)
 */
export function rangeCompression(
  tension: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = COMPRESSION_SENSITIVITY[mood];
  const sectionTarget = SECTION_RANGE[section];
  const t = Math.max(0, Math.min(1, tension));

  // Blend section target with tension
  const target = sectionTarget * 0.5 + t * 0.5;
  const compression = 0.4 + target * sensitivity + (1 - sensitivity) * 0.6;

  return Math.max(0.4, Math.min(1.2, compression));
}

/**
 * Get compression sensitivity for a mood (for testing).
 */
export function compressionSensitivity(mood: Mood): number {
  return COMPRESSION_SENSITIVITY[mood];
}
