import type { Mood } from '../types';

/**
 * Chord tone gravity — chord tones exert gravitational pull on melody,
 * weighted by voice function. Root has strongest pull, then fifth, then third.
 * Non-chord tones passing near chord tones get gain emphasis from proximity.
 */

const moodGravity: Record<Mood, number> = {
  ambient: 0.30,
  plantasia: 0.30,
  downtempo: 0.40,
  lofi: 0.50,
  trance: 0.60,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.15,
  blockhead: 0.40,
  flim: 0.35,
  disco: 0.50,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/** Minimum semitone distance from note to any chord tone */
function minChordDistance(note: string, chordNotes: string[]): number {
  const pc = noteToPC[note.replace(/[0-9]/g, '')] ?? 0;
  let minDist = 12;
  for (const cn of chordNotes) {
    const cpc = noteToPC[cn.replace(/[0-9]/g, '')] ?? 0;
    const diff = Math.abs(pc - cpc);
    minDist = Math.min(minDist, Math.min(diff, 12 - diff));
  }
  return minDist;
}

/**
 * Gain multiplier from chord tone proximity.
 * On chord tone (dist=0) → boost, far from chord tones → slight reduction.
 */
export function chordToneGravityGain(
  melodyNote: string,
  chordNotes: string[],
  mood: Mood,
): number {
  const gravity = moodGravity[mood];
  const dist = minChordDistance(melodyNote, chordNotes);
  // dist 0 → max boost, dist 6 → max reduction
  const normalized = 1.0 - dist / 6;
  const adjustment = (normalized - 0.3) * gravity * 0.06;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood gravity strength for testing */
export function gravityStrength(mood: Mood): number {
  return moodGravity[mood];
}
