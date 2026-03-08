/**
 * Melodic arc — global pitch trajectory across a section.
 *
 * Each section has a characteristic pitch shape: builds rise,
 * breakdowns fall, peaks sustain high, grooves oscillate.
 * This module provides a target register at each point in the
 * section, creating a large-scale melodic "shape" that listeners
 * feel even if they can't articulate it.
 *
 * Different from melodic-contour (per-phrase shapes) — this is
 * the macro arc across an entire section.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood arc intensity (how much the register shifts across sections).
 */
const ARC_INTENSITY: Record<Mood, number> = {
  trance:    0.40,  // strong arc
  avril:     0.55,  // dramatic sweep
  disco:     0.30,  // moderate groove arc
  downtempo: 0.35,  // gentle arc
  blockhead: 0.25,  // choppy, less arc
  lofi:      0.45,  // jazz sweep
  flim:      0.40,  // organic arc
  xtal:      0.30,  // floating arc
  syro:      0.20,  // less directed
  ambient:   0.15,  // barely arcing
};

/**
 * Section arc shapes (normalized 0-1 progress → register offset).
 * Positive = higher register, negative = lower.
 */
const SECTION_ARC: Record<Section, (progress: number) => number> = {
  intro:     (p) => -0.3 + p * 0.3,           // starts low, rises gently
  build:     (p) => p * p,                      // accelerating rise
  peak:      (p) => 0.8 + Math.sin(p * Math.PI) * 0.2, // sustains high with slight arch
  breakdown: (p) => 0.6 * (1 - p),             // gradual descent
  groove:    (p) => Math.sin(p * 2 * Math.PI) * 0.3,    // oscillating
};

/**
 * Calculate the target register offset at a given section progress.
 *
 * @param sectionProgress Progress within section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Register offset in octaves (-1 to +1)
 */
export function arcRegisterOffset(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = ARC_INTENSITY[mood];
  const shape = SECTION_ARC[section];
  return shape(sectionProgress) * intensity;
}

/**
 * Convert arc offset to semitones for MIDI shifting.
 *
 * @param offset Register offset from arcRegisterOffset
 * @returns Semitone shift (rounded)
 */
export function arcSemitoneShift(offset: number): number {
  return Math.round(offset * 12);
}

/**
 * Should melodic arc be applied?
 */
export function shouldApplyMelodicArc(mood: Mood): boolean {
  return ARC_INTENSITY[mood] > 0.18;
}

/**
 * Get arc intensity for a mood (for testing).
 */
export function arcIntensity(mood: Mood): number {
  return ARC_INTENSITY[mood];
}
