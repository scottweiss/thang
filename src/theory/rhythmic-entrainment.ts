/**
 * Rhythmic entrainment — layers gradually synchronize timing.
 *
 * Over time, independent rhythmic layers naturally entrain
 * (synchronize) to each other. This module models that pull
 * toward rhythmic alignment, creating tighter grooves as
 * sections progress.
 *
 * Applied as .late() correction toward alignment.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood entrainment rate (higher = faster sync).
 */
const ENTRAINMENT_RATE: Record<Mood, number> = {
  trance:    0.60,  // fastest — tight sync
  avril:     0.40,  // moderate
  disco:     0.55,  // fast — groove lock
  downtempo: 0.35,  // moderate
  blockhead: 0.50,  // moderate-fast
  lofi:      0.30,  // slow — loose feel
  flim:      0.25,  // slow — independent layers
  xtal:      0.20,  // slowest — floating
  syro:      0.15,  // slowest — independent
  ambient:   0.10,  // minimal — free floating,
  plantasia: 0.10,
};

/**
 * Section multipliers for entrainment.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,   // loose
  build:     0.8,   // tightening
  peak:      1.3,   // tightest
  breakdown: 0.6,   // loosening
  groove:    1.0,   // normal
};

/**
 * Calculate timing correction toward alignment.
 *
 * @param currentOffset Current .late() offset in seconds
 * @param targetOffset Target alignment offset (usually 0)
 * @param sectionProgress How far through section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Corrected offset in seconds
 */
export function entrainedOffset(
  currentOffset: number,
  targetOffset: number,
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const rate = ENTRAINMENT_RATE[mood] * SECTION_MULT[section];
  // Entrainment increases with section progress
  const progress = Math.max(0, Math.min(1, sectionProgress));
  const blend = rate * progress * 0.5;
  return currentOffset * (1 - blend) + targetOffset * blend;
}

/**
 * Whether entrainment should be applied.
 */
export function shouldEntrain(
  mood: Mood,
  section: Section
): boolean {
  return ENTRAINMENT_RATE[mood] * SECTION_MULT[section] > 0.10;
}

/**
 * Get entrainment rate for a mood (for testing).
 */
export function entrainmentRate(mood: Mood): number {
  return ENTRAINMENT_RATE[mood];
}
