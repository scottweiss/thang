/**
 * Harmonic momentum — chord change probability shaped by section progress.
 *
 * In real music, harmonic rhythm (rate of chord changes) accelerates
 * toward section boundaries. A build approaching its peak has faster
 * chord changes creating urgency. A groove settling in has slower
 * changes, letting the pocket establish. Near the end of any section,
 * changes increase to create forward momentum into the transition.
 *
 * Returns a multiplier that adjusts chord timing:
 * - < 1.0 means faster changes (shorter wait)
 * - > 1.0 means slower changes (longer wait)
 */

import type { Section } from '../types';

/**
 * Compute a chord timing multiplier based on section progress.
 *
 * Early in a section → slower (let the section establish)
 * Late in a section → faster (create momentum toward transition)
 * Build sections accelerate dramatically toward the end.
 *
 * @param section   Current musical section
 * @param progress  0-1 position within section
 * @returns Multiplier for chord timing (0.6-1.4)
 */
export function harmonicMomentumMultiplier(
  section: Section,
  progress: number
): number {
  const p = Math.max(0, Math.min(1, progress));

  switch (section) {
    case 'build':
      // Classic build: harmony accelerates toward the drop
      // Start slow (1.3x) → end fast (0.6x)
      return 1.3 - p * 0.7;

    case 'peak':
      // Peak starts with fast harmony, gradually settles
      // Start fast (0.7x) → mid fast (0.8x) → end moderate (0.9x)
      return 0.7 + p * 0.2;

    case 'breakdown':
      // Breakdown: slow harmony, letting each chord breathe
      // Slight acceleration at end to prepare for next section
      if (p > 0.8) return 1.0; // slight pickup at end
      return 1.3;

    case 'groove':
      // Groove: moderate, consistent, with slight end-of-section pickup
      if (p > 0.85) return 0.85;
      return 1.05;

    case 'intro':
      // Intro: slow at start, gradually opening up
      return 1.4 - p * 0.3;

    default:
      return 1.0;
  }
}
