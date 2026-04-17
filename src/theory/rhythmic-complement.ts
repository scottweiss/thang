/**
 * Rhythmic complement — layers fill each other's rhythmic gaps.
 *
 * When one layer rests, another can sound, creating interlocking
 * hocket-like patterns. This module calculates how well two layers
 * complement each other rhythmically and provides gain adjustments
 * to emphasize complementary positions.
 *
 * Applied as gain boost on beats where partner layers rest.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood complement strength (higher = more interlocking).
 */
const COMPLEMENT_STRENGTH: Record<Mood, number> = {
  trance:    0.25,  // weak — synchronized preferred
  avril:     0.40,  // moderate — orchestral interplay
  disco:     0.20,  // weak — tight groove
  downtempo: 0.35,  // moderate
  blockhead: 0.45,  // strong — hip-hop call-response
  lofi:      0.50,  // strong — jazz conversation
  flim:      0.55,  // strongest — intricate interlocking
  xtal:      0.50,  // strong — crystalline hocket
  syro:      0.40,  // moderate — IDM patterns
  ambient:   0.15,  // weakest — layers sustain together,
  plantasia: 0.15,
};

/**
 * Section multipliers for complement tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // less interlocking in sparse intro
  build:     1.0,   // normal
  peak:      1.2,   // most interlocking at peak
  breakdown: 0.8,   // less in breakdown
  groove:    1.3,   // most in groove
};

/**
 * Calculate complementary gain boost for a layer.
 * Boost when partner density is low at this beat position.
 *
 * @param layerDensity This layer's density at current position (0-1)
 * @param partnerDensity Partner layer's density at current position (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.9 - 1.2)
 */
export function complementGain(
  layerDensity: number,
  partnerDensity: number,
  mood: Mood,
  section: Section
): number {
  const strength = COMPLEMENT_STRENGTH[mood] * SECTION_MULT[section];
  // Boost when partner is quiet and we're active
  const gap = Math.max(0, layerDensity - partnerDensity);
  const boost = gap * strength * 0.3;
  return Math.max(0.9, Math.min(1.2, 1.0 + boost));
}

/**
 * Calculate rhythmic complement score between two patterns.
 * Higher score = more complementary (fills each other's gaps).
 *
 * @param pattern1 Array of active flags for pattern 1
 * @param pattern2 Array of active flags for pattern 2
 * @returns Complement score (0.0 - 1.0)
 */
export function complementScore(
  pattern1: boolean[],
  pattern2: boolean[]
): number {
  const len = Math.min(pattern1.length, pattern2.length);
  if (len === 0) return 0;
  let complements = 0;
  for (let i = 0; i < len; i++) {
    // Perfect complement: one active, other resting
    if (pattern1[i] !== pattern2[i]) complements++;
  }
  return complements / len;
}

/**
 * Get complement strength for a mood (for testing).
 */
export function complementStrength(mood: Mood): number {
  return COMPLEMENT_STRENGTH[mood];
}
