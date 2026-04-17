/**
 * Metric displacement canon — layers enter at staggered metric positions.
 *
 * In a canon, voices enter at different time points with related material.
 * This module calculates staggered entry delays so layers create polyphonic
 * depth through temporal offset rather than simultaneous onsets.
 *
 * Applied as .late() offset per layer at section boundaries.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood displacement strength (higher = more stagger between layers).
 */
const DISPLACEMENT_STRENGTH: Record<Mood, number> = {
  trance:    0.10,  // weak — tight sync preferred
  avril:     0.35,  // moderate — orchestral entries
  disco:     0.08,  // very weak — tight groove
  downtempo: 0.30,  // moderate — relaxed entries
  blockhead: 0.25,  // moderate — hip-hop stagger
  lofi:      0.40,  // strong — jazz-like entries
  flim:      0.45,  // strong — delicate stagger
  xtal:      0.50,  // strongest — crystalline offset
  syro:      0.35,  // moderate — IDM phasing
  ambient:   0.55,  // strongest — floating entries,
  plantasia: 0.55,
};

/**
 * Section multipliers for displacement.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.3,   // more stagger in intro (layers appear individually)
  build:     0.8,   // tighten as energy builds
  peak:      0.5,   // tightest at peak
  breakdown: 1.2,   // relax in breakdown
  groove:    0.7,   // moderate in groove
};

/**
 * Layer entry order (earlier layers get less delay).
 */
const LAYER_ORDER: Record<string, number> = {
  drone:      0,    // foundation — enters first
  texture:    1,    // drums — anchor rhythm
  harmony:    2,    // harmonic base
  melody:     3,    // lead voice
  arp:        4,    // decoration
  atmosphere: 5,    // wash — enters last
};

/**
 * Calculate .late() offset for canonic displacement.
 *
 * @param layerName Layer to displace
 * @param mood Current mood
 * @param section Current section
 * @returns Delay in seconds (0.0 - 0.5)
 */
export function canonDisplacement(
  layerName: string,
  mood: Mood,
  section: Section
): number {
  const strength = DISPLACEMENT_STRENGTH[mood] * SECTION_MULT[section];
  const order = LAYER_ORDER[layerName] ?? 3;
  // Each layer gets progressively more delay
  const baseDelay = order * 0.08; // 80ms per layer position
  return Math.min(0.5, baseDelay * strength);
}

/**
 * Whether displacement should be applied.
 */
export function shouldApplyCanonDisplacement(
  mood: Mood,
  section: Section,
  ticksSinceSectionChange: number
): boolean {
  // Only apply near section boundaries (first 2 ticks)
  if (ticksSinceSectionChange > 2) return false;
  return DISPLACEMENT_STRENGTH[mood] * SECTION_MULT[section] > 0.10;
}

/**
 * Get displacement strength for a mood (for testing).
 */
export function canonDisplacementStrength(mood: Mood): number {
  return DISPLACEMENT_STRENGTH[mood];
}
