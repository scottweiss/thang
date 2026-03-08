/**
 * Microtiming and swing utilities for humanizing rhythmic patterns.
 *
 * Provides swing, humanization, groove templates, and velocity curves
 * that can be applied to sequenced patterns to make them feel more
 * natural and stylistically appropriate.
 */

/**
 * Apply swing to a set of positions by delaying off-beat hits.
 * Off-beat positions (those at odd grid indices) get pushed later
 * by `amount * gridSize / 2`.
 *
 * @param positions - Array of time positions (0-based, in grid units)
 * @param amount - Swing amount 0-1 (0 = straight, 1 = full shuffle)
 * @param gridSize - Size of one grid cell (e.g. 0.25 for 16th notes)
 * @returns New array with swung positions
 */
export function applySwing(
  positions: number[],
  amount: number,
  gridSize: number
): number[] {
  if (positions.length === 0) return [];
  const clampedAmount = Math.max(0, Math.min(1, amount));

  return positions.map((pos) => {
    // Determine which grid index this position falls on
    const gridIndex = Math.round(pos / gridSize);
    // Off-beat = odd grid index
    if (gridIndex % 2 !== 0) {
      return pos + clampedAmount * (gridSize / 2);
    }
    return pos;
  });
}

/**
 * Add small random timing offsets to humanize a pattern.
 * Each position is shifted by a random amount within
 * ±(amount * 0.03) of the total cycle range.
 *
 * @param positions - Array of time positions
 * @param amount - Humanization amount 0-1
 * @returns New array with humanized positions
 */
export function humanize(
  positions: number[],
  amount: number
): number[] {
  if (positions.length === 0) return [];
  const clampedAmount = Math.max(0, Math.min(1, amount));
  const maxOffset = clampedAmount * 0.03;

  // Simple seeded PRNG (mulberry32) for deterministic results
  let seed = 42;
  function nextRandom(): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return positions.map((pos) => {
    const offset = (nextRandom() * 2 - 1) * maxOffset;
    return pos + offset;
  });
}

export type GrooveTemplateName =
  | 'straight'
  | 'shuffle'
  | 'triplet'
  | 'push'
  | 'lazy';

/**
 * Generate a groove template — an array of timing offsets for each step.
 *
 * Templates:
 *   straight - all zeros (no offset)
 *   shuffle  - off-beats delayed by 33% of step duration
 *   triplet  - subdivides into 3rds (triplet feel)
 *   push     - notes slightly ahead of beat (-0.01 to -0.02)
 *   lazy     - notes slightly behind beat (+0.01 to +0.02)
 *
 * @param name - Template name
 * @param steps - Number of steps in the pattern
 * @returns Array of timing offsets per step
 */
export function grooveTemplate(
  name: GrooveTemplateName,
  steps: number
): number[] {
  if (steps <= 0) return [];

  switch (name) {
    case 'straight':
      return new Array(steps).fill(0);

    case 'shuffle':
      return Array.from({ length: steps }, (_, i) =>
        i % 2 === 1 ? 0.33 : 0
      );

    case 'triplet':
      // Subdivide into 3rds: steps cycle through 0, 1/3, 2/3 offsets
      return Array.from({ length: steps }, (_, i) => {
        const phase = i % 3;
        return phase / 3;
      });

    case 'push':
      // Notes slightly ahead — varies between -0.01 and -0.02
      return Array.from({ length: steps }, (_, i) =>
        -0.01 - 0.01 * (i % 2)
      );

    case 'lazy':
      // Notes slightly behind — varies between +0.01 and +0.02
      return Array.from({ length: steps }, (_, i) =>
        0.01 + 0.01 * (i % 2)
      );

    default:
      return new Array(steps).fill(0);
  }
}

export type VelocityPattern =
  | 'flat'
  | 'accent14'
  | 'accent1'
  | 'crescendo'
  | 'decrescendo';

/**
 * Generate velocity multipliers (0-1) for each step in a pattern.
 *
 * Patterns:
 *   flat        - all 1.0
 *   accent14    - beats 1 and 3 louder (1.0 vs 0.7) in groups of 4
 *   accent1     - only beat 1 louder (1.0 vs 0.7) in groups of 4
 *   crescendo   - linear ramp from 0.5 to 1.0
 *   decrescendo - linear ramp from 1.0 to 0.5
 *
 * @param steps - Number of steps
 * @param pattern - Velocity pattern name
 * @returns Array of velocity multipliers
 */
export function velocityCurve(
  steps: number,
  pattern: VelocityPattern
): number[] {
  if (steps <= 0) return [];

  switch (pattern) {
    case 'flat':
      return new Array(steps).fill(1.0);

    case 'accent14':
      // Beats 1 and 3 (indices 0 and 2 in groups of 4) are accented
      return Array.from({ length: steps }, (_, i) => {
        const beatInGroup = i % 4;
        return beatInGroup === 0 || beatInGroup === 2 ? 1.0 : 0.7;
      });

    case 'accent1':
      // Only beat 1 (index 0 in groups of 4) is accented
      return Array.from({ length: steps }, (_, i) =>
        i % 4 === 0 ? 1.0 : 0.7
      );

    case 'crescendo':
      // Linear ramp from 0.5 to 1.0
      if (steps === 1) return [1.0];
      return Array.from({ length: steps }, (_, i) =>
        0.5 + 0.5 * (i / (steps - 1))
      );

    case 'decrescendo':
      // Linear ramp from 1.0 to 0.5
      if (steps === 1) return [1.0];
      return Array.from({ length: steps }, (_, i) =>
        1.0 - 0.5 * (i / (steps - 1))
      );

    default:
      return new Array(steps).fill(1.0);
  }
}
