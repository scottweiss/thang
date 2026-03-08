/**
 * Melodic contour shaping — global pitch trajectory for coherent melodies.
 *
 * While Narmour handles local note-to-note expectations, this module
 * provides a macro-level pitch envelope that melodies gravitate toward.
 * In real composition, melodies follow recognizable shapes:
 *
 * - **Arch**: rises to a climax, then falls — the most natural shape.
 *   Used in builds and peaks for dramatic effect.
 * - **Valley**: descends to a nadir, then rises — creates yearning.
 *   Used in breakdowns for emotional depth.
 * - **Ascending**: gradual rise — builds energy and anticipation.
 *   Used late in builds approaching peaks.
 * - **Descending**: gradual fall — releases tension.
 *   Used in breakdowns and fade-outs.
 * - **Plateau**: stays level — stability and groove.
 *   Used in grooves and intros.
 *
 * The contour provides a target pitch offset (in scale steps) that
 * melody generators can use to bias note selection toward the shape.
 * Applied as a BIAS, not a constraint — melodies still have freedom.
 */

import type { Section } from '../types';

export type ContourShape = 'arch' | 'valley' | 'ascending' | 'descending' | 'plateau';

/**
 * Select the appropriate contour shape for a section.
 * Each section has a natural melodic shape.
 */
export function sectionContour(section: Section): ContourShape {
  switch (section) {
    case 'build':
      return 'ascending';
    case 'peak':
      return 'arch';
    case 'breakdown':
      return 'valley';
    case 'intro':
      return 'plateau';
    case 'groove':
      return 'plateau';
    default:
      return 'plateau';
  }
}

/**
 * Compute the pitch offset for a given contour shape and progress.
 *
 * Returns a value in scale steps (not semitones) representing how far
 * above (+) or below (-) the base pitch the melody should gravitate.
 *
 * @param shape     Contour shape to follow
 * @param progress  0-1 position within the phrase/section
 * @param intensity How strongly to apply the contour (0-1, default 1.0)
 * @returns Pitch offset in scale steps (typically -4 to +5)
 */
export function contourOffset(
  shape: ContourShape,
  progress: number,
  intensity: number = 1.0
): number {
  const p = Math.max(0, Math.min(1, progress));
  const i = Math.max(0, Math.min(1, intensity));
  let offset: number;

  switch (shape) {
    case 'arch':
      // Parabolic arch: 0 → peak at 0.4 → 0
      // Peak is slightly before center (golden ratio) for natural feel
      offset = -16 * (p - 0.4) * (p - 0.4) + 5;
      // Clamp to non-negative (arch shouldn't go below baseline)
      offset = Math.max(0, offset);
      break;

    case 'valley':
      // Inverted arch: 0 → nadir at 0.5 → 0
      offset = 8 * (p - 0.5) * (p - 0.5) - 2;
      // Clamp: valley shouldn't go above baseline
      offset = Math.min(0, offset);
      break;

    case 'ascending':
      // Smooth ease-in rise (slow start, faster climb)
      offset = 5 * p * p;
      break;

    case 'descending':
      // Smooth ease-out fall (fast drop, then settles)
      offset = -4 * (1 - (1 - p) * (1 - p));
      break;

    case 'plateau':
      // Gentle undulation around zero (not dead flat)
      offset = 0.5 * Math.sin(p * Math.PI * 2);
      break;

    default:
      offset = 0;
  }

  return offset * i;
}

/**
 * Given a list of available pitches (scale ladder), find the one
 * closest to baseIndex + contour offset.
 *
 * @param ladder       Ordered array of available pitch names
 * @param baseIndex    Current "home" index in the ladder
 * @param offset       Contour offset in scale steps
 * @returns Target index in the ladder (clamped to valid range)
 */
export function contourTargetIndex(
  ladder: string[],
  baseIndex: number,
  offset: number
): number {
  const target = baseIndex + Math.round(offset);
  return Math.max(0, Math.min(ladder.length - 1, target));
}

/**
 * Compute the "pull strength" of the contour at a given progress.
 * Stronger pull at the beginning and climax of the shape,
 * weaker in transitions (allowing more freedom).
 *
 * @param shape    Contour shape
 * @param progress 0-1 position
 * @returns Pull strength 0-1 (0 = no pull, 1 = strong pull toward contour)
 */
export function contourPull(shape: ContourShape, progress: number): number {
  const p = Math.max(0, Math.min(1, progress));

  switch (shape) {
    case 'arch':
      // Strong pull at the peak (0.3-0.5), weaker at edges
      return 0.4 + 0.6 * Math.exp(-8 * (p - 0.4) * (p - 0.4));

    case 'valley':
      // Strong pull at the nadir (0.4-0.6)
      return 0.4 + 0.6 * Math.exp(-8 * (p - 0.5) * (p - 0.5));

    case 'ascending':
      // Pull increases as we climb
      return 0.3 + 0.5 * p;

    case 'descending':
      // Strong pull at start, fading
      return 0.6 * (1 - p) + 0.2;

    case 'plateau':
      // Gentle, consistent pull
      return 0.3;

    default:
      return 0.3;
  }
}
