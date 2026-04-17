import type { Mood, Section } from '../types';

/**
 * Rhythmic additive grouping — instead of dividing beats evenly,
 * additive rhythms combine unequal groups (e.g., 3+3+2 = 8).
 * This creates asymmetric accent patterns common in many
 * world music traditions and modern electronic music.
 */

const additiveStrength: Record<Mood, number> = {
  ambient: 0.05,
  plantasia: 0.05,
  downtempo: 0.25,
  lofi: 0.30,
  trance: 0.20,
  avril: 0.30,
  xtal: 0.25,
  syro: 0.55,
  blockhead: 0.50,
  flim: 0.35,
  disco: 0.35,
};

const sectionMultiplier: Record<Section, number> = {
  intro: 0.4,
  build: 0.9,
  peak: 1.0,
  breakdown: 0.5,
  groove: 1.3,
};

// Common additive groupings within 16 steps
const GROUPINGS = [
  [3, 3, 2, 3, 3, 2],    // 3+3+2+3+3+2 = 16
  [3, 3, 3, 3, 2, 2],    // 3+3+3+3+2+2 = 16
  [2, 3, 2, 3, 2, 2, 2], // 2+3+2+3+2+2+2 = 16
];

/**
 * Returns a gain multiplier for additive rhythm accents.
 * The first beat of each group in the additive pattern gets emphasis.
 *
 * @param beatPosition - position in 16-step pattern (0-15)
 * @param tick - current tick for pattern rotation
 * @param mood - current mood
 * @param section - current section
 * @returns gain multiplier in [1.0, 1.03]
 */
export function additiveGroupingGain(
  beatPosition: number,
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = additiveStrength[mood] * sectionMultiplier[section];
  if (depth < 0.01) return 1.0;

  const groupIdx = Math.floor(tick / 6) % GROUPINGS.length;
  const groups = GROUPINGS[groupIdx];

  // Find accent positions (first beat of each group)
  const accents: number[] = [];
  let pos = 0;
  for (const g of groups) {
    accents.push(pos);
    pos += g;
    if (pos >= 16) break;
  }

  const p = beatPosition % 16;
  if (accents.includes(p)) {
    return 1.0 + 0.03 * depth;
  }
  return 1.0;
}

export function additiveStrengthValue(mood: Mood): number {
  return additiveStrength[mood];
}
