import type { Mood } from '../types';

/**
 * Harmonic progression flow — smooth root motion (steps, 3rds) creates
 * a flowing feel (more reverb), while angular motion (4ths, 5ths, tritones)
 * creates a dramatic feel (less reverb, more presence).
 */

const moodFlowSensitivity: Record<Mood, number> = {
  ambient: 0.55,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.25,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.30,
  flim: 0.40,
  disco: 0.20,
};

const noteToPC: Record<string, number> = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};

/**
 * Room multiplier based on root motion smoothness.
 * Smooth motion (1-3 semitones) → more reverb, angular (5-6) → less.
 */
export function progressionFlowRoom(
  prevRoot: string,
  currRoot: string,
  mood: Mood,
): number {
  const pcA = noteToPC[prevRoot] ?? 0;
  const pcB = noteToPC[currRoot] ?? 0;
  const diff = Math.abs(pcA - pcB);
  const dist = Math.min(diff, 12 - diff);
  if (dist === 0) return 1.0;

  const sensitivity = moodFlowSensitivity[mood];
  // Smooth = small distance (1-3), angular = large (5-6)
  const smoothness = dist <= 3 ? 1.0 : dist <= 4 ? 0.5 : 0.0;
  const adjustment = (smoothness - 0.5) * sensitivity * 0.08;
  return Math.max(0.96, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood flow sensitivity for testing */
export function flowSensitivity(mood: Mood): number {
  return moodFlowSensitivity[mood];
}
