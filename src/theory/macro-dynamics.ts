/**
 * Macro dynamics — overall loudness contour across the full piece.
 *
 * Like a conductor's dynamic plan for a symphony movement, this
 * shapes the master gain over time to create a sense of large-scale
 * breathing and drama.
 *
 * The contour follows the section arc:
 * - Intro: piano/pianissimo (pp) — gentle emergence
 * - Build: crescendo — growing energy
 * - Peak: fortissimo (ff) — maximum impact
 * - Breakdown: subito piano — dramatic drop
 * - Groove: mezzo-forte (mf) — settled energy
 *
 * Additionally, within each section the dynamics have micro-contour:
 * gradual crescendo through builds, slight decrescendo at section ends
 * for natural phrasing. This prevents the "wall of sound" problem where
 * everything is equally loud.
 *
 * Applied as a master gain multiplier that stacks on top of per-layer
 * and per-note dynamics.
 */

import type { Mood, Section } from '../types';

/** Base dynamic level per section (0-1 scale, 1 = maximum) */
const SECTION_DYNAMICS: Record<Section, { base: number; target: number }> = {
  intro:     { base: 0.55, target: 0.65 },   // pp → p
  build:     { base: 0.65, target: 0.90 },   // p → f (crescendo)
  peak:      { base: 0.90, target: 0.95 },   // f → ff
  breakdown: { base: 0.50, target: 0.60 },   // pp → p (after drop)
  groove:    { base: 0.75, target: 0.80 },   // mf → mf+
};

/** How much each mood compresses dynamic range */
const DYNAMIC_RANGE: Record<Mood, number> = {
  ambient:   0.30,  // very compressed — always quiet
  xtal:      0.40,  // gentle dynamics
  downtempo: 0.50,  // moderate range
  flim:      0.55,  // moderate
  lofi:      0.55,  // moderate
  avril:     0.65,  // wider dynamics
  blockhead: 0.60,  // hip-hop dynamics
  syro:      0.70,  // wide range for surprises
  disco:     0.45,  // compressed for dance floor
  trance:    0.50,  // moderate, build-focused
};

/**
 * Get the master gain multiplier for the current moment.
 * Interpolates between section base and target based on progress.
 *
 * @param section   Current section
 * @param progress  Section progress (0-1)
 * @param mood      Current mood
 * @returns Gain multiplier (0.5-1.0 typical range)
 */
export function macroDynamicGain(
  section: Section,
  progress: number,
  mood: Mood
): number {
  const dynamics = SECTION_DYNAMICS[section];
  const range = DYNAMIC_RANGE[mood];

  // Interpolate base → target across section
  const rawLevel = dynamics.base + (dynamics.target - dynamics.base) * progress;

  // Apply dynamic range compression for mood
  // Range maps [0,1] dynamics to [1-range, 1] gain
  const minGain = 1.0 - range;
  return minGain + rawLevel * range;
}

/**
 * Get the dynamic "surprise" multiplier for section transitions.
 * Creates a brief dynamic accent at the start of peak sections
 * or a dramatic drop at breakdowns.
 *
 * @param section        Current section
 * @param ticksInSection Ticks since section started
 * @returns Multiplier (0.5-1.2 range)
 */
export function transitionDynamicAccent(
  section: Section,
  ticksInSection: number
): number {
  if (ticksInSection > 3) return 1.0; // only affects first 3 ticks

  switch (section) {
    case 'peak':
      // Brief accent then settle
      return ticksInSection === 0 ? 1.15 : 1.0 + 0.15 / (ticksInSection + 1);
    case 'breakdown':
      // Dramatic drop then gradual recovery
      return 0.6 + 0.13 * ticksInSection;
    case 'build':
      // Gentle start
      return 0.85 + 0.05 * ticksInSection;
    default:
      return 1.0;
  }
}

/**
 * Whether macro dynamics should be applied (always yes, but with mood-scaled depth).
 */
export function shouldApplyMacroDynamics(mood: Mood): boolean {
  return DYNAMIC_RANGE[mood] > 0.1;
}

/**
 * Get the dynamic range for a mood (for testing).
 */
export function dynamicRange(mood: Mood): number {
  return DYNAMIC_RANGE[mood];
}
