/**
 * Rhythmic counterpoint — interlocking rhythmic patterns between layers.
 *
 * When one layer places notes, complementary layers place rests, creating
 * a woven texture where voices take turns speaking. This is the rhythmic
 * equivalent of conversation: one speaks, the other listens, then they
 * swap. The result feels alive and spacious rather than a wall of sound.
 *
 * The hocket technique (from medieval polyphony) takes this to its extreme:
 * a melody is split between two voices so each sings only fragments,
 * but together they form the complete line.
 */

import type { Section } from '../types';

/**
 * Generate a boolean mask for a complementary layer that interlocks
 * with a primary layer's rhythm.
 *
 * Where the primary has notes, the complement tends to rest.
 * Where the primary rests, the complement tends to play.
 * The density parameter controls overall activity level.
 *
 * @param primarySteps  Step array from the primary layer (notes and rests)
 * @param length        Length of the output boolean array
 * @param density       0-1, overall activity level for the complementary layer
 * @param restToken     Token representing silence (default '~')
 * @returns Boolean array where true = play, false = rest
 */
export function generateComplementaryRhythm(
  primarySteps: string[],
  length: number,
  density: number,
  restToken: string = '~'
): boolean[] {
  const clampedDensity = Math.max(0, Math.min(1, density));
  const result: boolean[] = [];

  for (let i = 0; i < length; i++) {
    const primaryIndex = i % primarySteps.length;
    const primaryIsActive = primarySteps[primaryIndex] !== restToken;

    let probability: number;
    if (primaryIsActive) {
      // Primary is playing — tend to rest, but density still has influence
      probability = clampedDensity * 0.25;
    } else {
      // Primary is resting — tend to play, scaled by density
      probability = clampedDensity * 0.85 + 0.05;
    }

    result.push(Math.random() < probability);
  }

  // Guarantee at least one active position
  if (!result.some((v) => v)) {
    // Pick the position with the best opportunity (primary resting)
    let bestIndex = 0;
    for (let i = 0; i < length; i++) {
      const pi = i % primarySteps.length;
      if (primarySteps[pi] === restToken) {
        bestIndex = i;
        break;
      }
    }
    result[bestIndex] = true;
  }

  return result;
}

/**
 * Apply hocket to two step arrays: where both have notes at the same
 * position, randomly assign one to rest so the voices interlock.
 *
 * Positions where only one layer has a note are preserved unchanged.
 *
 * @param stepsA    First voice's step array
 * @param stepsB    Second voice's step array
 * @param restToken Token representing silence (default '~')
 * @returns Tuple of modified [stepsA, stepsB]
 */
export function hocketize(
  stepsA: string[],
  stepsB: string[],
  restToken: string = '~'
): [string[], string[]] {
  const outA = [...stepsA];
  const outB = [...stepsB];
  const len = Math.min(outA.length, outB.length);

  for (let i = 0; i < len; i++) {
    const aPlays = outA[i] !== restToken;
    const bPlays = outB[i] !== restToken;

    if (aPlays && bPlays) {
      // Collision — randomly silence one voice
      if (Math.random() < 0.5) {
        outA[i] = restToken;
      } else {
        outB[i] = restToken;
      }
    }
  }

  return [outA, outB];
}

/**
 * Determine how strictly counterpoint rules should apply for a given
 * section and tension level.
 *
 * Returns 0-1 where 0 = layers overlap freely and 1 = strict interlocking.
 * High tension reduces strictness because overlapping layers create
 * energy and fullness.
 *
 * @param section  Current musical section
 * @param tension  0-1 tension level
 * @returns Counterpoint strictness (0-1)
 */
export function counterpointDensity(
  section: Section,
  tension: number
): number {
  const baseDensityMap: Record<Section, number> = {
    peak: 0.2,
    groove: 0.5,
    build: 0.4,
    breakdown: 0.6,
    intro: 0.3,
  };

  const baseDensity = baseDensityMap[section] ?? 0.4;
  const clampedTension = Math.max(0, Math.min(1, tension));

  return baseDensity * (1.0 - clampedTension * 0.3);
}
