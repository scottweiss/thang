/**
 * Density contour — note density evolves within sections.
 *
 * Instead of a fixed density multiplier per section, density follows
 * a curve that creates organic internal evolution:
 * - Build: starts sparse, accelerates toward end (momentum)
 * - Peak: full density with slight random variation (alive)
 * - Breakdown: drops quickly then settles (sudden space)
 * - Intro: gradual increase from silence (emerging)
 * - Groove: steady with gentle sine wave (breathing)
 *
 * The result is that sections don't feel like static blocks —
 * they each have an internal dynamic shape.
 */

import type { Section } from '../types';

/**
 * Compute density multiplier based on section progress.
 *
 * @param section    Current section type
 * @param progress   Section progress 0-1 (0 = just started, 1 = about to end)
 * @param baseDensity The section's base density multiplier
 * @returns Adjusted density multiplier
 */
export function densityContour(
  section: Section,
  progress: number,
  baseDensity: number
): number {
  const p = Math.max(0, Math.min(1, progress));

  switch (section) {
    case 'intro':
      // Emerge from silence: cubic ease-in (0.3 → 1.0 of base)
      return baseDensity * (0.3 + 0.7 * p * p * p);

    case 'build':
      // Accelerate: quadratic ease-in (0.5 → 1.2 of base)
      return baseDensity * (0.5 + 0.7 * p * p);

    case 'peak':
      // Full energy with subtle breathing (±5%)
      return baseDensity * (0.95 + 0.1 * Math.sin(p * Math.PI * 4));

    case 'breakdown':
      // Quick drop then plateau: exponential decay
      return baseDensity * (0.4 + 0.6 * Math.exp(-3 * p));

    case 'groove':
      // Steady with gentle sine wave breathing (±10%)
      return baseDensity * (0.9 + 0.2 * Math.sin(p * Math.PI * 2));
  }
}

/**
 * Whether density contour should be applied (always true, low cost).
 */
export function shouldApplyDensityContour(progress: number): boolean {
  return progress > 0.01; // Skip at very start (no progress yet)
}
