/**
 * Sustain envelope curve — dynamic sustain level by section and role.
 *
 * Builds and peaks need short, punchy sustain so notes cut through.
 * Breakdowns and intros need longer sustain for floating textures.
 * This creates audible density changes beyond just note count.
 *
 * Applied as a sustain multiplier to layer envelopes.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sustain sensitivity (how much sustain varies).
 */
const SUSTAIN_SENSITIVITY: Record<Mood, number> = {
  trance:    0.50,  // strong — punchy builds, floating breakdowns
  avril:     0.40,  // classical dynamic range
  disco:     0.45,  // tight groove
  downtempo: 0.35,  // moderate
  blockhead: 0.55,  // dramatic contrast
  lofi:      0.30,  // warm consistency
  flim:      0.40,  // organic
  xtal:      0.35,  // ambient
  syro:      0.45,  // IDM contrast
  ambient:   0.25,  // gentle variation,
  plantasia: 0.25,
};

/**
 * Section sustain targets (0 = short/punchy, 1 = long/floating).
 */
const SECTION_SUSTAIN: Record<Section, number> = {
  intro:     0.7,   // floating
  build:     0.3,   // tightening
  peak:      0.2,   // punchiest
  breakdown: 0.8,   // most floating
  groove:    0.5,   // balanced
};

/**
 * Layer role sustain weights.
 * Lead layers get shorter sustain (cut through), pads get longer.
 */
const LAYER_SUSTAIN_WEIGHT: Record<string, number> = {
  drone:      1.3,   // longest sustain
  harmony:    1.1,   // pad-like
  melody:     0.7,   // punchy lead
  arp:        0.5,   // shortest — rhythmic
  texture:    0.8,   // moderate
  atmosphere: 1.4,   // most sustained
};

/**
 * Calculate sustain multiplier for a layer.
 *
 * @param section Current section
 * @param sectionProgress 0-1 progress
 * @param mood Current mood
 * @param layerName Layer identifier
 * @returns Sustain multiplier (0.5 - 1.5)
 */
export function sustainMultiplier(
  section: Section,
  sectionProgress: number,
  mood: Mood,
  layerName: string
): number {
  const sensitivity = SUSTAIN_SENSITIVITY[mood];
  const target = SECTION_SUSTAIN[section];
  const layerWeight = LAYER_SUSTAIN_WEIGHT[layerName] ?? 1.0;

  // Interpolate: builds get punchier as they progress, breakdowns get floatier
  const progressBias = (section === 'build' || section === 'peak')
    ? -sectionProgress * 0.15
    : sectionProgress * 0.1;

  const raw = (target + progressBias) * layerWeight;
  const mult = 1.0 + (raw - 0.5) * sensitivity;
  return Math.max(0.5, Math.min(1.5, mult));
}

/**
 * Should sustain curve be applied?
 */
export function shouldApplySustainCurve(mood: Mood): boolean {
  return SUSTAIN_SENSITIVITY[mood] > 0.20;
}

/**
 * Get sustain sensitivity for a mood (for testing).
 */
export function sustainSensitivity(mood: Mood): number {
  return SUSTAIN_SENSITIVITY[mood];
}
