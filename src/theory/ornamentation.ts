/**
 * Melodic ornamentation — decorative notes that add detail.
 *
 * In real performance, melodies are rarely played exactly as written.
 * Performers add:
 * - Approach notes: step into target from below or above
 * - Neighbor tones: briefly touch adjacent note and return
 * - Passing tones: fill in gaps between chord tones
 *
 * This module adds subtle ornaments to melody patterns,
 * controlled by tension (more ornaments at higher tension)
 * and mood (some moods want clean lines, others want embellishment).
 */

import type { Mood } from '../types';

/**
 * How much ornamentation each mood wants.
 * 0 = none, 1 = heavy embellishment.
 */
const MOOD_ORNAMENT_AMOUNT: Record<Mood, number> = {
  ambient: 0.0,     // clean, spacious
  downtempo: 0.15,  // subtle
  lofi: 0.2,        // jazzy embellishment
  trance: 0.05,     // mostly clean
  avril: 0.1,       // gentle touches
  xtal: 0.05,       // sparse, deliberate
  syro: 0.3,        // detailed ornamentation
  blockhead: 0.25,  // jazzy, ornate
  flim: 0.1,        // delicate
  disco: 0.15,      // funky grace notes
};

/**
 * Add ornamental notes to a melody pattern.
 * Ornaments replace rests before active notes with approach tones.
 *
 * @param elements   Note pattern array ('~' = rest, else = note string)
 * @param ladder     Available pitch ladder (sorted low to high)
 * @param mood       Current mood
 * @param tension    Current tension (0-1) — higher = more ornaments
 * @returns Modified pattern with ornaments added
 */
export function addOrnaments(
  elements: string[],
  ladder: string[],
  mood: Mood,
  tension: number
): string[] {
  const amount = MOOD_ORNAMENT_AMOUNT[mood] ?? 0.1;
  if (amount === 0) return elements;

  // Scale probability with both mood amount and tension
  const probability = amount * (0.5 + tension * 0.5);
  const result = [...elements];

  for (let i = 1; i < result.length; i++) {
    if (result[i] === '~') continue;         // skip rests
    if (result[i - 1] !== '~') continue;     // need a rest before the note
    if (Math.random() >= probability) continue;

    // Find this note in the ladder
    const noteIdx = ladder.indexOf(result[i]);
    if (noteIdx < 0) continue;

    // Add an approach note from step below or above
    const direction = Math.random() < 0.6 ? -1 : 1; // favor approach from below
    const approachIdx = noteIdx + direction;
    if (approachIdx >= 0 && approachIdx < ladder.length) {
      result[i - 1] = ladder[approachIdx];
    }
  }

  return result;
}

/**
 * Get the ornamentation amount for a mood.
 */
export function getOrnamentAmount(mood: Mood): number {
  return MOOD_ORNAMENT_AMOUNT[mood] ?? 0.1;
}
