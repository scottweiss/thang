import type { Mood, Section } from '../types';

/**
 * Rhythmic accent variety — prevents accent patterns from becoming
 * monotonous by tracking recent accent positions and boosting
 * underused positions.
 */

const moodVarietyDrive: Record<Mood, number> = {
  ambient: 0.20,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.15,
  avril: 0.40,
  xtal: 0.45,
  syro: 0.55,
  blockhead: 0.40,
  flim: 0.45,
  disco: 0.20,
};

/**
 * Gain multiplier for accent variety.
 * currentBeat: 0-15 grid position
 * recentAccents: array of recent accent positions (0-15)
 * Underaccented positions get boost, overaccented get reduction.
 */
export function accentVarietyGain(
  currentBeat: number,
  recentAccents: number[],
  mood: Mood,
): number {
  if (recentAccents.length < 4) return 1.0;
  const drive = moodVarietyDrive[mood];
  const beatNorm = currentBeat % 16;
  const count = recentAccents.filter(a => a % 16 === beatNorm).length;
  const frequency = count / recentAccents.length;
  // Expected frequency for uniform distribution: 1/16 ≈ 0.0625
  const deviation = (0.0625 - frequency) * 8; // positive = underused
  const adjustment = deviation * drive * 0.05;
  return Math.max(0.97, Math.min(1.04, 1.0 + adjustment));
}

/** Per-mood variety drive for testing */
export function varietyDrive(mood: Mood): number {
  return moodVarietyDrive[mood];
}
