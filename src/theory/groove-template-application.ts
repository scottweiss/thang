/**
 * Groove template application — characteristic rhythmic patterns per mood.
 *
 * Each mood has a rhythmic DNA: trance has four-on-the-floor,
 * lofi has lazy swing, blockhead has choppy hits. This module
 * provides gain patterns that emboss groove character onto layers.
 *
 * Applied as per-step gain multiplier for rhythmic character.
 */

import type { Mood } from '../types';

/**
 * Per-mood groove strength (higher = more pronounced groove pattern).
 */
const GROOVE_STRENGTH: Record<Mood, number> = {
  trance:    0.55,  // strong — driving pulse
  avril:     0.35,  // moderate — refined rhythm
  disco:     0.60,  // strongest — funky groove
  downtempo: 0.45,  // moderate — laid-back
  blockhead: 0.50,  // strong — choppy
  lofi:      0.40,  // moderate — gentle swing
  flim:      0.30,  // weak — delicate
  xtal:      0.25,  // weak — ethereal
  syro:      0.20,  // weakest — free
  ambient:   0.15,  // weakest — floating
};

/**
 * Groove templates: gain multiplier per 16th-note position (0-15).
 * Values are 0.0-1.0 representing relative emphasis.
 */
const GROOVE_TEMPLATES: Record<Mood, number[]> = {
  trance:    [1.0, 0.3, 0.5, 0.3, 1.0, 0.3, 0.5, 0.3, 1.0, 0.3, 0.5, 0.3, 1.0, 0.3, 0.5, 0.3], // four-on-floor
  avril:     [1.0, 0.4, 0.6, 0.4, 0.8, 0.4, 0.6, 0.4, 0.9, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.5], // classical
  disco:     [1.0, 0.3, 0.4, 0.3, 0.9, 0.5, 0.4, 0.6, 1.0, 0.3, 0.4, 0.3, 0.9, 0.5, 0.4, 0.7], // funk/disco
  downtempo: [1.0, 0.3, 0.4, 0.5, 0.7, 0.3, 0.5, 0.4, 0.8, 0.3, 0.4, 0.5, 0.6, 0.3, 0.5, 0.4], // relaxed
  blockhead: [1.0, 0.2, 0.3, 0.6, 0.8, 0.2, 0.7, 0.3, 0.9, 0.2, 0.3, 0.7, 0.6, 0.2, 0.8, 0.3], // choppy
  lofi:      [1.0, 0.3, 0.5, 0.4, 0.7, 0.3, 0.5, 0.5, 0.8, 0.3, 0.5, 0.4, 0.6, 0.3, 0.5, 0.5], // gentle
  flim:      [1.0, 0.4, 0.5, 0.4, 0.6, 0.5, 0.4, 0.5, 0.7, 0.4, 0.5, 0.4, 0.6, 0.5, 0.4, 0.5], // delicate
  xtal:      [1.0, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.7, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5], // even
  syro:      [1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], // flat
  ambient:   [1.0, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6], // very flat
};

/**
 * Get groove gain multiplier for a beat position.
 *
 * @param position Beat position (0-15)
 * @param mood Current mood
 * @returns Gain multiplier (0.85 - 1.10)
 */
export function grooveGainMultiplier(
  position: number,
  mood: Mood
): number {
  const strength = GROOVE_STRENGTH[mood];
  const template = GROOVE_TEMPLATES[mood];
  const pos = ((position % 16) + 16) % 16;
  const templateValue = template[pos];

  // Scale the template: 1.0 stays at 1.0, lower values get reduced
  const deviation = (templateValue - 0.5) * strength * 0.5;
  return Math.max(0.85, Math.min(1.10, 1.0 + deviation));
}

/**
 * Get groove strength for a mood (for testing).
 */
export function grooveStrength(mood: Mood): number {
  return GROOVE_STRENGTH[mood];
}
