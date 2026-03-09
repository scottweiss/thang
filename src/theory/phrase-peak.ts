/**
 * Phrase peak placement — melodic climax follows the golden section.
 *
 * In well-crafted melodies, the highest note doesn't appear randomly.
 * It typically falls around 60-75% through the phrase (the "golden
 * section"), creating a natural arc: approach → climax → resolution.
 *
 * This module adjusts a melody's note sequence to place the peak
 * note near the target position, nudging other notes to create
 * a smooth contour approaching and descending from the peak.
 */

import type { Mood } from '../types';

/**
 * Rearrange notes in a phrase to place the highest note near the
 * target peak position. Non-destructive: only swaps notes, doesn't
 * change which notes are played.
 *
 * @param elements    Step array (notes and '~' rests)
 * @param targetPeak  Fraction 0-1 where the peak should be (default 0.67)
 * @param restToken   Rest marker
 * @returns Modified step array with peak repositioned
 */
export function placePeak(
  elements: string[],
  targetPeak: number = 0.67,
  restToken: string = '~'
): string[] {
  // Find all non-rest note indices
  const noteIndices: number[] = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i] !== restToken) noteIndices.push(i);
  }

  if (noteIndices.length < 3) return [...elements]; // too short to rearrange

  // Find the highest note (by approximate pitch)
  let highestIdx = noteIndices[0];
  let highestPitch = -Infinity;
  for (const idx of noteIndices) {
    const p = approxPitch(elements[idx]);
    if (p > highestPitch) {
      highestPitch = p;
      highestIdx = idx;
    }
  }

  // Where should the peak be?
  const targetNotePosition = Math.floor(noteIndices.length * targetPeak);
  const targetIdx = noteIndices[Math.min(targetNotePosition, noteIndices.length - 1)];

  // If the peak is already near the target, don't modify
  const currentPeakPos = noteIndices.indexOf(highestIdx);
  if (Math.abs(currentPeakPos - targetNotePosition) <= 1) return [...elements];

  // Swap the highest note with whatever is at the target position
  const result = [...elements];
  const temp = result[targetIdx];
  result[targetIdx] = result[highestIdx];
  result[highestIdx] = temp;

  return result;
}

/**
 * Get the preferred peak position for a mood.
 * More structured moods peak later (suspense); ambient peaks earlier.
 */
export function moodPeakPosition(mood: Mood): number {
  return MOOD_PEAK_POSITION[mood];
}

/**
 * Whether to apply peak placement for a mood.
 * Some moods benefit more from structured phrasing.
 */
export function shouldPlacePeak(mood: Mood): boolean {
  return MOOD_PEAK_PROBABILITY[mood] > Math.random();
}

const MOOD_PEAK_POSITION: Record<Mood, number> = {
  ambient:   0.5,    // early peak, then drift
  downtempo: 0.6,    // moderate
  lofi:      0.65,   // classic golden section
  trance:    0.75,   // late peak (builds suspense)
  avril:     0.6,    // gentle arc
  xtal:      0.55,   // early-ish, dreamy
  syro:      0.5,    // less structured
  blockhead: 0.7,    // late hit
  flim:      0.6,    // moderate
  disco:     0.7,    // late peak energy
};

const MOOD_PEAK_PROBABILITY: Record<Mood, number> = {
  ambient:   0.4,    // gentle — peak adds direction even in drifting melodies
  downtempo: 0.6,    // moderate-high
  lofi:      0.75,   // frequent — jazzy phrasing needs clear climax
  trance:    0.55,   // moderate — melodic trance benefits from arc
  avril:     0.8,    // high — lyrical phrasing demands peak placement
  xtal:      0.45,   // moderate — dreamy but structured
  syro:      0.3,    // low — chaotic is the point
  blockhead: 0.6,    // moderate-high — hip-hop melody contour
  flim:      0.6,    // moderate-high
  disco:     0.55,   // moderate
};

/**
 * Approximate pitch from a note string for comparison.
 * Returns a number where higher = higher pitch.
 */
function approxPitch(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return 0;

  const base: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  const letter = base[match[1]] ?? 0;
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const octave = parseInt(match[3]);

  return octave * 12 + letter + accidental;
}
