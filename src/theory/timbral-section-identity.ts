/**
 * Timbral section identity — each section has a characteristic FM ratio.
 *
 * Sections should sound distinct not just in dynamics but in timbre.
 * Intros are warm and simple (low FM), builds add harmonic complexity,
 * peaks are bright and rich, breakdowns return to warmth.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood identity strength (higher = more timbral variation).
 */
const IDENTITY_STRENGTH: Record<Mood, number> = {
  trance:    0.45,  // moderate
  avril:     0.55,  // high — orchestral color changes
  disco:     0.35,  // moderate
  downtempo: 0.50,  // high
  blockhead: 0.40,  // moderate
  lofi:      0.50,  // high — mood shifts
  flim:      0.55,  // high — delicate timbres
  xtal:      0.60,  // highest — atmospheric color
  syro:      0.30,  // low — random timbres anyway
  ambient:   0.55,  // high — slow bloom,
  plantasia: 0.55,
};

/**
 * Section FM character (0 = pure/warm, 1 = rich/bright).
 */
const SECTION_CHARACTER: Record<Section, number> = {
  intro:     0.2,
  build:     0.5,
  peak:      0.9,
  breakdown: 0.3,
  groove:    0.6,
};

/**
 * Calculate section identity FM multiplier.
 *
 * @param mood Current mood
 * @param section Current section
 * @returns FM multiplier (0.85 - 1.20)
 */
export function sectionIdentityFm(
  mood: Mood,
  section: Section
): number {
  const strength = IDENTITY_STRENGTH[mood];
  const character = SECTION_CHARACTER[section];

  const multiplier = 1.0 + (character - 0.5) * strength * 0.50;
  return Math.max(0.85, Math.min(1.20, multiplier));
}

/**
 * Get identity strength for a mood (for testing).
 */
export function identityStrength(mood: Mood): number {
  return IDENTITY_STRENGTH[mood];
}
