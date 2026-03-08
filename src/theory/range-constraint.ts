/**
 * Range constraint — keep melodies within singable bounds.
 *
 * Great melodies rarely exceed a 10th (octave + 3rd) in range.
 * When a generated phrase exceeds this, the highest or lowest
 * outlier notes should be pulled back toward the center.
 *
 * This creates the feeling that the melody is "sung" by a voice
 * with natural limits, rather than a keyboard with infinite range.
 *
 * Different moods have different range tolerances:
 * - Intimate moods (avril, flim): narrow range (octave)
 * - Energetic moods (trance, disco): wider range (12th)
 * - IDM (syro): widest (no practical limit)
 */

import type { Mood } from '../types';

/**
 * Constrain a melody's range by octave-shifting outlier notes.
 *
 * @param elements   Step array (notes and rests)
 * @param mood       Current mood (determines max range)
 * @param restToken  Rest marker
 * @returns Modified elements with range-constrained notes
 */
export function constrainRange(
  elements: string[],
  mood: Mood,
  restToken: string = '~'
): string[] {
  const maxRange = MOOD_MAX_RANGE[mood];
  if (maxRange >= 24) return elements; // no constraint needed

  // Collect pitches
  const pitches: { idx: number; pitch: number; note: string }[] = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i] === restToken) continue;
    const p = approxPitch(elements[i]);
    if (p >= 0) pitches.push({ idx: i, pitch: p, note: elements[i] });
  }

  if (pitches.length < 3) return elements;

  // Find the median pitch as the center
  const sorted = [...pitches].sort((a, b) => a.pitch - b.pitch);
  const median = sorted[Math.floor(sorted.length / 2)].pitch;
  const halfRange = maxRange / 2;

  const result = [...elements];
  for (const p of pitches) {
    if (p.pitch > median + halfRange) {
      // Too high — shift down an octave
      const shifted = shiftOctave(p.note, -1);
      if (shifted) result[p.idx] = shifted;
    } else if (p.pitch < median - halfRange) {
      // Too low — shift up an octave
      const shifted = shiftOctave(p.note, 1);
      if (shifted) result[p.idx] = shifted;
    }
  }

  return result;
}

/**
 * Whether range constraint should be applied.
 */
export function shouldConstrainRange(mood: Mood): boolean {
  return MOOD_MAX_RANGE[mood] < 20;
}

/**
 * Shift a note by N octaves.
 */
function shiftOctave(note: string, delta: number): string | null {
  const match = note.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return null;
  const newOct = parseInt(match[2]) + delta;
  if (newOct < 1 || newOct > 7) return null;
  return `${match[1]}${newOct}`;
}

function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return -1;
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = base[match[1]] ?? 0;
  const acc = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  return (parseInt(match[3]) + 1) * 12 + letter + acc;
}

/** Max range in semitones per mood */
const MOOD_MAX_RANGE: Record<Mood, number> = {
  avril:     12,   // octave — intimate, vocal
  flim:      12,   // octave — delicate
  ambient:   14,   // octave + M2 — gentle
  lofi:      14,   // octave + M2 — soulful
  downtempo: 15,   // ~10th
  blockhead: 15,   // ~10th
  xtal:      14,   // octave + M2 — dreamy
  disco:     17,   // ~11th — energetic
  trance:    19,   // ~12th — anthemic
  syro:      24,   // 2 octaves — no real limit
};
