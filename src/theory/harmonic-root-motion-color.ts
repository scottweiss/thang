import type { Mood } from '../types';

/**
 * Harmonic root motion color — the interval of root movement between
 * consecutive chords influences FM character.
 * Step motion (2nds) = warm/smooth, thirds = moderate, leaps (4ths/5ths) = bright,
 * tritone = most colorful. Models how root motion distance affects harmonic tension.
 */

const moodSensitivity: Record<Mood, number> = {
  ambient: 0.45,
  plantasia: 0.45,
  downtempo: 0.35,
  lofi: 0.50,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.25,
  blockhead: 0.35,
  flim: 0.40,
  disco: 0.20,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/** Semitone distance between two roots */
function rootDistance(a: string, b: string): number {
  const pcA = noteToPC[a] ?? 0;
  const pcB = noteToPC[b] ?? 0;
  const diff = Math.abs(pcA - pcB);
  return Math.min(diff, 12 - diff);
}

/**
 * FM multiplier based on root motion interval.
 * Steps (1-2 semitones) → warm (slight FM reduction)
 * Leaps (5-7 semitones) → bright (slight FM boost)
 */
export function rootMotionFm(
  prevRoot: string,
  currRoot: string,
  mood: Mood,
): number {
  const dist = rootDistance(prevRoot, currRoot);
  if (dist === 0) return 1.0; // no motion
  const sensitivity = moodSensitivity[mood];
  // Map distance: small=warm(-), large=bright(+)
  const normalized = (dist - 3.5) / 3.5; // roughly -1 to 1
  const adjustment = normalized * sensitivity * 0.06;
  return Math.max(0.94, Math.min(1.06, 1.0 + adjustment));
}

/** Per-mood sensitivity for testing */
export function motionColorSensitivity(mood: Mood): number {
  return moodSensitivity[mood];
}
