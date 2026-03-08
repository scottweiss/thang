import type { Mood, Section } from '../types';

/**
 * Rhythmic beat subdivision density — controls emphasis
 * based on subdivision level. 8th note positions get
 * different treatment than 16th note positions, creating
 * a layered rhythmic hierarchy. Finer subdivisions get
 * subtle boost in high-energy sections.
 */

const subdivStrength: Record<Mood, number> = {
  ambient: 0.10,
  downtempo: 0.25,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.20,
  xtal: 0.35,
  syro: 0.55,
  blockhead: 0.50,
  flim: 0.40,
  disco: 0.45,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.3,
  build: 0.8,
  peak: 1.2,
  breakdown: 0.5,
  groove: 1.0,
};

/**
 * Determines subdivision level of a 16-step position.
 * Returns: 'quarter' (0,4,8,12), 'eighth' (2,6,10,14),
 * or 'sixteenth' (odd positions).
 */
export function subdivisionLevel(position: number): 'quarter' | 'eighth' | 'sixteenth' {
  const pos = ((position % 16) + 16) % 16;
  if (pos % 4 === 0) return 'quarter';
  if (pos % 2 === 0) return 'eighth';
  return 'sixteenth';
}

/**
 * Returns a gain multiplier emphasizing finer subdivisions
 * in high-energy contexts. Quarter notes are neutral (already strong).
 * 8th notes get mild boost. 16th notes get stronger boost
 * to help them cut through.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function beatSubdivisionGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const level = subdivisionLevel(beatPosition);
  if (level === 'quarter') return 1.0;

  const depth = subdivStrength[mood] * sectionMultiplier[section];
  const emphasis = level === 'sixteenth' ? 1.0 : 0.5;
  return 1.0 + 0.03 * emphasis * depth;
}

export function subdivStrengthValue(mood: Mood): number {
  return subdivStrength[mood];
}
