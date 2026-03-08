import type { Mood, Section } from '../types';

/**
 * Harmonic modal mixture color — when a chord borrows from the
 * parallel minor/major (e.g., bVI or bIII in a major key),
 * apply LPF darkening to reflect the "borrowed" color.
 * Borrowed chords from minor sound darker; from major, brighter.
 */

const mixtureDepth: Record<Mood, number> = {
  ambient: 0.50,
  downtempo: 0.40,
  lofi: 0.45,
  trance: 0.30,
  avril: 0.55,
  xtal: 0.40,
  syro: 0.25,
  blockhead: 0.20,
  flim: 0.45,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.7,
  build: 1.0,
  peak: 1.1,
  breakdown: 1.3,
  groove: 0.8,
};

/**
 * Detects if a chord degree is likely borrowed from the parallel mode.
 * In major: bIII (3), bVI (6), bVII (7) with minor quality
 * are common borrowed chords.
 *
 * @param degree - chord degree (1-7)
 * @param quality - chord quality string
 * @returns true if likely borrowed
 */
export function isBorrowedChord(
  degree: number,
  quality: string
): boolean {
  // bVI and bVII in major (would normally be vi and vii°)
  if ((degree === 6 || degree === 7) && quality === 'maj') return true;
  // bIII in major (would normally be iii)
  if (degree === 3 && quality === 'maj') return true;
  // iv in major (would normally be IV)
  if (degree === 4 && quality === 'min') return true;
  return false;
}

/**
 * Returns an LPF multiplier that colors borrowed chords.
 * Borrowed chords get darker (lower LPF) to distinguish them.
 *
 * @param degree - chord degree (1-7)
 * @param quality - chord quality string
 * @param mood - current mood
 * @param section - current section
 * @returns LPF multiplier in [0.90, 1.0]
 */
export function modalMixtureColorLpf(
  degree: number,
  quality: string,
  mood: Mood,
  section: Section
): number {
  if (!isBorrowedChord(degree, quality)) return 1.0;
  const depth = mixtureDepth[mood] * sectionMultiplier[section];
  return 1.0 - 0.10 * depth;
}

export function mixtureDepthValue(mood: Mood): number {
  return mixtureDepth[mood];
}
