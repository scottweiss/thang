import type { Mood, Section } from '../types';

/**
 * Rhythmic tresillo accent — the tresillo (3+3+2) is one of
 * the most fundamental rhythmic cells in African diaspora music.
 * It appears in everything from New Orleans funk to EDM.
 * Apply accent on tresillo positions within each 8-step half-bar.
 */

const tresilloStrength: Record<Mood, number> = {
  ambient: 0.05,
  plantasia: 0.05,
  downtempo: 0.30,
  lofi: 0.35,
  trance: 0.25,
  avril: 0.15,
  xtal: 0.15,
  syro: 0.35,
  blockhead: 0.50,
  flim: 0.25,
  disco: 0.55,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.5,
  groove: 1.3,
};

// Tresillo positions within an 8-step cell: 0, 3, 6
const TRESILLO = [0, 3, 6];

/**
 * Returns a gain multiplier for tresillo accent positions.
 * Applied to each 8-step half of a 16-step pattern.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function tresilloAccentGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const depth = tresilloStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  // Map to 8-step cell
  const cellPos = beatPosition % 8;
  if (TRESILLO.includes(cellPos)) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function tresilloStrengthValue(mood: Mood): number {
  return tresilloStrength[mood];
}
