/**
 * Envelope evolution — ADSR parameters evolve with section progress.
 *
 * Attack and release times shape how notes feel:
 * - Short attack = punchy, energetic, present
 * - Long attack = soft, dreamy, ambient
 * - Short release = tight, controlled
 * - Long release = lingering, spacious
 *
 * During builds, attacks shorten and releases tighten for increasing energy.
 * During breakdowns, attacks lengthen and releases bloom for dreaminess.
 * Peaks are punchy and immediate. Intros are soft and open.
 *
 * Applied as multipliers to existing .attack() and .release() values.
 * Kept subtle (±30%) to preserve the timbre's character.
 */

import type { Section } from '../types';

interface EnvelopeShape {
  attackStart: number;   // attack multiplier at section start
  attackEnd: number;     // attack multiplier at section end
  releaseStart: number;  // release multiplier at section start
  releaseEnd: number;    // release multiplier at section end
}

const SECTION_ENVELOPE: Record<Section, EnvelopeShape> = {
  intro:     { attackStart: 1.3,  attackEnd: 1.1,  releaseStart: 1.3, releaseEnd: 1.1 },  // soft, opening up
  build:     { attackStart: 1.1,  attackEnd: 0.75, releaseStart: 1.1, releaseEnd: 0.8 },  // tightening
  peak:      { attackStart: 0.8,  attackEnd: 0.85, releaseStart: 0.85, releaseEnd: 0.9 }, // punchy, stable
  breakdown: { attackStart: 0.9,  attackEnd: 1.3,  releaseStart: 0.9, releaseEnd: 1.3 },  // softening
  groove:    { attackStart: 0.95, attackEnd: 1.0,  releaseStart: 0.95, releaseEnd: 1.0 }, // relaxed pocket
};

/**
 * Compute attack time multiplier based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for .attack() values (typically 0.75-1.3)
 */
export function attackMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_ENVELOPE[section] ?? SECTION_ENVELOPE.groove;
  return shape.attackStart + (shape.attackEnd - shape.attackStart) * p;
}

/**
 * Compute release time multiplier based on section progress.
 */
export function releaseMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_ENVELOPE[section] ?? SECTION_ENVELOPE.groove;
  return shape.releaseStart + (shape.releaseEnd - shape.releaseStart) * p;
}

/**
 * Whether envelope evolution should be applied for this section.
 * Only sections with meaningful envelope change benefit.
 */
export function shouldApplyEnvelopeEvolution(section: Section): boolean {
  const shape = SECTION_ENVELOPE[section];
  const attackDelta = Math.abs(shape.attackEnd - shape.attackStart);
  const releaseDelta = Math.abs(shape.releaseEnd - shape.releaseStart);
  return attackDelta > 0.12 || releaseDelta > 0.12;
}
