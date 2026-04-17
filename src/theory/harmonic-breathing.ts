/**
 * Harmonic breathing — chord voicings expand and contract like lungs.
 *
 * Within a phrase, voicings gradually open (wider intervals) then close
 * toward cadence points. This creates a natural "breathing" motion
 * in the harmony independent of volume dynamics.
 *
 * Applied as voicing spread suggestion for harmony layer.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood breathing depth (0 = flat, 1 = dramatic open/close).
 */
const BREATHING_DEPTH: Record<Mood, number> = {
  trance:    0.25,  // moderate — pad movement
  avril:     0.60,  // strong — Romantic phrasing
  disco:     0.20,  // weak — steady voicings
  downtempo: 0.45,  // strong — lazy open/close
  blockhead: 0.30,  // moderate
  lofi:      0.50,  // strong — jazz voicing play
  flim:      0.40,  // moderate — organic
  xtal:      0.55,  // strong — ambient space
  syro:      0.15,  // weak — IDM voicings shift independently
  ambient:   0.65,  // strongest — deep breathing pads,
  plantasia: 0.65,
};

/**
 * Section multiplier on breathing depth.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     1.2,   // opening up
  build:     0.9,
  peak:      0.7,   // compact — energy
  breakdown: 1.3,   // widest — spacious
  groove:    1.0,
};

/**
 * Calculate voicing spread multiplier based on phrase position.
 *
 * @param phraseProgress Position within phrase (0.0 - 1.0)
 * @param mood Current mood
 * @param section Current section
 * @returns Spread multiplier (0.8 - 1.4, where 1.0 = neutral)
 */
export function breathingSpread(
  phraseProgress: number,
  mood: Mood,
  section: Section
): number {
  const depth = BREATHING_DEPTH[mood] * SECTION_MULT[section];
  // Sine wave: opens in first half, closes in second half
  const wave = Math.sin(phraseProgress * Math.PI);
  // Map to spread: wave peaks at 0.5 progress, returns to baseline at 0 and 1
  return 1.0 + wave * depth * 0.4;
}

/**
 * Get breathing depth for a mood (for testing).
 */
export function breathingDepth(mood: Mood): number {
  return BREATHING_DEPTH[mood];
}

/**
 * Should harmonic breathing be applied?
 */
export function shouldApplyBreathing(mood: Mood, section: Section): boolean {
  return BREATHING_DEPTH[mood] * SECTION_MULT[section] > 0.10;
}
