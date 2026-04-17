/**
 * Chord density thinning — reduce voicing complexity in sparse sections.
 *
 * Rich chord extensions (9ths, 11ths, 13ths) sound great at peaks
 * but cluttered during intros and breakdowns. This module provides
 * a gain reduction for harmony layers when the section calls for
 * simpler voicings, encouraging the engine to thin out chords.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood thinning sensitivity (higher = more aggressive thinning).
 */
const THINNING_SENSITIVITY: Record<Mood, number> = {
  trance:    0.40,  // moderate — clear at all times
  avril:     0.55,  // high — dynamic range
  disco:     0.30,  // low — consistent voicings
  downtempo: 0.50,  // high — intimate sparse sections
  blockhead: 0.35,  // moderate
  lofi:      0.60,  // highest — sparse is beautiful
  flim:      0.55,  // high — delicate
  xtal:      0.50,  // high
  syro:      0.25,  // low — complex OK
  ambient:   0.65,  // highest — space is essential,
  plantasia: 0.65,
};

/**
 * Section density target (0 = very thin, 1 = full density).
 */
const SECTION_DENSITY: Record<Section, number> = {
  intro:     0.3,
  build:     0.6,
  peak:      1.0,
  breakdown: 0.2,
  groove:    0.7,
};

/**
 * Calculate chord density thinning multiplier.
 *
 * @param voiceCount Number of voices in current chord
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.85 - 1.0)
 */
export function chordThinningGain(
  voiceCount: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = THINNING_SENSITIVITY[mood];
  const density = SECTION_DENSITY[section];

  // More voices than density target calls for = thinning
  const targetVoices = 2 + density * 3; // 2-5 voices
  const excess = Math.max(0, voiceCount - targetVoices);

  const reduction = excess * sensitivity * 0.06;
  return Math.max(0.85, 1.0 - reduction);
}

/**
 * Get thinning sensitivity for a mood (for testing).
 */
export function thinningSensitivity(mood: Mood): number {
  return THINNING_SENSITIVITY[mood];
}
