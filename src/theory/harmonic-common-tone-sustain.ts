import type { Mood } from '../types';

/**
 * Harmonic common tone sustain — when consecutive chords share common
 * tones, those shared notes get decay extension for smooth voice leading.
 * More common tones → smoother transition → longer sustain.
 */

const moodSustainBonus: Record<Mood, number> = {
  ambient: 0.60,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.25,
  flim: 0.40,
  disco: 0.30,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/** Count common pitch classes between two note arrays */
function commonToneCount(notesA: string[], notesB: string[]): number {
  const pcsA = new Set(notesA.map(n => noteToPC[n.replace(/[0-9]/g, '')] ?? -1));
  const pcsB = new Set(notesB.map(n => noteToPC[n.replace(/[0-9]/g, '')] ?? -2));
  let count = 0;
  for (const pc of pcsA) {
    if (pcsB.has(pc)) count++;
  }
  return count;
}

/**
 * Decay multiplier based on common tone count.
 * More common tones → longer decay (> 1.0).
 */
export function commonToneDecay(
  prevChordNotes: string[],
  currChordNotes: string[],
  mood: Mood,
): number {
  const common = commonToneCount(prevChordNotes, currChordNotes);
  const bonus = moodSustainBonus[mood];
  const extension = (common / 3) * bonus * 0.08;
  return Math.min(1.06, 1.0 + extension);
}

/** Per-mood sustain bonus for testing */
export function sustainBonus(mood: Mood): number {
  return moodSustainBonus[mood];
}
