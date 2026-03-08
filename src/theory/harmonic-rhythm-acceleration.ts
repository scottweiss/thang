/**
 * Harmonic rhythm acceleration — chord changes speed up at cadences.
 *
 * In classical music, harmonic rhythm often accelerates approaching
 * a cadence (e.g., one chord per bar → one per beat). This creates
 * forward momentum and a sense of arrival.
 *
 * Applied as chord duration multiplier that decreases near phrase ends.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood acceleration strength.
 */
const ACCEL_STRENGTH: Record<Mood, number> = {
  trance:    0.30,  // moderate
  avril:     0.55,  // strongest — classical cadential acceleration
  disco:     0.20,  // weak — steady rhythm
  downtempo: 0.35,  // moderate
  blockhead: 0.25,  // weak
  lofi:      0.45,  // strong — jazz acceleration
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.15,  // weakest — independent timing
  ambient:   0.30,  // moderate — gentle acceleration
};

/**
 * Section multipliers.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,   // gentle
  build:     1.2,   // accelerating builds
  peak:      0.8,   // sustained
  breakdown: 0.6,   // relaxed
  groove:    1.0,   // normal
};

/**
 * Calculate chord duration multiplier based on phrase position.
 * Later in phrase = faster harmonic rhythm.
 *
 * @param phrasePosition 0.0-1.0 position within phrase
 * @param mood Current mood
 * @param section Current section
 * @returns Duration multiplier (0.5 - 1.2)
 */
export function harmonicAcceleration(
  phrasePosition: number,
  mood: Mood,
  section: Section
): number {
  const strength = ACCEL_STRENGTH[mood] * SECTION_MULT[section];
  const pos = Math.max(0, Math.min(1, phrasePosition));
  // Exponential acceleration toward phrase end
  const accel = Math.pow(pos, 2) * strength;
  return Math.max(0.5, Math.min(1.2, 1.2 - accel * 0.7));
}

/**
 * Whether acceleration is noticeable enough to apply.
 */
export function shouldAccelerate(
  phrasePosition: number,
  mood: Mood,
  section: Section
): boolean {
  return phrasePosition > 0.5 && ACCEL_STRENGTH[mood] * SECTION_MULT[section] > 0.15;
}

/**
 * Get acceleration strength for a mood (for testing).
 */
export function harmonicAccelStrength(mood: Mood): number {
  return ACCEL_STRENGTH[mood];
}
