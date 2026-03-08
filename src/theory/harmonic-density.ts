/**
 * Harmonic density — varying the number of notes in a chord based on
 * section and tension.
 *
 * Breakdowns use simple triads (3 notes) for openness. Peaks add
 * extensions (9ths, 11ths — up to 5 notes) for richness. This creates
 * a harmonic "bloom" effect as energy builds through a track.
 */

import type { Section } from '../types';

/**
 * Determine the ideal number of chord tones for a given section and tension.
 *
 * - Breakdown: 3 (open triads)
 * - Intro: 3 (simple, establishing)
 * - Build: 3 + Math.round(tension) — grows from 3 to 4
 * - Peak: 4 + (tension > 0.7 ? 1 : 0) — 4 or 5 notes
 * - Groove: 4 (seventh chords, standard)
 *
 * Result is always clamped to [3, 5].
 */
export function targetChordSize(section: Section, tension: number): number {
  let size: number;

  switch (section) {
    case 'breakdown':
      size = 3;
      break;
    case 'intro':
      size = 3;
      break;
    case 'build':
      size = 3 + Math.round(tension);
      break;
    case 'peak':
      size = 4 + (tension > 0.7 ? 1 : 0);
      break;
    case 'groove':
      size = 4;
      break;
    default:
      size = 3;
  }

  return Math.max(3, Math.min(5, size));
}

/**
 * Add chord extensions from the scale to reach the target voicing size.
 *
 * Extensions are chosen by scale-degree distance from the root:
 *   - First extension: 9th (2 scale steps above root)
 *   - Second extension: 11th (4 scale steps above root)
 *
 * Added notes are placed in the octave above the highest existing note.
 */
export function addChordExtension(
  notes: string[],
  scaleNotes: string[],
  targetSize: number
): string[] {
  if (notes.length >= targetSize) return notes;

  const result = [...notes];

  // Extract note name from the root (first note)
  const rootName = result[0].replace(/\d+$/, '');

  // Find root position in scale
  const rootIndex = scaleNotes.indexOf(rootName);
  if (rootIndex === -1) return notes;

  // Find the highest octave among existing notes
  const highestOctave = Math.max(
    ...result.map((n) => parseInt(n.match(/\d+$/)?.[0] ?? '3'))
  );
  const extensionOctave = highestOctave + 1;

  // Extensions by scale-step offset from root
  const extensionOffsets = [2, 4]; // 9th, 11th

  for (const offset of extensionOffsets) {
    if (result.length >= targetSize) break;
    const scaleIdx = (rootIndex + offset) % scaleNotes.length;
    const extName = scaleNotes[scaleIdx];
    result.push(`${extName}${extensionOctave}`);
  }

  return result;
}

/**
 * Remove extensions (highest notes) to reduce a chord to the target size.
 *
 * Always preserves the root and the next two notes (basic triad).
 * Removes from the end of the sorted array — highest notes are extensions.
 */
export function simplifyChord(notes: string[], targetSize: number): string[] {
  if (notes.length <= targetSize) return notes;

  // Keep at least 3 notes (root + triad)
  const keep = Math.max(3, targetSize);
  return notes.slice(0, keep);
}

/**
 * Convenience function: adjust chord density for the current section/tension.
 *
 * Adds extensions when the chord is too sparse, or simplifies when
 * it has too many notes for the current energy level.
 */
export function adjustChordDensity(
  notes: string[],
  scaleNotes: string[],
  section: Section,
  tension: number
): string[] {
  const target = targetChordSize(section, tension);

  if (notes.length < target) {
    return addChordExtension(notes, scaleNotes, target);
  }
  if (notes.length > target) {
    return simplifyChord(notes, target);
  }
  return notes;
}
