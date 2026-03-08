/**
 * Polyrhythmic layering — different layers in different metric groupings.
 *
 * True polyrhythm means two or more simultaneous rhythm streams with
 * different beat groupings. Classic examples:
 * - 3 against 4 (African music, jazz)
 * - 5 against 4 (Indian music, progressive)
 * - 7 against 8 (Balkan, IDM)
 *
 * Unlike hemiola (accent pattern over existing grid), polyrhythm changes
 * the actual step count. A layer in "3-feel" over a 4/4 bar places
 * its notes at positions derived from dividing the bar into 3 equal parts.
 *
 * Implementation: given a target step count (e.g. 16), compute Euclidean
 * positions for the polyrhythmic grouping, creating an accent/placement
 * mask that gives the layer a different metric feel.
 */

import type { Mood, Section } from '../types';

/**
 * Polyrhythmic grouping options.
 * The number represents how many equal divisions of the bar.
 */
export type PolyGrouping = 3 | 5 | 6 | 7;

/** Per-mood polyrhythmic tendency */
interface PolyConfig {
  probability: number;       // chance of applying polyrhythm
  groupings: PolyGrouping[]; // available groupings (weighted toward first)
}

const MOOD_POLY: Record<Mood, PolyConfig> = {
  syro:      { probability: 0.40, groupings: [5, 7, 3] },    // IDM loves odd meters
  blockhead: { probability: 0.25, groupings: [3, 6] },       // hip-hop — triplet feel
  lofi:      { probability: 0.20, groupings: [3, 6] },       // jazz triplets
  disco:     { probability: 0.15, groupings: [3, 6] },       // funk triplets
  downtempo: { probability: 0.15, groupings: [3, 5] },       // subtle cross-rhythm
  trance:    { probability: 0.08, groupings: [3] },           // rare — mostly straight
  flim:      { probability: 0.20, groupings: [5, 3, 7] },    // Aphex-style odd groupings
  xtal:      { probability: 0.15, groupings: [5, 3] },       // dreamy — occasional 5-feel
  avril:     { probability: 0.10, groupings: [3] },           // intimate — gentle triplet
  ambient:   { probability: 0.05, groupings: [3, 5] },       // rare — ethereal odd meter
};

/** Sections that favor polyrhythm */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.3,   // sparse — minimal polyrhythm
  build:     0.8,   // building energy includes rhythmic complexity
  peak:      1.0,   // full complexity
  breakdown: 0.4,   // stripped — reduce complexity
  groove:    0.9,   // locked in — strong polyrhythm
};

/**
 * Whether to apply polyrhythm to a layer in the current context.
 *
 * @param mood    Current mood
 * @param section Current section
 * @param layer   Layer name (only arp and melody benefit)
 */
export function shouldApplyPolyrhythm(
  mood: Mood,
  section: Section,
  layer: string
): boolean {
  // Only arp benefits from polyrhythm (melody needs phrase coherence)
  if (layer !== 'arp') return false;
  const config = MOOD_POLY[mood];
  const prob = config.probability * SECTION_MULT[section];
  return Math.random() < prob;
}

/**
 * Select a polyrhythmic grouping for the current mood.
 */
export function selectGrouping(mood: Mood): PolyGrouping {
  const config = MOOD_POLY[mood];
  // Weighted toward first grouping (most natural for the mood)
  const weights = config.groupings.map((_, i) => 1.0 / (i + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return config.groupings[i];
  }
  return config.groupings[0];
}

/**
 * Generate polyrhythmic step positions within a grid.
 *
 * Given a grid of `steps` positions and a `grouping` (e.g. 3),
 * returns the positions where beats fall when dividing the bar
 * into `grouping` equal parts.
 *
 * Example: grouping=3, steps=16 → positions [0, 5, 11]
 * (dividing 16 into 3 roughly equal parts)
 *
 * @param grouping Number of equal divisions
 * @param steps    Total grid steps (typically 8 or 16)
 * @returns Array of step indices where polyrhythmic beats fall
 */
export function polyrhythmPositions(
  grouping: PolyGrouping,
  steps: number
): number[] {
  const positions: number[] = [];
  for (let i = 0; i < grouping; i++) {
    positions.push(Math.round(i * steps / grouping));
  }
  return positions;
}

/**
 * Create a gain accent mask for polyrhythmic emphasis.
 *
 * Steps that align with the polyrhythmic grid get boosted,
 * steps that don't get reduced. This creates the cross-rhythm
 * feel without completely silencing off-grid notes.
 *
 * @param grouping  Polyrhythmic grouping
 * @param steps     Total grid steps
 * @param strength  How strong the accent (0-1, higher = more pronounced)
 * @returns Array of gain multipliers (length = steps)
 */
export function polyrhythmAccentMask(
  grouping: PolyGrouping,
  steps: number,
  strength: number = 0.5
): number[] {
  const positions = new Set(polyrhythmPositions(grouping, steps));
  const mask = new Array(steps).fill(1.0);

  for (let i = 0; i < steps; i++) {
    if (positions.has(i)) {
      // On the polyrhythmic beat: boost
      mask[i] = 1.0 + strength * 0.2;
    } else {
      // Off the polyrhythmic beat: reduce
      mask[i] = 1.0 - strength * 0.15;
    }
  }

  return mask;
}

/**
 * Get the polyrhythmic accent strength for a mood.
 */
export function polyrhythmStrength(mood: Mood): number {
  return MOOD_POLY[mood].probability;
}
