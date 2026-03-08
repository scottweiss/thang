import type { Mood, Section } from '../types';

/**
 * Harmonic common-tone preservation — when consecutive chords
 * share pitch classes (common tones), holding them creates
 * smoother voice leading and continuity. Boost gain on layers
 * when common tones exist between current and previous chord.
 */

const preserveStrength: Record<Mood, number> = {
  ambient: 0.55,
  downtempo: 0.40,
  lofi: 0.35,
  trance: 0.25,
  avril: 0.50,
  xtal: 0.45,
  syro: 0.15,
  blockhead: 0.20,
  flim: 0.35,
  disco: 0.30,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.8,
  build: 1.0,
  peak: 0.7,
  breakdown: 1.2,
  groove: 0.9,
};

/**
 * Count common tones between two sets of pitch classes (0-11).
 */
export function countCommonTones(prevPCs: number[], currPCs: number[]): number {
  let count = 0;
  for (const pc of currPCs) {
    if (prevPCs.includes(pc)) count++;
  }
  return count;
}

/**
 * Returns a gain multiplier rewarding common-tone preservation.
 * More common tones = smoother connection = more boost.
 *
 * @param prevPCs - pitch classes of previous chord (0-11)
 * @param currPCs - pitch classes of current chord (0-11)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function commonTonePreservationGain(
  prevPCs: number[],
  currPCs: number[],
  mood: Mood,
  section: Section
): number {
  const common = countCommonTones(prevPCs, currPCs);
  if (common === 0) return 1.0;

  const depth = preserveStrength[mood] * sectionMultiplier[section];
  // Normalize: most triads share 0-2 tones, 7th chords up to 3
  const ratio = Math.min(common / 3, 1.0);
  return 1.0 + 0.03 * ratio * depth;
}

export function preserveStrengthValue(mood: Mood): number {
  return preserveStrength[mood];
}
