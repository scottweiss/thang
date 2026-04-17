/**
 * Anticipatory accent — emphasis before the beat for forward momentum.
 *
 * In jazz and funk, accenting notes BEFORE the downbeat creates a
 * pulling-forward sensation that makes grooves feel urgent and alive.
 * The anticipation displaces the accent from where the ear expects it.
 *
 * Applied as gain boost on off-beat notes and reduction on downbeats.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood anticipation strength.
 */
const ANTICIPATION_STRENGTH: Record<Mood, number> = {
  trance:    0.15,  // weak — trance is on-the-beat
  avril:     0.25,  // moderate — classical upbeat emphasis
  disco:     0.40,  // strong — funk anticipation
  downtempo: 0.35,  // strong — lazy anticipation
  blockhead: 0.45,  // strong — hip-hop swing
  lofi:      0.50,  // strongest — jazz anticipation
  flim:      0.30,  // moderate
  xtal:      0.15,  // weak — ambient floats
  syro:      0.35,  // moderate — IDM displacement
  ambient:   0.05,  // minimal — no pulse to anticipate,
  plantasia: 0.05,
};

/**
 * Section multiplier.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.6,
  build:     1.0,
  peak:      1.2,   // maximum forward drive
  breakdown: 0.5,   // less anticipation — reflective
  groove:    1.1,
};

/**
 * Calculate gain boost for anticipatory accent.
 *
 * @param beatPosition Position within beat (0.0 = downbeat, 0.5 = upbeat)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.92 - 1.12)
 */
export function anticipatoryGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const strength = ANTICIPATION_STRENGTH[mood] * SECTION_MULT[section];
  // Sine curve: negative at downbeat (0), positive before next downbeat (0.75-0.9)
  const phase = beatPosition * Math.PI * 2;
  const accent = Math.sin(phase + Math.PI * 0.3); // shifted forward
  return 1.0 + accent * strength * 0.12;
}

/**
 * Get anticipation strength for a mood (for testing).
 */
export function anticipationStrength(mood: Mood): number {
  return ANTICIPATION_STRENGTH[mood];
}
