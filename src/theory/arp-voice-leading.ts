/**
 * Arp voice leading — smooth note transitions across chord changes.
 *
 * When an arp pattern changes chords, jumping to the nearest voicing
 * of the new chord creates audible smoothness. Instead of always
 * starting from the root, find the chord tone in the new chord that's
 * closest to the last note of the previous pattern.
 *
 * This module reorders arp note pools so the starting note minimizes
 * pitch distance from a reference note (typically the last played note).
 */

/**
 * Reorder notes so the nearest note to `reference` comes first,
 * then continue in the original directional order from there.
 *
 * @param notes      Available notes with octave (e.g., ["C3", "E3", "G3", "C4"])
 * @param reference  The last played note (e.g., "F3")
 * @returns Reordered notes starting from nearest to reference
 */
export function smoothArpStart(
  notes: string[],
  reference: string | null
): string[] {
  if (!reference || notes.length <= 1) return notes;

  const refPitch = noteToPitchApprox(reference);
  if (refPitch < 0) return notes;

  // Find the note closest in pitch to the reference
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < notes.length; i++) {
    const pitch = noteToPitchApprox(notes[i]);
    if (pitch < 0) continue;
    const dist = Math.abs(pitch - refPitch);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  // Rotate the array so the closest note is first
  return [...notes.slice(bestIdx), ...notes.slice(0, bestIdx)];
}

/**
 * Filter a note pool to prefer notes within a semitone range of a reference,
 * keeping at least `minNotes` results.
 *
 * @param notes       Full note pool
 * @param reference   Reference note
 * @param rangeSemi   Maximum semitone distance to include
 * @param minNotes    Minimum notes to return (falls back to closest N)
 */
export function nearbyNotes(
  notes: string[],
  reference: string | null,
  rangeSemi: number = 7,
  minNotes: number = 3
): string[] {
  if (!reference || notes.length <= minNotes) return notes;

  const refPitch = noteToPitchApprox(reference);
  if (refPitch < 0) return notes;

  // Score each note by distance
  const scored = notes.map((n, i) => ({
    note: n,
    dist: Math.abs(noteToPitchApprox(n) - refPitch),
    idx: i,
  }));

  // Filter by range
  const nearby = scored.filter(s => s.dist <= rangeSemi);
  if (nearby.length >= minNotes) {
    return nearby.map(s => s.note);
  }

  // Fall back to closest N notes
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, minNotes).sort((a, b) => a.idx - b.idx).map(s => s.note);
}

/**
 * Approximate MIDI pitch from a note string like "C3", "Eb4", "F#2".
 * Returns -1 if unparseable.
 */
function noteToPitchApprox(note: string): number {
  const match = note.match(/^([A-G])([b#]?)(\d+)$/);
  if (!match) return -1;

  const base: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };
  const letter = base[match[1]];
  if (letter === undefined) return -1;

  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const octave = parseInt(match[3]);

  return (octave + 1) * 12 + letter + accidental;
}
