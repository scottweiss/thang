import type { Mood, Section } from '../types';

/**
 * Harmonic retrograde motion — when chord progressions reverse
 * direction (e.g., I-IV-V then V-IV-I), the retrograde creates
 * a satisfying palindromic symmetry. Apply a subtle gain boost
 * to highlight the mirrored motion.
 */

const retrogradeDepth: Record<Mood, number> = {
  ambient: 0.35,
  downtempo: 0.30,
  lofi: 0.25,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.45,
  syro: 0.20,
  blockhead: 0.15,
  flim: 0.40,
  disco: 0.25,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.6,
  build: 0.9,
  peak: 1.0,
  breakdown: 1.3,
  groove: 0.8,
};

/**
 * Detects retrograde motion by comparing recent root motion
 * direction with earlier root motion.
 *
 * @param recentMotion - signed semitone motion of last chord change
 * @param priorMotion - signed semitone motion of chord change before that
 * @returns true if retrograde (opposite direction, similar magnitude)
 */
export function isRetrogradeMotion(
  recentMotion: number,
  priorMotion: number
): boolean {
  if (recentMotion === 0 || priorMotion === 0) return false;
  // Must be opposite direction
  if (Math.sign(recentMotion) === Math.sign(priorMotion)) return false;
  // Similar magnitude (within 2 semitones)
  return Math.abs(Math.abs(recentMotion) - Math.abs(priorMotion)) <= 2;
}

/**
 * Returns a gain multiplier for retrograde harmonic motion.
 *
 * @param recentMotion - recent root motion (signed semitones)
 * @param priorMotion - prior root motion (signed semitones)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function retrogradeMotionGain(
  recentMotion: number,
  priorMotion: number,
  mood: Mood,
  section: Section
): number {
  if (!isRetrogradeMotion(recentMotion, priorMotion)) return 1.0;
  const depth = retrogradeDepth[mood] * sectionMultiplier[section];
  // Exact mirror gets full boost; approximate gets partial
  const exactness = 1.0 - Math.abs(Math.abs(recentMotion) - Math.abs(priorMotion)) / 2;
  return 1.0 + 0.03 * depth * exactness;
}

export function retrogradeDepthValue(mood: Mood): number {
  return retrogradeDepth[mood];
}
