/**
 * Tension curve shaping — custom tension envelopes per mood/section.
 *
 * Different moods want different tension profiles: trance builds
 * linearly, ambient undulates, syro has jagged peaks. This module
 * provides shaped tension curves that replace linear section progress.
 *
 * Applied as tension multiplier that reshapes the raw section progress.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood curve type.
 */
const CURVE_TYPE: Record<Mood, 'linear' | 'exponential' | 'sine' | 'plateau' | 'jagged'> = {
  trance:    'exponential',  // slow build, sudden peak
  avril:     'sine',         // gentle waves
  disco:     'plateau',      // quick rise, sustain
  downtempo: 'sine',         // undulating
  blockhead: 'linear',       // steady build
  lofi:      'sine',         // gentle waves
  flim:      'sine',         // delicate waves
  xtal:      'exponential',  // crystalline build
  syro:      'jagged',       // unpredictable
  ambient:   'sine',         // slow breathing,
  plantasia: 'sine',
};

/**
 * Per-mood curve intensity (higher = more shaped, less linear).
 */
const CURVE_INTENSITY: Record<Mood, number> = {
  trance:    0.50,
  avril:     0.45,
  disco:     0.35,
  downtempo: 0.40,
  blockhead: 0.30,
  lofi:      0.45,
  flim:      0.50,
  xtal:      0.55,
  syro:      0.60,
  ambient:   0.50,
  plantasia: 0.50,
};

/**
 * Shape section progress into a tension curve.
 *
 * @param sectionProgress Raw progress (0.0-1.0)
 * @param mood Current mood
 * @returns Shaped tension (0.0-1.0)
 */
export function shapedTension(
  sectionProgress: number,
  mood: Mood
): number {
  const t = Math.max(0, Math.min(1, sectionProgress));
  const intensity = CURVE_INTENSITY[mood];
  const type = CURVE_TYPE[mood];

  let shaped: number;
  switch (type) {
    case 'exponential':
      shaped = Math.pow(t, 1 + intensity);
      break;
    case 'sine':
      shaped = 0.5 + Math.sin(t * Math.PI - Math.PI / 2) * 0.5;
      break;
    case 'plateau':
      shaped = Math.min(1.0, t * (1 + intensity));
      break;
    case 'jagged': {
      const hash = ((Math.floor(t * 8) * 2654435761) >>> 0) / 4294967296;
      shaped = t * (1 - intensity * 0.3) + hash * intensity * 0.3;
      break;
    }
    case 'linear':
    default:
      shaped = t;
  }

  // Blend between linear and shaped
  return t * (1 - intensity) + shaped * intensity;
}

/**
 * Get curve intensity for a mood (for testing).
 */
export function curveIntensity(mood: Mood): number {
  return CURVE_INTENSITY[mood];
}
