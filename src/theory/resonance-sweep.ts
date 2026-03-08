/**
 * Resonance sweep — filter Q evolves with section progress.
 *
 * Filter resonance (Q) controls the emphasis around the cutoff frequency.
 * Higher resonance creates a narrow peak that adds bite and excitement —
 * the classic "acid" or "trance" sweep sound. Lower resonance gives
 * warmth and transparency.
 *
 * During builds, resonance rises to add tension and edge.
 * During breakdowns, resonance drops for warmth and openness.
 * At peaks, resonance stays moderate — enough bite without harshness.
 *
 * Applied as a multiplier to existing .resonance() values.
 */

import type { Section } from '../types';

interface ResonanceShape {
  startMult: number;  // multiplier at section start
  endMult: number;    // multiplier at section end
}

const SECTION_RESONANCE: Record<Section, ResonanceShape> = {
  intro:     { startMult: 0.8,  endMult: 0.9 },    // gentle, transparent
  build:     { startMult: 0.85, endMult: 1.3 },     // rising edge and tension
  peak:      { startMult: 1.1,  endMult: 1.0 },     // bright but stable
  breakdown: { startMult: 1.1,  endMult: 0.7 },     // fading to warmth
  groove:    { startMult: 0.95, endMult: 1.05 },    // subtle pocket
};

/**
 * Compute resonance multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .resonance() values (typically 0.7-1.3)
 */
export function resonanceSweepMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_RESONANCE[section] ?? SECTION_RESONANCE.groove;
  return shape.startMult + (shape.endMult - shape.startMult) * p;
}

/**
 * Whether resonance sweep should be applied for this section.
 */
export function shouldApplyResonanceSweep(section: Section): boolean {
  const shape = SECTION_RESONANCE[section];
  return Math.abs(shape.endMult - shape.startMult) > 0.12;
}
