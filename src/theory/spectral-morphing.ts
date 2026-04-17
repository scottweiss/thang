/**
 * Spectral morphing — smooth timbral transitions between sections.
 *
 * When sections change, timbre should morph gradually rather than
 * snapping to new values. This module provides interpolation curves
 * for FM depth and LPF during transitions.
 *
 * Applied as FM/LPF interpolation during section transitions.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood morph speed (higher = faster transition).
 */
const MORPH_SPEED: Record<Mood, number> = {
  trance:    0.50,  // moderate — gradual builds
  avril:     0.40,  // moderate — orchestral transitions
  disco:     0.60,  // fast — quick changes
  downtempo: 0.35,  // slow — gradual
  blockhead: 0.55,  // moderate-fast
  lofi:      0.30,  // slow — gentle transitions
  flim:      0.25,  // slowest — delicate morphs
  xtal:      0.30,  // slow — crystalline evolution
  syro:      0.45,  // moderate
  ambient:   0.20,  // slowest — glacial morphs,
  plantasia: 0.20,
};

/**
 * Section brightness targets (relative LPF multiplier).
 */
const SECTION_BRIGHTNESS: Record<Section, number> = {
  intro:     0.7,   // dark
  build:     0.85,  // warming
  peak:      1.0,   // brightest
  breakdown: 0.6,   // darkest
  groove:    0.9,   // bright
};

/**
 * Calculate morph progress at a section position.
 * Uses exponential ease-in for natural feel.
 *
 * @param sectionProgress 0.0-1.0 progress through section
 * @param mood Current mood
 * @returns Morph completion (0.0 - 1.0)
 */
export function morphProgress(
  sectionProgress: number,
  mood: Mood
): number {
  const speed = MORPH_SPEED[mood];
  const t = Math.max(0, Math.min(1, sectionProgress));
  // Exponential approach to completion
  return 1.0 - Math.exp(-t * speed * 8);
}

/**
 * Calculate LPF target from section brightness.
 *
 * @param baseLpf Base LPF value
 * @param section Current section
 * @param mood Current mood
 * @param sectionProgress Progress through section
 * @returns Morphed LPF value
 */
export function morphedLpf(
  baseLpf: number,
  section: Section,
  mood: Mood,
  sectionProgress: number
): number {
  const target = baseLpf * SECTION_BRIGHTNESS[section];
  const progress = morphProgress(sectionProgress, mood);
  return baseLpf * (1 - progress) + target * progress;
}

/**
 * Get morph speed for a mood (for testing).
 */
export function morphSpeed(mood: Mood): number {
  return MORPH_SPEED[mood];
}
