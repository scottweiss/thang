import type { Mood, Section } from '../types';

/**
 * Harmonic chromatic mediant — chromatic mediant relationships
 * (root motion by a major or minor third with mode change)
 * create vivid harmonic color shifts. C→E, C→Ab, C→Eb, C→A.
 * Boost FM depth when these dramatic moves occur.
 */

const mediantStrength: Record<Mood, number> = {
  ambient: 0.30,
  downtempo: 0.35,
  lofi: 0.20,
  trance: 0.45,
  avril: 0.55,
  xtal: 0.50,
  syro: 0.30,
  blockhead: 0.15,
  flim: 0.40,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.0,
  peak: 1.2,
  breakdown: 0.8,
  groove: 0.9,
};

// Chromatic mediant intervals in semitones (major 3rd, minor 3rd)
const MEDIANT_INTERVALS = [3, 4, 8, 9]; // minor 3rd, major 3rd, minor 6th, major 6th

/**
 * Detects if a root motion interval (in semitones) is a chromatic mediant.
 */
export function isChromaticMediant(interval: number): boolean {
  const normalized = ((interval % 12) + 12) % 12;
  return MEDIANT_INTERVALS.includes(normalized);
}

/**
 * Returns an FM depth multiplier when the current chord progression
 * involves a chromatic mediant relationship.
 *
 * @param prevRoot - previous chord root as pitch class (0-11)
 * @param currRoot - current chord root as pitch class (0-11)
 * @param modeChanged - whether the chord quality changed (e.g. maj→min)
 * @param mood - current mood
 * @param section - current section
 * @returns FM multiplier in [1.0, 1.04]
 */
export function chromaticMediantFm(
  prevRoot: number,
  currRoot: number,
  modeChanged: boolean,
  mood: Mood,
  section: Section
): number {
  const interval = ((currRoot - prevRoot) % 12 + 12) % 12;
  if (!isChromaticMediant(interval)) return 1.0;

  const depth = mediantStrength[mood] * sectionMultiplier[section];
  // Full chromatic mediant (with mode change) gets full boost
  // Diatonic mediant (same mode) gets half
  const modeBonus = modeChanged ? 1.0 : 0.5;
  return 1.0 + 0.04 * depth * modeBonus;
}

export function mediantStrengthValue(mood: Mood): number {
  return mediantStrength[mood];
}
