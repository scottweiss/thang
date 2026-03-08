/**
 * Phrase momentum — energy accumulates within phrases then releases.
 *
 * As a phrase progresses, musical energy builds through increasing
 * density, dynamics, and brightness. At the phrase boundary, this
 * accumulated energy releases, creating a natural breathing rhythm
 * at the phrase level.
 *
 * Applied as a gain/brightness curve within each phrase.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood momentum intensity (0 = flat, 1 = dramatic build/release).
 */
const MOMENTUM_INTENSITY: Record<Mood, number> = {
  trance:    0.45,  // strong — dance drive
  avril:     0.60,  // strong — Romantic phrase shape
  disco:     0.40,  // moderate
  downtempo: 0.35,  // moderate — lazy
  blockhead: 0.50,  // strong — hip-hop energy
  lofi:      0.40,  // moderate — jazz phrase arc
  flim:      0.35,  // moderate
  xtal:      0.25,  // weak — ambient float
  syro:      0.30,  // moderate
  ambient:   0.15,  // weakest — static energy
};

/**
 * Section multiplier on momentum.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,
  build:     1.2,   // strong momentum building
  peak:      1.0,
  breakdown: 0.6,   // weak — reflective
  groove:    1.1,
};

/**
 * Calculate gain multiplier from phrase momentum.
 *
 * @param phraseProgress Position within phrase (0.0 - 1.0)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.9 - 1.15)
 */
export function momentumGain(
  phraseProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = MOMENTUM_INTENSITY[mood] * SECTION_MULT[section];
  // Asymmetric curve: gradual build, quick release at end
  let curve: number;
  if (phraseProgress < 0.85) {
    // Building phase — gradual increase
    curve = phraseProgress / 0.85;
  } else {
    // Release phase — quick drop
    curve = 1.0 - (phraseProgress - 0.85) / 0.15;
  }
  return 1.0 + (curve - 0.5) * intensity * 0.3;
}

/**
 * Calculate brightness multiplier from phrase momentum.
 *
 * @param phraseProgress Position within phrase (0.0 - 1.0)
 * @param mood Current mood
 * @param section Current section
 * @returns LPF multiplier (0.95 - 1.1)
 */
export function momentumBrightness(
  phraseProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = MOMENTUM_INTENSITY[mood] * SECTION_MULT[section];
  const curve = Math.min(1.0, phraseProgress / 0.8);
  return 1.0 + curve * intensity * 0.1;
}

/**
 * Get momentum intensity for a mood (for testing).
 */
export function momentumIntensity(mood: Mood): number {
  return MOMENTUM_INTENSITY[mood];
}
