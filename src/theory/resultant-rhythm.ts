/**
 * Resultant rhythm — the emergent pattern from combining two or more
 * independent rhythmic streams.
 *
 * When two rhythms with different periods overlap, the composite
 * creates a new pattern that is more complex than either source.
 * This is the mathematical basis of African polyrhythm and
 * minimalist music (Reich, Riley).
 *
 * Examples:
 * - 3-against-4: combining groups of 3 and 4 creates a 12-step
 *   resultant with hits at [0,3,4,6,8,9] — a classic Afro-Cuban pattern
 * - 5-against-4: creates a 20-step pattern with a "limping" quality
 * - 7-against-4: creates complex 28-step patterns (IDM territory)
 *
 * Application: use resultant patterns as accent/velocity masks
 * that give layers mathematically interesting rhythmic variety.
 */

import type { Mood, Section } from '../types';

/**
 * Compute the resultant rhythm from two periodicities.
 * Returns a boolean array where true = accent (a hit in either stream).
 *
 * @param a  First period (e.g., 3)
 * @param b  Second period (e.g., 4)
 * @returns Boolean array of length lcm(a, b)
 */
export function resultantPattern(a: number, b: number): boolean[] {
  if (a <= 0 || b <= 0) return [];
  const len = lcm(a, b);
  const pattern = new Array(len).fill(false);

  for (let i = 0; i < len; i += a) pattern[i] = true;
  for (let i = 0; i < len; i += b) pattern[i] = true;

  return pattern;
}

/**
 * Convert a resultant pattern to a gain accent mask.
 * Hits get boosted, non-hits get reduced.
 *
 * @param pattern    Boolean resultant pattern
 * @param boost      Gain multiplier for accented positions (default 1.15)
 * @param reduce     Gain multiplier for non-accented positions (default 0.85)
 * @returns Array of gain multipliers
 */
export function resultantAccentMask(
  pattern: boolean[],
  boost: number = 1.15,
  reduce: number = 0.85
): number[] {
  return pattern.map(hit => hit ? boost : reduce);
}

/**
 * Select appropriate rhythmic periods for a mood.
 * Returns [a, b] where the resultant of a-against-b fits the mood.
 *
 * @param mood     Current mood
 * @param section  Current section
 * @returns Tuple of two periods
 */
export function selectPeriods(mood: Mood, section: Section): [number, number] {
  // Simple ratios for conventional moods, complex for experimental
  const moodPeriods: Record<Mood, [number, number][]> = {
    ambient:   [[3, 4], [4, 5]],
    plantasia: [[3, 4], [4, 5]],
    xtal:      [[3, 4], [5, 4]],
    downtempo: [[3, 4], [3, 5]],
    lofi:      [[3, 4], [4, 5]],
    avril:     [[3, 4]],
    flim:      [[5, 4], [7, 4]],
    blockhead: [[3, 4], [5, 4]],
    syro:      [[5, 4], [7, 4], [7, 5]],
    disco:     [[3, 4]],
    trance:    [[3, 4]],
  };

  const options = moodPeriods[mood];
  // Peak/build prefer simpler ratios; breakdown/groove allow complexity
  const idx = (section === 'peak' || section === 'build')
    ? 0
    : Math.min(options.length - 1, 1);
  return options[idx];
}

/** How much each mood uses resultant rhythms (0-1) */
const RESULTANT_TENDENCY: Record<Mood, number> = {
  syro:      0.40,  // IDM — complex polyrhythm
  flim:      0.30,  // organic complexity
  blockhead: 0.25,  // hip-hop groove layers
  xtal:      0.20,  // crystalline patterns
  lofi:      0.18,  // subtle groove
  downtempo: 0.15,  // gentle layering
  ambient:   0.12,  // minimal,
  plantasia: 0.12,
  avril:     0.08,  // songwriter — rare
  disco:     0.06,  // straightforward
  trance:    0.04,  // on-the-grid
};

/**
 * Whether to apply resultant rhythm accenting.
 */
export function shouldApplyResultant(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const sectionMult = section === 'breakdown' ? 1.5
    : section === 'groove' ? 1.2
    : section === 'peak' ? 0.6
    : 1.0;
  const tendency = RESULTANT_TENDENCY[mood] * sectionMult;
  const hash = ((tick * 2654435761 + 4999) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get a resultant accent mask sized to fit a pattern of given length.
 * Tiles or truncates the resultant pattern to match.
 *
 * @param targetLength  Desired mask length
 * @param mood          Current mood
 * @param section       Current section
 * @returns Gain multiplier array of targetLength
 */
export function resultantGainMask(
  targetLength: number,
  mood: Mood,
  section: Section
): number[] {
  const [a, b] = selectPeriods(mood, section);
  const pattern = resultantPattern(a, b);
  const accents = resultantAccentMask(pattern);

  if (accents.length === 0) return new Array(targetLength).fill(1.0);

  // Tile the pattern to fit
  const mask: number[] = [];
  for (let i = 0; i < targetLength; i++) {
    mask.push(accents[i % accents.length]);
  }
  return mask;
}

/**
 * Get resultant tendency for a mood (for testing).
 */
export function resultantTendency(mood: Mood): number {
  return RESULTANT_TENDENCY[mood];
}

/** Least common multiple */
function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Greatest common divisor */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
