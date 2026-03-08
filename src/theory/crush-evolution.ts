/**
 * Crush evolution — bit depth modulation with section progress.
 *
 * Bit crushing (sample rate/bit depth reduction) adds digital grit and
 * character. By evolving crush values across sections, we create timbral
 * motion that's distinct from FM modulation:
 *
 * - Builds: crush deepens (lower values = more grit), adding energy/urgency
 * - Peaks: moderate crush for presence without harshness
 * - Breakdowns: crush lightens (higher values = cleaner), opening up space
 * - Intros: clean, minimal crush
 *
 * Applied as additive offset to existing .crush(NUMBER) values.
 * Additive because crush values are typically 8-16 (bit depth) and
 * multiplying small values would overshoot.
 *
 * Negative offset = grittier (fewer bits), positive = cleaner (more bits).
 */

import type { Section } from '../types';

interface CrushShape {
  offsetStart: number;  // additive offset at section start
  offsetEnd: number;    // additive offset at section end
}

const SECTION_CRUSH: Record<Section, CrushShape> = {
  intro:     { offsetStart: 1.5,  offsetEnd: 1.0 },    // clean, slightly opening
  build:     { offsetStart: 0.5,  offsetEnd: -2.0 },    // progressively grittier
  peak:      { offsetStart: -1.0, offsetEnd: -0.5 },    // gritty but stable
  breakdown: { offsetStart: -0.5, offsetEnd: 1.5 },     // cleaning up
  groove:    { offsetStart: 0.0,  offsetEnd: 0.0 },     // neutral
};

/**
 * Compute crush offset based on section progress.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Additive offset for .crush() values (typically -2 to +1.5)
 */
export function crushOffset(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));
  const shape = SECTION_CRUSH[section] ?? SECTION_CRUSH.groove;
  return shape.offsetStart + (shape.offsetEnd - shape.offsetStart) * p;
}

/**
 * Whether crush evolution should be applied for this section.
 */
export function shouldApplyCrushEvolution(section: Section): boolean {
  const shape = SECTION_CRUSH[section];
  return Math.abs(shape.offsetEnd - shape.offsetStart) > 0.5;
}
