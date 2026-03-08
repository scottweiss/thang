/**
 * Suspension and anticipation for harmonic interest.
 *
 * Suspensions: Hold a note from the previous chord into the new chord,
 * then resolve it stepwise. Creates tension→release at chord boundaries.
 * Classic examples: sus4→3 (4th resolves to 3rd), sus2→3, 7→8.
 *
 * Anticipations: Sound a note from the upcoming chord early, before
 * the chord actually changes. Creates forward momentum.
 *
 * Both are fundamental to making chord changes feel musical rather
 * than mechanical.
 */

/**
 * Given previous and next chord notes, find potential suspensions.
 * A suspension is a note from the previous chord that is NOT in the
 * new chord, paired with its resolution target (nearest new chord tone).
 *
 * @param prevNotes  Notes of the previous chord (e.g., ['C4', 'E4', 'G4'])
 * @param nextNotes  Notes of the next chord (e.g., ['D4', 'F4', 'A4'])
 * @returns Array of { suspended, resolution } pairs
 */
export function findSuspensions(
  prevNotes: string[],
  nextNotes: string[]
): { suspended: string; resolution: string }[] {
  const prevNames = prevNotes.map(n => n.replace(/\d+$/, ''));
  const nextNames = nextNotes.map(n => n.replace(/\d+$/, ''));

  const suspensions: { suspended: string; resolution: string }[] = [];

  for (let i = 0; i < prevNotes.length; i++) {
    const prevName = prevNames[i];
    // Only suspend notes NOT in the new chord
    if (nextNames.includes(prevName)) continue;

    // Find nearest resolution target in the new chord
    const prevMidi = approximateMidi(prevNotes[i]);
    let nearestNote = nextNotes[0];
    let nearestDist = Math.abs(approximateMidi(nextNotes[0]) - prevMidi);

    for (const nn of nextNotes) {
      const dist = Math.abs(approximateMidi(nn) - prevMidi);
      if (dist < nearestDist && dist > 0) {
        nearestDist = dist;
        nearestNote = nn;
      }
    }

    // Only use stepwise resolutions (1-3 semitones)
    if (nearestDist >= 1 && nearestDist <= 3) {
      suspensions.push({ suspended: prevNotes[i], resolution: nearestNote });
    }
  }

  return suspensions;
}

/**
 * Choose the best suspension from available options.
 * Prefers sus4→3 and sus2→3 (most common and musical).
 */
export function pickBestSuspension(
  suspensions: { suspended: string; resolution: string }[]
): { suspended: string; resolution: string } | null {
  if (suspensions.length === 0) return null;

  // Prefer 2-semitone resolutions (whole step = stronger pull)
  const twoSemitone = suspensions.find(s => {
    const dist = Math.abs(approximateMidi(s.suspended) - approximateMidi(s.resolution));
    return dist === 2;
  });
  if (twoSemitone) return twoSemitone;

  // Otherwise pick the first available
  return suspensions[0];
}

/**
 * Given the current chord notes, find which note could be anticipated
 * (played early) from the next chord. Picks the note in the next chord
 * that is closest to a current chord tone — this creates the smallest
 * and most musical "clash" during the anticipation.
 */
export function findAnticipation(
  currentNotes: string[],
  nextNotes: string[]
): string | null {
  if (nextNotes.length === 0) return null;

  const currentNames = currentNotes.map(n => n.replace(/\d+$/, ''));
  const nextNames = nextNotes.map(n => n.replace(/\d+$/, ''));

  // Find a next-chord note that ISN'T in the current chord
  // (anticipating a common tone isn't interesting)
  const candidates = nextNotes.filter((_, i) => !currentNames.includes(nextNames[i]));

  if (candidates.length === 0) return null;

  // Pick the candidate closest to any current chord tone
  let best = candidates[0];
  let bestDist = Infinity;

  for (const cand of candidates) {
    const candMidi = approximateMidi(cand);
    for (const curr of currentNotes) {
      const dist = Math.abs(approximateMidi(curr) - candMidi);
      if (dist < bestDist) {
        bestDist = dist;
        best = cand;
      }
    }
  }

  return best;
}

/** Quick MIDI approximation from note string (good enough for distance) */
function approximateMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 60;
  const noteValues: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return (parseInt(match[2]) + 1) * 12 + (noteValues[match[1]] ?? 0);
}
