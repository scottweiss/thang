import type { Mood } from '../types';

/**
 * Harmonic bass weight — when the drone/bass note matches the chord root,
 * it gets a foundation emphasis (gain boost). Non-root bass notes
 * get slightly less weight to maintain harmonic clarity.
 */

const moodWeight: Record<Mood, number> = {
  ambient: 0.35,
  downtempo: 0.45,
  lofi: 0.50,
  trance: 0.55,
  avril: 0.40,
  xtal: 0.30,
  syro: 0.20,
  blockhead: 0.60,
  flim: 0.35,
  disco: 0.50,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/**
 * Gain multiplier for bass/drone layer based on root alignment.
 * bassNote: the bass note being played
 * chordRoot: the current chord's root
 * On-root → boost, off-root → slight reduction.
 */
export function bassWeightGain(
  bassNote: string,
  chordRoot: string,
  mood: Mood,
): number {
  const bassPC = noteToPC[bassNote.replace(/[0-9]/g, '')] ?? -1;
  const rootPC = noteToPC[chordRoot.replace(/[0-9]/g, '')] ?? -2;
  const weight = moodWeight[mood];
  const onRoot = bassPC === rootPC;
  const adjustment = onRoot ? weight * 0.04 : -weight * 0.02;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood weight for testing */
export function bassFoundationWeight(mood: Mood): number {
  return moodWeight[mood];
}
