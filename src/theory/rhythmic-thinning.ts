/**
 * Rhythmic thinning — reduce note density when harmonics are rich.
 *
 * When a chord has many voices or rich harmonic content (7ths, 9ths),
 * the rhythm should thin out to prevent saturation. Conversely,
 * simple triads can sustain denser rhythmic patterns.
 *
 * Applied as degradeBy() probability or note rest insertion.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood thinning sensitivity (higher = more responsive to harmonic density).
 */
const THINNING_SENSITIVITY: Record<Mood, number> = {
  trance:    0.25,  // weak — dense rhythms OK
  avril:     0.50,  // strong — orchestral clarity
  disco:     0.15,  // very weak — keep it moving
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // strongest — space is key
  flim:      0.45,  // strong — delicate balance
  xtal:      0.50,  // strong — crystalline clarity
  syro:      0.20,  // weak — dense patterns OK
  ambient:   0.60,  // strongest — sparse by nature,
  plantasia: 0.60,
};

/**
 * Section multipliers for thinning.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.3,   // more thinning in sparse intro
  build:     0.8,   // less thinning as energy builds
  peak:      0.6,   // least thinning at peak
  breakdown: 1.2,   // more thinning in breakdown
  groove:    0.9,   // moderate
};

/**
 * Calculate thinning factor based on harmonic complexity.
 *
 * @param voiceCount Number of chord voices (1-6)
 * @param mood Current mood
 * @param section Current section
 * @returns Thinning probability 0.0 (no thinning) to 0.6 (heavy thinning)
 */
export function harmonicThinning(
  voiceCount: number,
  mood: Mood,
  section: Section
): number {
  const sensitivity = THINNING_SENSITIVITY[mood] * SECTION_MULT[section];
  const voices = Math.max(1, Math.min(6, voiceCount));
  // Thinning increases with voice count above 3
  const excess = Math.max(0, voices - 3);
  const thinning = excess * 0.15 * sensitivity;
  return Math.max(0.0, Math.min(0.6, thinning));
}

/**
 * Gain reduction for melodic layers when harmony is thick.
 *
 * @param voiceCount Number of chord voices
 * @param mood Current mood
 * @returns Gain multiplier (0.7 - 1.0)
 */
export function thicknessGainReduction(
  voiceCount: number,
  mood: Mood
): number {
  const sensitivity = THINNING_SENSITIVITY[mood];
  const voices = Math.max(1, Math.min(6, voiceCount));
  const excess = Math.max(0, voices - 3);
  return Math.max(0.7, 1.0 - excess * 0.08 * sensitivity);
}

/**
 * Get thinning sensitivity for a mood (for testing).
 */
export function thinningSensitivity(mood: Mood): number {
  return THINNING_SENSITIVITY[mood];
}
