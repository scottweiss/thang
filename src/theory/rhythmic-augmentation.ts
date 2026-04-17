/**
 * Rhythmic augmentation and diminution — scaling note durations.
 *
 * Augmentation doubles (or increases) the duration of each note,
 * creating a broader, more spacious version of a pattern.
 * Diminution halves (or decreases) durations, creating urgency.
 *
 * Classical usage:
 * - Fugue subjects in augmentation (Bach: Art of Fugue)
 * - Rhythmic development in sonatas (Beethoven)
 * - Mensuration canons (Ockeghem)
 *
 * Electronic music usage:
 * - Build sections: diminution creates acceleration without tempo change
 * - Breakdowns: augmentation creates spaciousness
 * - Layering: same pattern at 2x and 1x creates depth
 *
 * Applied to note arrays by inserting or removing rests
 * between notes to change the effective speed.
 */

import type { Mood, Section } from '../types';

/**
 * Augment a pattern: insert a rest after each note (2x duration feel).
 * The result is twice as long as the input.
 *
 * @param pattern  Input note array
 * @returns Augmented pattern (double length, notes separated by rests)
 */
export function augment(pattern: string[]): string[] {
  const result: string[] = [];
  for (const note of pattern) {
    result.push(note);
    result.push('~'); // rest between notes = double duration feel
  }
  return result;
}

/**
 * Diminish a pattern: remove every other rest (halve duration feel).
 * Takes every non-rest note and packs them tighter.
 *
 * @param pattern  Input note array
 * @returns Diminished pattern (notes packed without intervening rests)
 */
export function diminish(pattern: string[]): string[] {
  const notes = pattern.filter(n => n !== '~');
  return notes;
}

/**
 * Partial augmentation: insert a rest after every N notes.
 * Factor 2 = rest every 2 notes, factor 3 = rest every 3 notes.
 *
 * @param pattern  Input note array
 * @param factor   Insert rest every N notes (2-4)
 * @returns Partially augmented pattern
 */
export function partialAugment(pattern: string[], factor: number = 2): string[] {
  const result: string[] = [];
  let noteCount = 0;
  for (const note of pattern) {
    result.push(note);
    if (note !== '~') {
      noteCount++;
      if (noteCount % factor === 0) {
        result.push('~');
      }
    }
  }
  return result;
}

/**
 * Partial diminution: remove every Nth rest.
 *
 * @param pattern  Input note array
 * @param factor   Remove every Nth rest (2-4)
 * @returns Partially diminished pattern
 */
export function partialDiminish(pattern: string[], factor: number = 2): string[] {
  const result: string[] = [];
  let restCount = 0;
  for (const note of pattern) {
    if (note === '~') {
      restCount++;
      if (restCount % factor !== 0) {
        result.push(note);
      }
      // else: skip this rest (diminish)
    } else {
      result.push(note);
    }
  }
  return result;
}

/** How much each mood uses rhythmic augmentation/diminution (0-1) */
const AUG_DIM_TENDENCY: Record<Mood, number> = {
  syro:      0.35,  // IDM — temporal play
  flim:      0.28,  // organic tempo shifts
  trance:    0.25,  // builds use diminution
  blockhead: 0.22,  // chopping
  lofi:      0.18,  // jazz — rhythmic freedom
  disco:     0.15,  // build energy
  downtempo: 0.12,  // subtle
  avril:     0.10,  // occasional
  xtal:      0.08,  // gentle
  ambient:   0.05,  // minimal,
  plantasia: 0.05,
};

/** Section drives augmentation vs diminution */
const SECTION_DIRECTION: Record<Section, 'augment' | 'diminish' | 'neutral'> = {
  intro:     'augment',   // spacious, breathing
  build:     'diminish',  // accelerating energy
  peak:      'diminish',  // maximum density
  breakdown: 'augment',   // open up
  groove:    'neutral',   // as-is
};

/**
 * Whether to apply rhythmic augmentation/diminution.
 */
export function shouldApplyAugDim(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  if (SECTION_DIRECTION[section] === 'neutral') return false;
  const tendency = AUG_DIM_TENDENCY[mood];
  const hash = ((tick * 2654435761 + 11003) >>> 0) / 4294967296;
  return hash < tendency;
}

/**
 * Get the appropriate transformation for the current context.
 */
export function getTransformDirection(section: Section): 'augment' | 'diminish' {
  return SECTION_DIRECTION[section] === 'augment' ? 'augment' : 'diminish';
}

/**
 * Apply the appropriate augmentation or diminution, truncated to target length.
 *
 * @param pattern      Input note array
 * @param section      Current section (determines aug vs dim)
 * @param targetLength Target output length
 * @returns Transformed pattern
 */
export function applyRhythmicTransform(
  pattern: string[],
  section: Section,
  targetLength: number
): string[] {
  const direction = SECTION_DIRECTION[section];
  let transformed: string[];

  if (direction === 'augment') {
    transformed = partialAugment(pattern, 2);
  } else if (direction === 'diminish') {
    transformed = partialDiminish(pattern, 2);
  } else {
    return pattern;
  }

  // Fit to target length
  if (transformed.length > targetLength) {
    return transformed.slice(0, targetLength);
  }
  while (transformed.length < targetLength) {
    transformed.push('~');
  }
  return transformed;
}

/**
 * Get augmentation tendency for a mood (for testing).
 */
export function augDimTendency(mood: Mood): number {
  return AUG_DIM_TENDENCY[mood];
}
