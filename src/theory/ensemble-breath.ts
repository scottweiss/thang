/**
 * Ensemble breathing — shared gain envelope across all layers.
 *
 * In a real ensemble (string quartet, jazz combo), musicians naturally
 * breathe together at phrase boundaries. There's a subtle collective
 * swell toward phrase climaxes and a gentle fade at endings.
 *
 * This module provides a shared gain multiplier that all layers read,
 * creating the feeling that the entire ensemble inhales and exhales
 * as one. The effect is subtle (±5-12%) but creates remarkable cohesion.
 *
 * The breath follows phrase structure:
 * - Start of phrase: slight dip (inhale, gathering energy)
 * - Mid-phrase: gentle swell (exhale, full expression)
 * - End of phrase: taper (breath release before next phrase)
 *
 * Consequent phrases (answers) breathe slightly more fully than
 * antecedent phrases (questions), reflecting their resolution role.
 */

import type { Mood, Section } from '../types';
import { phrasePosition, phraseLength, currentPhraseRole } from './phrase-harmony';

/** Per-mood breath depth (0 = no breathing, 1 = maximum) */
const BREATH_DEPTH: Record<Mood, number> = {
  avril:     0.60,   // intimate — deep, expressive breathing
  flim:      0.55,   // delicate — gentle breaths
  lofi:      0.50,   // jazz — ensemble feel
  downtempo: 0.45,   // smooth — relaxed breathing
  xtal:      0.40,   // dreamy — soft pulses
  blockhead: 0.35,   // hip-hop — some groove breathing
  disco:     0.25,   // funk — light, rhythm drives more
  syro:      0.20,   // IDM — mechanical, less organic
  trance:    0.15,   // EDM — constant energy, minimal breath
  ambient:   0.30,   // drone — slow, deep breaths
};

/** Section multiplier — breathing is more pronounced in expressive sections */
const SECTION_BREATH: Record<Section, number> = {
  intro:     0.7,    // gentle breathing as music emerges
  build:     0.8,    // breathing with growing intensity
  peak:      0.5,    // less obvious — energy sustains
  breakdown: 1.0,    // most pronounced — exposed, intimate
  groove:    0.6,    // moderate — rhythm carries more
};

/**
 * Compute the ensemble breath gain multiplier.
 *
 * @param tick     Current tick
 * @param mood     Current mood
 * @param section  Current section
 * @returns Gain multiplier (0.88-1.12 range typically)
 */
export function ensembleBreathMultiplier(
  tick: number,
  mood: Mood,
  section: Section
): number {
  const depth = BREATH_DEPTH[mood] * SECTION_BREATH[section];
  if (depth < 0.05) return 1.0;

  const pos = phrasePosition(tick, mood);
  const role = currentPhraseRole(tick, mood);

  // Breath shape: sine-like curve peaking at ~60% through the phrase
  // This puts the swell past center (golden section) for natural feel
  // pos=0: slight dip (inhale)
  // pos=0.6: peak (full expression)
  // pos=1.0: taper (release)
  const breathCurve = Math.sin(pos * Math.PI * 0.9 + 0.1);

  // Consequent phrases (answers) breathe slightly fuller
  const roleBoost = role === 'consequent' ? 1.15 : 1.0;

  // Map curve (-slight to +swell) with depth scaling
  // breathCurve ranges roughly 0.1 to 1.0
  // We want gain to range from (1 - depth*0.08) to (1 + depth*0.10)
  const multiplier = 1.0 + (breathCurve - 0.5) * depth * 0.18 * roleBoost;

  return multiplier;
}

/**
 * Whether ensemble breathing should be applied.
 */
export function shouldApplyEnsembleBreath(mood: Mood): boolean {
  return BREATH_DEPTH[mood] >= 0.1;
}

/**
 * Get breath depth for a mood (for testing).
 */
export function breathDepth(mood: Mood): number {
  return BREATH_DEPTH[mood];
}
