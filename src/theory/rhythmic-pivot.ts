/**
 * Rhythmic pivot — transitional rhythm patterns at section boundaries.
 *
 * When approaching a section change, the rhythm should signal the
 * transition. Builds accelerate (more notes), breakdowns decelerate
 * (fewer notes), peaks arrive with a flam/roll, grooves settle.
 * This creates musical "drum fills" in the melodic/arp layers.
 *
 * Applied as density and note-count multipliers near section ends.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood pivot intensity (how dramatic the transition is).
 */
const PIVOT_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong — builds demand energy ramp
  avril:     0.40,  // classical ritardando/accelerando
  disco:     0.50,  // disco builds with fill
  downtempo: 0.35,  // gentle
  blockhead: 0.50,  // hip-hop fill energy
  lofi:      0.30,  // subtle jazz transition
  flim:      0.35,  // organic
  xtal:      0.25,  // subtle
  syro:      0.45,  // IDM — energetic pivots
  ambient:   0.15,  // minimal — gentle transitions,
  plantasia: 0.15,
};

/**
 * Pivot zone: the last portion of a section where transition patterns apply.
 * Returns 0 outside the pivot zone, 0-1 within it (1 = section boundary).
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @returns Pivot intensity (0 = not in pivot zone, 1 = at boundary)
 */
export function pivotIntensity(
  sectionProgress: number,
  mood: Mood
): number {
  const zoneStart = 0.75; // last 25% of section
  if (sectionProgress < zoneStart) return 0;

  const strength = PIVOT_STRENGTH[mood];
  const zoneProgress = (sectionProgress - zoneStart) / (1.0 - zoneStart);
  return zoneProgress * strength;
}

/**
 * Density multiplier for the pivot zone.
 * Builds accelerate (more notes), breakdowns decelerate.
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns Density multiplier (0.5 - 1.8)
 */
export function pivotDensityMultiplier(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = pivotIntensity(sectionProgress, mood);
  if (intensity < 0.01) return 1.0;

  // Direction depends on section
  const direction: Record<Section, number> = {
    intro:     0.5,   // accelerate into build
    build:     0.8,   // accelerate strongly into peak
    peak:      -0.3,  // slight deceleration into breakdown
    breakdown: 0.4,   // gentle acceleration into groove
    groove:    0.0,   // neutral — groove is steady
  };

  const mult = 1.0 + intensity * (direction[section] ?? 0);
  return Math.max(0.5, Math.min(1.8, mult));
}

/**
 * Gain swell for the pivot zone.
 * Approaching transitions get a slight energy boost.
 *
 * @param sectionProgress 0-1 progress through section
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.9 - 1.15)
 */
export function pivotGainSwell(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const intensity = pivotIntensity(sectionProgress, mood);
  if (intensity < 0.01) return 1.0;

  // Builds/intros swell up, breakdowns swell down
  const swellDir: Record<Section, number> = {
    intro:     0.10,
    build:     0.15,
    peak:      -0.05,
    breakdown: -0.10,
    groove:    0.05,
  };

  return Math.max(0.9, Math.min(1.15, 1.0 + intensity * (swellDir[section] ?? 0)));
}

/**
 * Should rhythmic pivot be applied?
 */
export function shouldApplyRhythmicPivot(
  sectionProgress: number,
  mood: Mood
): boolean {
  return pivotIntensity(sectionProgress, mood) > 0.01;
}

/**
 * Get pivot strength for a mood (for testing).
 */
export function pivotStrengthForMood(mood: Mood): number {
  return PIVOT_STRENGTH[mood];
}
