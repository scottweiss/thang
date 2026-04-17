import type { Mood } from '../types';

/**
 * Interval tension envelope — large melodic intervals get sharper attacks
 * (more percussive), small intervals get softer attacks (more legato).
 * Models how performers naturally accent leaps and smooth steps.
 */

const moodResponsiveness: Record<Mood, number> = {
  ambient: 0.20,
  plantasia: 0.20,
  downtempo: 0.35,
  lofi: 0.40,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.35,
  syro: 0.25,
  blockhead: 0.50,
  flim: 0.40,
  disco: 0.30,
};

/**
 * Attack multiplier based on interval size.
 * intervalSemitones: absolute interval in semitones (0-12+)
 * Small intervals (1-2) → longer attack (softer), large (7+) → shorter attack (crisper)
 * Returns 0.85-1.15 multiplier on attack time.
 */
export function intervalAttackMultiplier(
  intervalSemitones: number,
  mood: Mood,
): number {
  const resp = moodResponsiveness[mood];
  const absInt = Math.abs(intervalSemitones);
  // Center at 4 semitones (major 3rd)
  const deviation = (absInt - 4) / 4; // roughly -1 to 2+
  const clamped = Math.max(-1, Math.min(1, deviation));
  // Large interval → shorter attack (multiply < 1), small → longer (> 1)
  const adjustment = -clamped * resp * 0.15;
  return Math.max(0.85, Math.min(1.15, 1.0 + adjustment));
}

/** Per-mood responsiveness for testing */
export function attackResponsiveness(mood: Mood): number {
  return moodResponsiveness[mood];
}
