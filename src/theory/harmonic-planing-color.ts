import type { Mood, Section } from '../types';

/**
 * Harmonic planing color — when chords move in parallel motion
 * (same quality, same interval), the "planing" effect creates
 * an impressionistic wash. Apply LPF softening to enhance
 * the dreamlike quality of parallel chord movement.
 */

const planingDepth: Record<Mood, number> = {
  ambient: 0.55,
  downtempo: 0.40,
  lofi: 0.35,
  trance: 0.25,
  avril: 0.45,
  xtal: 0.50,
  syro: 0.20,
  blockhead: 0.10,
  flim: 0.40,
  disco: 0.15,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 1.2,
  build: 0.8,
  peak: 0.7,
  breakdown: 1.3,
  groove: 0.6,
};

/**
 * Detects parallel chord motion (planing).
 * Returns true if previous and current chords share the same quality.
 *
 * @param prevQuality - previous chord quality
 * @param curQuality - current chord quality
 * @returns true if planing detected
 */
export function isPlaningMotion(
  prevQuality: string,
  curQuality: string
): boolean {
  return prevQuality === curQuality && prevQuality !== '';
}

/**
 * Returns an LPF multiplier that softens planing passages.
 *
 * @param prevQuality - previous chord quality
 * @param curQuality - current chord quality
 * @param mood - current mood
 * @param section - current section
 * @returns LPF multiplier in [0.92, 1.0]
 */
export function planingColorLpf(
  prevQuality: string,
  curQuality: string,
  mood: Mood,
  section: Section
): number {
  if (!isPlaningMotion(prevQuality, curQuality)) return 1.0;
  const depth = planingDepth[mood] * sectionMultiplier[section];
  return 1.0 - 0.08 * depth;
}

export function planingDepthValue(mood: Mood): number {
  return planingDepth[mood];
}
