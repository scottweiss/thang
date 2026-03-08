/**
 * Melodic dynamics — per-note velocity variation.
 *
 * In expressive performance, melody notes aren't all the same volume:
 * - Notes on strong beats are louder (metric accent)
 * - Phrase peaks (highest notes) get emphasis (contour accent)
 * - Approach notes (leading to chord tones) are softer (harmonic shaping)
 * - Phrase endings taper off (diminuendo)
 *
 * This module generates a velocity curve for a melody pattern that
 * combines these musical intuitions into natural-sounding dynamics.
 */

/**
 * Generate per-note velocity multipliers for a melody pattern.
 *
 * @param notes       Array of note strings ('~' = rest)
 * @param restValue   What counts as a rest
 * @param beatsPerBar Steps per beat (4 for 16th notes)
 * @returns Array of velocity multipliers (0.4–1.0) same length as notes
 */
export function melodicVelocityCurve(
  notes: string[],
  restValue: string = '~',
  beatsPerBar: number = 4
): number[] {
  const len = notes.length;
  if (len === 0) return [];

  const velocities = new Array(len).fill(0.7); // base

  // 1. Metric accent: downbeats louder, off-beats softer
  for (let i = 0; i < len; i++) {
    if (notes[i] === restValue) continue;
    if (i % beatsPerBar === 0) {
      velocities[i] += 0.15; // downbeat
    } else if (i % beatsPerBar === 2 && beatsPerBar >= 4) {
      velocities[i] += 0.05; // backbeat (weaker accent)
    } else {
      velocities[i] -= 0.05; // off-beats
    }
  }

  // 2. Contour accent: highest note in each phrase gets a boost
  //    Find phrases (groups of non-rest notes)
  const phrases = findPhrases(notes, restValue);
  for (const phrase of phrases) {
    if (phrase.length < 2) continue;

    // Find the peak (this is crude — we'd need MIDI values for perfect accuracy,
    // but we can use the octave digit as a proxy)
    let peakIdx = phrase[0];
    let peakHeight = noteHeight(notes[phrase[0]]);
    for (const idx of phrase) {
      const h = noteHeight(notes[idx]);
      if (h > peakHeight) {
        peakHeight = h;
        peakIdx = idx;
      }
    }
    velocities[peakIdx] += 0.1; // contour peak accent

    // Taper the phrase ending
    if (phrase.length >= 3) {
      velocities[phrase[phrase.length - 1]] -= 0.08;
    }
  }

  // 3. Clamp to musical range
  for (let i = 0; i < len; i++) {
    velocities[i] = Math.max(0.4, Math.min(1.0, velocities[i]));
  }

  return velocities;
}

/**
 * Apply velocity curve to a base gain, returning Strudel-compatible
 * space-separated gain values.
 */
export function applyMelodicDynamics(
  baseGain: number,
  notes: string[],
  restValue: string = '~'
): string {
  const curve = melodicVelocityCurve(notes, restValue);
  return curve.map(v => (baseGain * v).toFixed(4)).join(' ');
}

/** Find contiguous groups of non-rest notes (phrase boundaries). */
function findPhrases(notes: string[], restValue: string): number[][] {
  const phrases: number[][] = [];
  let current: number[] = [];

  for (let i = 0; i < notes.length; i++) {
    if (notes[i] !== restValue) {
      current.push(i);
    } else if (current.length > 0) {
      phrases.push(current);
      current = [];
    }
  }
  if (current.length > 0) phrases.push(current);
  return phrases;
}

/** Approximate pitch height from a note string like 'C#5'. */
function noteHeight(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return 60;
  const names: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
  };
  return parseInt(match[2]) * 12 + (names[match[1]] ?? 0);
}
