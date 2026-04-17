/**
 * Agogic accent — duration-based emphasis on important notes.
 *
 * Instead of (or in addition to) making important notes louder,
 * agogic accent makes them longer. This creates emphasis through
 * duration rather than dynamics — a more subtle, musical approach.
 *
 * Applied as decay multiplier for structurally important notes.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood agogic strength (higher = more duration emphasis).
 */
const AGOGIC_STRENGTH: Record<Mood, number> = {
  trance:    0.25,  // weak — even rhythms
  avril:     0.55,  // strong — expressive duration
  disco:     0.15,  // very weak — even groove
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // strong — jazz rubato
  flim:      0.45,  // moderate
  xtal:      0.50,  // strong — crystalline timing
  syro:      0.20,  // weak — mechanical precision
  ambient:   0.60,  // strongest — breathing duration,
  plantasia: 0.60,
};

/**
 * Section multipliers for agogic accent.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // more agogic in intro
  build:     0.8,   // less as energy builds
  peak:      0.6,   // least at peak
  breakdown: 1.3,   // most in breakdown
  groove:    0.9,   // moderate
};

/**
 * Calculate duration multiplier for an important note.
 *
 * @param importance Note importance (0.0-1.0, where 1.0 = most important)
 * @param mood Current mood
 * @param section Current section
 * @returns Duration multiplier (1.0 - 1.6)
 */
export function agogicDuration(
  importance: number,
  mood: Mood,
  section: Section
): number {
  const strength = AGOGIC_STRENGTH[mood] * SECTION_MULT[section];
  const imp = Math.max(0, Math.min(1, importance));
  return 1.0 + imp * strength * 0.6;
}

/**
 * Determine note importance from position in phrase.
 * First beat, phrase peaks, and resolution points are important.
 *
 * @param beatPosition Position within measure (0-3)
 * @param phrasePosition Position within phrase (0-1)
 * @returns Importance (0.0 - 1.0)
 */
export function noteImportance(
  beatPosition: number,
  phrasePosition: number
): number {
  let importance = 0.3; // baseline
  // Downbeat emphasis
  if (beatPosition === 0) importance += 0.3;
  // Phrase start/end emphasis
  if (phrasePosition < 0.1 || phrasePosition > 0.9) importance += 0.2;
  // Golden section climax
  if (Math.abs(phrasePosition - 0.618) < 0.1) importance += 0.15;
  return Math.min(1.0, importance);
}

/**
 * Get agogic strength for a mood (for testing).
 */
export function agogicStrength(mood: Mood): number {
  return AGOGIC_STRENGTH[mood];
}
