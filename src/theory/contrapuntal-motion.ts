/**
 * Contrapuntal motion — coordinating melodic direction between layers.
 *
 * Classical counterpoint identifies four types of motion between voices:
 * - **Contrary**: voices move in opposite directions (most independent)
 * - **Parallel**: voices move in the same direction (most unified)
 * - **Oblique**: one voice stays still, the other moves
 * - **Similar**: voices move in the same direction but by different intervals
 *
 * When the melody ascends, the arp descending creates contrary motion —
 * the most satisfying and clear texture. When both ascend together,
 * the parallel motion creates a sense of unity and power.
 *
 * Different moods prefer different balance:
 * - Ambient/avril: oblique (one voice static, other moves gently)
 * - Trance/disco: parallel (voices unify for energy)
 * - Syro/blockhead: contrary (maximum independence, polyphonic texture)
 * - Downtempo/lofi: mixed (conversational balance)
 */

import type { Mood, Section } from '../types';

export type MotionDirection = 'ascending' | 'descending' | 'static';
export type MotionType = 'contrary' | 'parallel' | 'oblique' | 'similar';

/**
 * Detect the overall direction of a note sequence.
 * Compares the average pitch position of the first half vs second half.
 *
 * @param notes  Array of note names with octave (e.g., ['C4', 'E4', 'G4'])
 * @returns The detected direction
 */
export function detectDirection(notes: string[]): MotionDirection {
  const pitches = notes
    .filter(n => n !== '~' && n.match(/[A-G]/))
    .map(noteToMidi);

  if (pitches.length < 2) return 'static';

  const mid = Math.floor(pitches.length / 2);
  const firstHalf = pitches.slice(0, mid);
  const secondHalf = pitches.slice(mid);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;
  if (diff > 1.5) return 'ascending';
  if (diff < -1.5) return 'descending';
  return 'static';
}

/**
 * Given the melody's direction, suggest a preferred direction for
 * the complementary layer (arp) based on mood.
 *
 * @param melodyDirection  The melody's current motion direction
 * @param mood             Current mood
 * @param section          Current section
 * @returns Preferred direction for the arp/complementary layer
 */
export function suggestCounterDirection(
  melodyDirection: MotionDirection,
  mood: Mood,
  section: Section
): MotionDirection {
  const preferredMotion = getPreferredMotion(mood, section);

  switch (preferredMotion) {
    case 'contrary':
      // Move opposite to melody
      if (melodyDirection === 'ascending') return 'descending';
      if (melodyDirection === 'descending') return 'ascending';
      return 'static';

    case 'parallel':
      // Move same direction as melody
      return melodyDirection;

    case 'oblique':
      // Stay relatively still
      return 'static';

    case 'similar':
      // Same direction but can differ — default to melody's direction
      // with some probability of static
      return melodyDirection === 'static' ? 'ascending' : melodyDirection;
  }
}

/**
 * Determine the preferred contrapuntal motion type for a mood/section.
 */
export function getPreferredMotion(mood: Mood, section: Section): MotionType {
  // Section influences: peaks favor parallel (unity/power),
  // breakdowns favor oblique (space), builds favor contrary (tension)
  const sectionBias: Record<Section, MotionType> = {
    intro: 'oblique',
    build: 'contrary',
    peak: 'parallel',
    breakdown: 'oblique',
    groove: 'similar',
  };

  // Mood overrides for strong preferences
  const moodOverrides: Partial<Record<Mood, MotionType>> = {
    ambient: 'oblique',
    avril: 'oblique',
    trance: 'parallel',
    disco: 'parallel',
    syro: 'contrary',
    blockhead: 'contrary',
  };

  // Mood override takes priority, otherwise use section default
  return moodOverrides[mood] ?? sectionBias[section] ?? 'similar';
}

/**
 * Given a set of chord notes and a preferred direction, reorder them
 * to create the desired melodic motion.
 *
 * @param notes      Available chord notes (e.g., ['C4', 'E4', 'G4', 'C5'])
 * @param direction  Preferred direction
 * @returns Reordered notes favoring the given direction
 */
export function orderByDirection(
  notes: string[],
  direction: MotionDirection
): string[] {
  if (notes.length <= 1) return notes;

  const sorted = [...notes].sort((a, b) => noteToMidi(a) - noteToMidi(b));

  switch (direction) {
    case 'ascending':
      return sorted;
    case 'descending':
      return sorted.reverse();
    case 'static':
      // Alternate high and low for minimal overall motion
      return interleave(sorted);
  }
}

/**
 * Interleave notes from bottom and top — creates minimal motion.
 * [C3, E3, G3, C4] → [C3, C4, E3, G3]
 */
function interleave(sorted: string[]): string[] {
  const result: string[] = [];
  let lo = 0;
  let hi = sorted.length - 1;
  let fromLow = true;
  while (lo <= hi) {
    result.push(sorted[fromLow ? lo++ : hi--]);
    fromLow = !fromLow;
  }
  return result;
}

/**
 * Convert a note name to approximate MIDI number.
 * Handles sharps and flats. Returns 60 (middle C) as fallback.
 */
function noteToMidi(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d)$/);
  if (!match) return 60;

  const [, letter, accidental, octStr] = match;
  const octave = parseInt(octStr);

  const letterMap: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };

  let midi = (octave + 1) * 12 + (letterMap[letter] ?? 0);
  if (accidental === '#') midi++;
  if (accidental === 'b') midi--;

  return midi;
}
