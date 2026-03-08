import type { Mood, Section } from '../types';

/**
 * Rhythmic anacrusis emphasis — the anacrusis (pickup/upbeat)
 * before a strong beat creates forward momentum. Emphasize
 * the last 1-2 steps before each downbeat to propel the
 * rhythm forward.
 */

const anacrusisStrength: Record<Mood, number> = {
  ambient: 0.10,
  downtempo: 0.25,
  lofi: 0.30,
  trance: 0.45,
  avril: 0.35,
  xtal: 0.20,
  syro: 0.40,
  blockhead: 0.35,
  flim: 0.30,
  disco: 0.55,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.5,
  build: 1.1,
  peak: 1.0,
  breakdown: 0.6,
  groove: 1.2,
};

/**
 * Returns a gain multiplier for anacrusis (pickup) positions.
 * Positions 15 and 7 (just before downbeats at 0 and 8) get emphasis.
 * Position 14 and 6 get lighter emphasis.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function anacrusisEmphasisGain(
  beatPosition: number,
  mood: Mood,
  section: Section
): number {
  const depth = anacrusisStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  const pos = beatPosition % 16;
  // Strong anacrusis: just before downbeats
  if (pos === 15 || pos === 7) {
    return 1.0 + 0.03 * depth;
  }
  // Lighter anacrusis: two before downbeats
  if (pos === 14 || pos === 6) {
    return 1.0 + 0.015 * depth;
  }
  return 1.0;
}

export function anacrusisStrengthValue(mood: Mood): number {
  return anacrusisStrength[mood];
}
