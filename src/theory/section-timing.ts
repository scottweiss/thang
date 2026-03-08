/**
 * Section timing — tension-responsive section duration adjustments.
 *
 * In real music, sections don't have fixed lengths. A build that reaches
 * high tension early should resolve to the peak sooner — holding it too
 * long feels anticlimactic. A relaxed groove with low tension should
 * linger — cutting it short feels rushed.
 *
 * This module adjusts the effective section duration based on current
 * musical tension. Returns a multiplier applied to the base duration:
 * - Values < 1.0 shorten the section (advance sooner)
 * - Values > 1.0 extend the section (linger longer)
 *
 * The adjustment only kicks in during the final third of the section
 * to avoid disrupting the musical flow too early.
 */

import type { Section } from '../types';

/**
 * Compute a duration adjustment multiplier based on tension.
 *
 * Only meaningful when the section is past 70% of its base duration.
 * Before that, returns 1.0 (no adjustment).
 *
 * @param section   Current musical section
 * @param progress  0-1 how far through base duration
 * @param tension   0-1 overall musical tension
 * @returns Duration multiplier (0.85-1.15)
 */
export function sectionTimingMultiplier(
  section: Section,
  progress: number,
  tension: number
): number {
  // Only adjust in the final third of the section
  if (progress < 0.7) return 1.0;

  const t = Math.max(0, Math.min(1, tension));

  switch (section) {
    case 'build':
      // High tension → resolve sooner (shorter), low tension → extend (needs more time)
      // tension 0.8 → 0.85x, tension 0.3 → 1.1x
      return 1.1 - t * 0.3;

    case 'peak':
      // High tension → sustain the peak (extend), low tension → move on (shorter)
      // tension 0.8 → 1.1x, tension 0.3 → 0.95x
      return 0.9 + t * 0.25;

    case 'breakdown':
      // High tension → recover faster (shorter), low tension → float longer (extend)
      // tension 0.7 → 0.9x, tension 0.3 → 1.1x
      return 1.15 - t * 0.3;

    case 'groove':
      // Low tension → linger in the pocket (extend), high tension → push toward build
      // tension 0.7 → 0.9x, tension 0.3 → 1.1x
      return 1.15 - t * 0.3;

    case 'intro':
      // Intro is fixed — no tension adjustment
      return 1.0;

    default:
      return 1.0;
  }
}

/**
 * Whether the section should advance early based on tension.
 * Returns true if high tension suggests cutting the section short.
 *
 * @param section   Current section
 * @param progress  0-1 how far through base duration
 * @param tension   0-1 overall tension
 * @returns true if section should advance now
 */
export function shouldAdvanceEarly(
  section: Section,
  progress: number,
  tension: number
): boolean {
  if (progress < 0.75) return false;

  const mult = sectionTimingMultiplier(section, progress, tension);
  return progress >= mult;
}
