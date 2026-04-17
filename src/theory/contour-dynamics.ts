/**
 * Contour dynamics — velocity follows pitch direction.
 *
 * A fundamental performance technique: ascending passages naturally
 * crescendo (get louder), descending passages diminuendo (get softer).
 * This creates a sense of effort and release that makes melodies and
 * arpeggios feel alive.
 *
 * Applied as gain multipliers per step based on pitch direction:
 * - Rising pitch → slight gain increase (effort, energy)
 * - Falling pitch → slight gain decrease (relaxation, release)
 * - Same pitch → neutral (sustain)
 * - Rest → neutral
 *
 * The effect is subtle (±5-15%) to avoid being distracting.
 */

import type { Mood } from '../types';

/**
 * Generate contour-based gain multipliers for a sequence of notes.
 *
 * @param elements  Note names with octaves, or '~' for rests
 * @param mood      Current mood (controls effect depth)
 * @param restToken Rest token (default '~')
 * @returns Array of gain multipliers (same length as elements)
 */
export function contourGainMultipliers(
  elements: string[],
  mood: Mood,
  restToken: string = '~'
): number[] {
  const depth = CONTOUR_DEPTH[mood];
  if (depth < 0.02) return new Array(elements.length).fill(1.0);

  const result = new Array(elements.length).fill(1.0);
  let prevPitch = -1;

  for (let i = 0; i < elements.length; i++) {
    if (elements[i] === restToken) continue;

    const pitch = approxPitch(elements[i]);
    if (pitch <= 0) continue;

    if (prevPitch > 0) {
      const diff = pitch - prevPitch;
      if (diff > 0) {
        // Ascending — crescendo (louder)
        result[i] = 1.0 + Math.min(diff / 12, 1.0) * depth;
      } else if (diff < 0) {
        // Descending — diminuendo (softer)
        result[i] = 1.0 - Math.min(Math.abs(diff) / 12, 1.0) * depth * 0.7;
      }
      // Same pitch → stays at 1.0
    }
    prevPitch = pitch;
  }

  return result;
}

/**
 * Whether contour dynamics should be applied.
 */
export function shouldApplyContourDynamics(mood: Mood): boolean {
  return CONTOUR_DEPTH[mood] >= 0.03;
}

function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return 0;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = base[match[1]] ?? 0;
  const acc = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (parseInt(match[3]) + 1) * 12 + letter + acc;
}

/** How strongly pitch direction affects velocity per mood */
const CONTOUR_DEPTH: Record<Mood, number> = {
  lofi:      0.12,   // jazz — expressive dynamics
  avril:     0.12,   // intimate — subtle expression
  downtempo: 0.10,   // smooth — gentle dynamics
  flim:      0.10,   // delicate — noticeable contour
  blockhead: 0.08,   // hip-hop — some expression
  xtal:      0.08,   // dreamy — soft contour
  disco:     0.06,   // groove — slight contour
  syro:      0.05,   // IDM — minimal
  ambient:   0.04,   // slow — very subtle,
  plantasia: 0.04,
  trance:    0.03,   // driving — flat dynamics preferred
};
