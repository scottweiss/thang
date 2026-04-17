/**
 * Rhythmic breath sync — coordinated micro-pauses before strong beats.
 *
 * A drummer lifts their stick before the downbeat. A pianist lifts
 * their fingers before the chord. This tiny gap — the "breath" —
 * creates emphasis by contrast. When all layers breathe together,
 * the strong beat hits with much more impact.
 *
 * This module creates synchronized micro-rests across all layers
 * just before metrically strong positions. The effect is subtle
 * (1/32 note or less) but creates a sense of collective timing
 * that makes the ensemble feel like real musicians playing together.
 *
 * Implemented as gain dips rather than actual rests (to avoid
 * pattern reconstruction). A brief gain reduction before beat 1
 * creates the "lift" feeling.
 */

import type { Mood, Section } from '../types';

/** How much each mood uses synchronized breathing (0-1) */
const BREATH_SYNC_DEPTH: Record<Mood, number> = {
  lofi:      0.40,   // jazz ensemble feel — breathe together
  blockhead: 0.45,   // hip-hop boom-bap needs the lift
  disco:     0.35,   // funk lift before downbeat
  downtempo: 0.30,   // moderate collective breathing
  avril:     0.25,   // singer-songwriter — subtle lift
  flim:      0.20,   // organic
  syro:      0.15,   // IDM — less conventional timing
  xtal:      0.15,   // dreamy — doesn't need strong beats
  ambient:   0.05,   // no strong metric structure,
  plantasia: 0.05,
  trance:    0.30,   // four-on-floor needs the pump
};

/** Section modifies breath depth */
const SECTION_BREATH_MULT: Record<Section, number> = {
  intro:     0.5,    // gentle entry
  build:     1.2,    // building anticipation
  peak:      1.0,    // full energy
  breakdown: 0.3,    // no strong beats to breathe before
  groove:    1.3,    // maximum groove feel
};

/**
 * Generate a per-step gain multiplier pattern that creates
 * micro-dips before strong beats.
 *
 * @param steps    Number of steps (typically 8 or 16)
 * @param mood     Current mood
 * @param section  Current section
 * @returns Array of gain multipliers (0.85-1.0)
 */
export function breathSyncGainPattern(
  steps: number,
  mood: Mood,
  section: Section
): number[] {
  const depth = BREATH_SYNC_DEPTH[mood] * (SECTION_BREATH_MULT[section] ?? 1.0);
  if (depth < 0.05) return new Array(steps).fill(1.0);

  const pattern = new Array(steps).fill(1.0);

  // Strong beats at positions that represent bar/beat boundaries
  // For 8 steps: beat 1 = step 0, beat 3 = step 4
  // For 16 steps: beat 1 = step 0, beat 2 = step 4, beat 3 = step 8, beat 4 = step 12
  const strongPositions = steps <= 8
    ? [0, 4]                       // 8th notes: beats 1 and 3
    : [0, 4, 8, 12];              // 16th notes: all 4 beats

  for (const pos of strongPositions) {
    // The step BEFORE the strong beat gets a gain dip
    const breathPos = (pos - 1 + steps) % steps;
    // Scale dip by depth (max 20% reduction at full depth)
    pattern[breathPos] = 1.0 - depth * 0.20;
  }

  return pattern;
}

/**
 * Whether breath sync should be applied for this mood.
 */
export function shouldApplyBreathSync(mood: Mood): boolean {
  return BREATH_SYNC_DEPTH[mood] >= 0.10;
}

/**
 * Get breath sync depth for a mood (for testing).
 */
export function breathSyncDepth(mood: Mood): number {
  return BREATH_SYNC_DEPTH[mood];
}

/**
 * Apply breath sync to an existing gain pattern string.
 *
 * @param gainPattern  Space-separated gain values
 * @param mood         Current mood
 * @param section      Current section
 * @returns Modified gain pattern with micro-dips
 */
export function applyBreathSyncToGain(
  gainPattern: string,
  mood: Mood,
  section: Section
): string {
  const gains = gainPattern.split(' ').map(Number);
  const breathPattern = breathSyncGainPattern(gains.length, mood, section);

  return gains
    .map((g, i) => (g * (breathPattern[i] ?? 1.0)).toFixed(4))
    .join(' ');
}
