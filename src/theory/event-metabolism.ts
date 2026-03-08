/**
 * Event metabolism — perceived tempo from event density, independent of BPM.
 *
 * Two pieces at 120 BPM feel radically different if one has 2 events/beat
 * and the other 8 events/beat. Metabolic rate measures this density and
 * signals when the music feels too rushed (fatigue) or too static.
 *
 * Applied as a density correction multiplier and perceived-tempo indicator.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood target metabolism (ideal events per beat).
 */
const TARGET_METABOLISM: Record<Mood, number> = {
  trance:    3.5,   // moderate — steady pulse
  avril:     2.5,   // lower — classical breathing room
  disco:     3.0,   // moderate — funky but not frantic
  downtempo: 1.8,   // low — laid back
  blockhead: 4.0,   // higher — busy hip-hop
  lofi:      2.0,   // low — relaxed jazz
  flim:      3.0,   // moderate — organic
  xtal:      1.5,   // low — ambient space
  syro:      4.5,   // highest — IDM density
  ambient:   1.2,   // lowest — spacious
};

/**
 * Per-mood fatigue threshold (metabolism that feels too fast).
 */
const FATIGUE_THRESHOLD: Record<Mood, number> = {
  trance:    6.0,
  avril:     4.5,
  disco:     5.5,
  downtempo: 3.5,
  blockhead: 6.5,
  lofi:      4.0,
  flim:      5.0,
  xtal:      3.0,
  syro:      7.0,
  ambient:   2.5,
};

/**
 * Section multiplier on target metabolism.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,
  build:     0.9,
  peak:      1.0,
  breakdown: 0.5,
  groove:    0.8,
};

/**
 * Estimate event metabolism from note density across layers.
 *
 * @param layerDensities Array of per-layer note densities (0-1, where 1 = every subdivision has a note)
 * @param subdivisions Notes per beat (e.g., 4 for 16th notes)
 * @returns Events per beat
 */
export function estimateMetabolism(
  layerDensities: number[],
  subdivisions: number
): number {
  if (layerDensities.length === 0) return 0;
  const totalDensity = layerDensities.reduce((a, b) => a + b, 0);
  return totalDensity * subdivisions;
}

/**
 * Calculate density correction multiplier to steer metabolism toward target.
 *
 * @param metabolism Current events/beat
 * @param mood Current mood
 * @param section Current section
 * @returns Density multiplier (0.7 - 1.3)
 */
export function metabolismDensityCorrection(
  metabolism: number,
  mood: Mood,
  section: Section
): number {
  const target = TARGET_METABOLISM[mood] * SECTION_MULT[section];
  const ratio = target / Math.max(0.1, metabolism);
  // Gentle correction — don't overcorrect
  return Math.max(0.7, Math.min(1.3, 0.5 + ratio * 0.5));
}

/**
 * Calculate metabolic fatigue (0-1, when event density is exhausting).
 *
 * @param metabolism Current events/beat
 * @param mood Current mood
 * @returns Fatigue 0-1 (0 = comfortable, 1 = overwhelming)
 */
export function metabolismFatigue(
  metabolism: number,
  mood: Mood
): number {
  const threshold = FATIGUE_THRESHOLD[mood];
  if (metabolism <= threshold * 0.7) return 0;
  const excess = (metabolism - threshold * 0.7) / (threshold * 0.5);
  return Math.min(1, excess * excess);
}

/**
 * Should metabolism be adjusted?
 */
export function shouldAdjustMetabolism(
  metabolism: number,
  mood: Mood,
  section: Section
): boolean {
  const target = TARGET_METABOLISM[mood] * SECTION_MULT[section];
  const deviation = Math.abs(metabolism - target) / target;
  return deviation > 0.25;
}

/**
 * Get target metabolism for a mood (for testing).
 */
export function targetMetabolism(mood: Mood): number {
  return TARGET_METABOLISM[mood];
}
