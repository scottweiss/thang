/**
 * Guide tone lines — smooth voice connections between chord tones.
 *
 * In jazz and sophisticated harmony, the 3rd and 7th of each chord
 * are the most important tones (they define the chord quality).
 * A "guide tone line" connects these important tones smoothly from
 * chord to chord, creating a hidden inner melody that gives the
 * harmony direction and coherence.
 *
 * Classic example: Dm7 → G7 → Cmaj7
 *   3rds: F → F → E  (F stays, then resolves down to E)
 *   7ths: C → B → B  (C resolves down to B, then stays)
 *
 * The smoothest guide tone lines move by step or stay the same.
 */

const NOTE_VALUES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

function noteToMidi(note: string): number {
  const match = note.match(/^([A-Gb#]+)(\d)$/);
  if (!match) return 60;
  return (parseInt(match[2]) + 1) * 12 + (NOTE_VALUES[match[1]] ?? 0);
}

function midiToNote(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const oct = Math.floor(midi / 12) - 1;
  const name = names[midi % 12];
  return `${name}${oct}`;
}

/**
 * Find the nearest note in `targets` to `source` (by semitone distance).
 * Prefers stepwise motion (1-2 semitones) and common tones (0 semitones).
 */
function findNearestTone(sourceMidi: number, targets: number[]): number {
  if (targets.length === 0) return sourceMidi;
  let nearest = targets[0];
  let nearestDist = Math.abs(targets[0] - sourceMidi);
  for (const t of targets) {
    const d = Math.abs(t - sourceMidi);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = t;
    }
  }
  return nearest;
}

/**
 * Generate a guide tone line between two chords.
 *
 * Given the current chord notes and next chord notes, find smooth
 * voice-leading connections for the inner voices (not root, not top).
 *
 * @param currentNotes  Current chord notes with octave (e.g., ['C3', 'E3', 'G3', 'B3'])
 * @param nextNotes     Next chord notes with octave
 * @returns 1-2 guide tones that connect smoothly between chords
 */
export function findGuideTones(
  currentNotes: string[],
  nextNotes: string[]
): { current: string; next: string }[] {
  if (currentNotes.length < 2 || nextNotes.length < 2) return [];

  const currentMidi = currentNotes.map(noteToMidi);
  const nextMidi = nextNotes.map(noteToMidi);

  // Skip root (lowest) and sometimes top — focus on inner voices
  const innerCurrent = currentMidi.slice(1);
  const guides: { current: string; next: string }[] = [];

  for (const curr of innerCurrent) {
    const nearest = findNearestTone(curr, nextMidi);
    const distance = Math.abs(nearest - curr);
    // Only include if motion is smooth (≤3 semitones) or common tone
    if (distance <= 3) {
      guides.push({
        current: midiToNote(curr),
        next: midiToNote(nearest),
      });
    }
  }

  // Return at most 2 guide tones (3rd and 7th connections)
  return guides.slice(0, 2);
}

/**
 * Generate a passing tone between two guide tones.
 * If the guide tones are a whole step apart (2 semitones),
 * insert the chromatic passing tone between them.
 *
 * @returns The passing tone note string, or null if no good passing tone exists
 */
export function guideTonePassingNote(
  fromNote: string,
  toNote: string
): string | null {
  const fromMidi = noteToMidi(fromNote);
  const toMidi = noteToMidi(toNote);
  const distance = toMidi - fromMidi;

  // Whole step: insert chromatic passing tone
  if (Math.abs(distance) === 2) {
    return midiToNote(fromMidi + Math.sign(distance));
  }

  return null;
}
