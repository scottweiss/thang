import type { Mood } from '../types';

/**
 * Melodic resolution weight — notes that resolve to chord tones get
 * a gain emphasis, while passing tones are slightly softer.
 * Creates the perception of harmonic "arrival" when melody lands on chord tones.
 */

const moodWeight: Record<Mood, number> = {
  ambient: 0.30,
  plantasia: 0.30,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.55,
  avril: 0.60,
  xtal: 0.35,
  syro: 0.15,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.45,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/**
 * Check if a note is a chord tone (within the chord's pitch classes).
 */
function isChordTone(note: string, chordNotes: string[]): boolean {
  const pc = noteToPC[note.replace(/[0-9]/g, '')] ?? -1;
  return chordNotes.some(cn => {
    const cpc = noteToPC[cn.replace(/[0-9]/g, '')] ?? -2;
    return pc === cpc;
  });
}

/**
 * Gain multiplier based on whether the melody note is a chord tone.
 * Chord tones → slight boost, non-chord tones → slight reduction.
 */
export function resolutionWeightGain(
  melodyNote: string,
  chordNotes: string[],
  mood: Mood,
): number {
  const weight = moodWeight[mood];
  const onChord = isChordTone(melodyNote, chordNotes);
  const adjustment = onChord ? weight * 0.04 : -weight * 0.02;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood weight for testing */
export function resolutionStrength(mood: Mood): number {
  return moodWeight[mood];
}
