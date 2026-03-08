/**
 * Melodic gravity field — weighted note selection based on musical context.
 *
 * When filling in melodic patterns, random note selection sounds aimless.
 * This module computes a probability weight for each note in the pitch
 * ladder based on multiple gravitational forces:
 *
 * 1. **Proximity**: Notes near the previous note are preferred (stepwise motion)
 * 2. **Chord tone attraction**: Notes that are chord tones get a boost
 * 3. **Contour momentum**: Notes in the current melodic direction are favored
 * 4. **Tension-responsive leap size**: Higher tension allows larger intervals
 * 5. **Register centering**: Notes near the center of the range are preferred
 *    (prevents melodies from drifting to extremes)
 *
 * 6. **Intervallic consonance**: Notes are weighted by their harmonic
 *    relationship to ALL chord tones (not just binary chord/non-chord).
 *    A perfect 5th against a chord tone is better than a minor 2nd.
 *
 * The result is melodies that feel intentional — each note connects logically
 * to the previous one while following the harmonic and emotional arc.
 */

import { consonanceWeights } from './intervallic-consonance';

/**
 * Context for computing note weights.
 */
export interface MelodicContext {
  /** Index of the previous note in the ladder (or -1 if no previous) */
  prevIndex: number;
  /** Indices of chord tones in the ladder */
  chordIndices: number[];
  /** Current melodic direction: +1 ascending, -1 descending, 0 neutral */
  direction: number;
  /** Overall tension 0-1 (higher = larger leaps allowed) */
  tension: number;
  /** Optional: MIDI-like pitch for each ladder position (enables consonance weighting) */
  ladderPitches?: number[];
  /** Optional: MIDI-like pitch for each chord tone (enables consonance weighting) */
  chordPitches?: number[];
}

/**
 * Compute selection weights for each note in the ladder.
 * Higher weight = more likely to be selected.
 *
 * @param ladderSize  Total notes in the pitch ladder
 * @param ctx         Musical context
 * @returns Array of weights (same length as ladder)
 */
export function melodicWeights(
  ladderSize: number,
  ctx: MelodicContext
): number[] {
  if (ladderSize <= 0) return [];

  const weights = new Array(ladderSize).fill(1.0);
  const center = Math.floor(ladderSize / 2);

  for (let i = 0; i < ladderSize; i++) {
    // 1. Proximity to previous note (strongest force)
    if (ctx.prevIndex >= 0) {
      const dist = Math.abs(i - ctx.prevIndex);
      // Stepwise motion (1-2 steps) is preferred
      // Wider leaps allowed at higher tension
      const maxComfortable = 2 + Math.floor(ctx.tension * 4); // 2-6 steps
      // Gaussian sigma scales with tension (wider = more distant notes accessible)
      const sigma = 1.5 + ctx.tension * 3; // 1.5-4.5
      if (dist <= maxComfortable) {
        weights[i] *= Math.exp(-dist * dist / (2 * sigma * sigma));
        // Extra boost for steps of 1-2 (always feels natural)
        if (dist <= 2) weights[i] *= 1.3;
      } else {
        // Penalize very large leaps (but don't zero them out)
        weights[i] *= 0.05;
      }
    }

    // 2. Harmonic attraction (consonance-aware when pitch data available)
    if (ctx.ladderPitches && ctx.chordPitches && ctx.chordPitches.length > 0) {
      // Nuanced: weight by intervallic consonance with all chord tones
      const cWeights = consonanceWeights(
        ladderSize, ctx.ladderPitches, ctx.chordPitches, ctx.tension
      );
      // Scale consonance to a 0.5–2.5 multiplier range
      weights[i] *= 0.5 + cWeights[i] * 2.0;
    } else {
      // Fallback: binary chord-tone matching
      if (ctx.chordIndices.includes(i)) {
        weights[i] *= 2.0;
      }
      // Non-chord tones adjacent to chord tones get a smaller boost (passing tones)
      if (ctx.chordIndices.some(ci => Math.abs(ci - i) === 1)) {
        weights[i] *= 1.3;
      }
    }

    // 3. Contour momentum (favor notes in the current direction)
    if (ctx.prevIndex >= 0 && ctx.direction !== 0) {
      const isInDirection = (ctx.direction > 0 && i > ctx.prevIndex) ||
                            (ctx.direction < 0 && i < ctx.prevIndex);
      if (isInDirection) {
        weights[i] *= 2.0;
      }
      // Same note as previous slightly penalized (repetition)
      if (i === ctx.prevIndex) {
        weights[i] *= 0.5;
      }
    }

    // 4. Register centering (gentle pull toward middle of range)
    const distFromCenter = Math.abs(i - center);
    const centerPenalty = distFromCenter / ladderSize;
    weights[i] *= 1.0 - centerPenalty * 0.3;
  }

  return weights;
}

/**
 * Select a note index from the ladder using melodic gravity weights.
 *
 * @param ladderSize  Total notes in the pitch ladder
 * @param ctx         Musical context
 * @returns Selected index in the ladder
 */
export function selectMelodicNote(
  ladderSize: number,
  ctx: MelodicContext
): number {
  const weights = melodicWeights(ladderSize, ctx);
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return Math.floor(ladderSize / 2);

  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * Infer melodic direction from a sequence of notes (ladder indices).
 * Returns +1 (ascending), -1 (descending), or 0 (static/mixed).
 */
export function inferDirection(indices: number[]): number {
  if (indices.length < 2) return 0;

  let ups = 0;
  let downs = 0;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] > indices[i - 1]) ups++;
    else if (indices[i] < indices[i - 1]) downs++;
  }

  if (ups > downs + 1) return 1;
  if (downs > ups + 1) return -1;
  return 0;
}
