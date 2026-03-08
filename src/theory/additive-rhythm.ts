/**
 * Additive rhythm — asymmetric beat groupings from non-western traditions.
 *
 * Standard western music divides time divisively: 4/4 = 2+2+2+2.
 * Additive rhythm groups beats asymmetrically: 3+3+2, 2+2+3, 3+2+2+3.
 * This creates lopsided, propulsive grooves heard in:
 *
 * - Balkan folk music (aksak meters: 7/8 = 3+2+2, 11/8 = 3+2+3+3)
 * - Stravinsky's Rite of Spring (constantly shifting groupings)
 * - Bartók's Bulgarian dances
 * - Aphex Twin / Autechre (IDM asymmetric patterns)
 * - Dave Brubeck ("Take Five" = 3+2)
 *
 * Application: texture and drum layers use additive groupings for
 * organic, non-mechanical grooves. The irregularity creates forward
 * motion because the ear keeps re-adjusting to the asymmetry.
 */

import type { Mood, Section } from '../types';

/** Common additive groupings that sum to 8 or 16 steps */
export type AdditiveGrouping = number[];

/** How much each mood uses additive rhythm (0-1) */
const ADDITIVE_TENDENCY: Record<Mood, number> = {
  syro:      0.40,  // IDM — irregular is the point
  blockhead: 0.30,  // hip-hop — off-kilter grooves
  flim:      0.25,  // organic irregularity
  xtal:      0.20,  // gentle asymmetry
  lofi:      0.18,  // jazz — odd time feels
  downtempo: 0.15,  // subtle push-pull
  disco:     0.10,  // mostly 4/4 but occasional variation
  trance:    0.08,  // mostly regular, rare variation
  avril:     0.08,  // songwriter — mostly regular
  ambient:   0.05,  // floats, doesn't need groove
};

/** Section multipliers for additive rhythm */
const SECTION_ADDITIVE_MULT: Record<Section, number> = {
  intro:     0.4,   // establish regular feel first
  build:     1.2,   // increasing complexity
  peak:      1.5,   // maximum rhythmic interest
  breakdown: 0.6,   // simplify
  groove:    1.0,   // natural home
};

/** 8-step groupings (sum to 8) */
const GROUPINGS_8: AdditiveGrouping[] = [
  [3, 3, 2],       // tresillo — most universal
  [3, 2, 3],       // son clave variant
  [2, 3, 3],       // reverse tresillo
  [2, 2, 2, 2],    // standard (included as fallback)
  [3, 2, 2, 1],    // Bartók-style
  [2, 3, 2, 1],    // asymmetric
];

/** 16-step groupings (sum to 16) */
const GROUPINGS_16: AdditiveGrouping[] = [
  [3, 3, 2, 3, 3, 2],     // double tresillo
  [3, 3, 3, 3, 2, 2],     // stretched
  [4, 3, 3, 3, 3],        // 5-group in 16
  [3, 2, 3, 3, 2, 3],     // interlocking
  [2, 3, 2, 3, 3, 3],     // Balkan-style
  [3, 3, 2, 2, 3, 3],     // symmetric frame
  [5, 3, 3, 5],           // dramatic contrast
  [4, 4, 3, 5],           // near-regular with surprise
];

/**
 * Whether to apply additive rhythm at this tick.
 */
export function shouldApplyAdditive(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const tendency = ADDITIVE_TENDENCY[mood] * (SECTION_ADDITIVE_MULT[section] ?? 1.0);
  const hash = ((tick * 2654435761 + 17389) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Select an additive grouping appropriate for the step count.
 *
 * @param steps    Total steps (8 or 16)
 * @param mood     Current mood (influences complexity)
 * @param tick     For determinism
 * @returns Array of group sizes summing to `steps`
 */
export function selectGrouping(
  steps: 8 | 16,
  mood: Mood,
  tick: number
): AdditiveGrouping {
  const pool = steps === 8 ? GROUPINGS_8 : GROUPINGS_16;
  const hash = ((tick * 65537 + 7919) >>> 0) % pool.length;
  return pool[hash];
}

/**
 * Generate an accent mask from an additive grouping.
 * The first beat of each group gets a strong accent,
 * creating the characteristic lopsided feel.
 *
 * @param grouping   Array of group sizes (e.g., [3, 3, 2])
 * @param strong     Gain multiplier for accented beats
 * @param weak       Gain multiplier for unaccented beats
 * @returns Array of gain multipliers
 */
export function additiveAccentMask(
  grouping: AdditiveGrouping,
  strong: number = 1.0,
  weak: number = 0.65
): number[] {
  const total = grouping.reduce((a, b) => a + b, 0);
  const mask = new Array(total).fill(weak);
  let pos = 0;
  for (const group of grouping) {
    mask[pos] = strong;
    pos += group;
  }
  return mask;
}

/**
 * Generate a note placement mask from an additive grouping.
 * Places notes at the start of each group, rests elsewhere.
 * This creates the characteristic sparse-then-dense rhythmic feel.
 *
 * @param grouping   Array of group sizes
 * @returns Boolean array: true = place a note, false = rest
 */
export function additiveNoteMask(grouping: AdditiveGrouping): boolean[] {
  const total = grouping.reduce((a, b) => a + b, 0);
  const mask = new Array(total).fill(false);
  let pos = 0;
  for (const group of grouping) {
    mask[pos] = true;
    // For groups > 3, add a secondary beat midway
    if (group >= 4) {
      mask[pos + Math.floor(group / 2)] = true;
    }
    pos += group;
  }
  return mask;
}

/**
 * Apply additive grouping to a step array.
 * Keeps notes at group boundaries, silences others.
 *
 * @param steps     Existing step array
 * @param grouping  Additive grouping to apply
 * @returns Modified step array with additive rhythm
 */
export function applyAdditiveToSteps(
  steps: string[],
  grouping: AdditiveGrouping
): string[] {
  const mask = additiveNoteMask(grouping);
  const result: string[] = [...steps];
  for (let i = 0; i < result.length && i < mask.length; i++) {
    if (!mask[i] && result[i] !== '~') {
      // With some probability, keep the note for density
      // but the primary accent structure follows the grouping
      result[i] = '~';
    }
  }
  // Ensure at least one note survives
  if (!result.some(s => s !== '~')) {
    const firstNote = steps.findIndex(s => s !== '~');
    if (firstNote >= 0) result[firstNote] = steps[firstNote];
  }
  return result;
}

/**
 * Get additive tendency for a mood (for testing).
 */
export function additiveTendency(mood: Mood): number {
  return ADDITIVE_TENDENCY[mood];
}
