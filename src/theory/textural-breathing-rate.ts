/**
 * Textural breathing rate — atmosphere/texture layers pulse at section rate.
 *
 * Background layers sound more alive when they breathe —
 * gently pulsing gain in a slow sine wave. The breathing
 * rate varies by section: faster in builds, slower in breakdowns.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood breathing depth (higher = more pronounced breathing).
 */
const BREATHING_DEPTH: Record<Mood, number> = {
  trance:    0.30,  // moderate — subtle pulse
  avril:     0.45,  // high — expressive breathing
  disco:     0.20,  // low — consistent
  downtempo: 0.50,  // high — deep breaths
  blockhead: 0.25,  // low
  lofi:      0.55,  // highest — lazy breathing
  flim:      0.45,  // high
  xtal:      0.50,  // high — atmospheric waves
  syro:      0.20,  // low — mechanical
  ambient:   0.60,  // highest — oceanic breathing,
  plantasia: 0.60,
};

/**
 * Section breathing rate (cycles per section, higher = faster).
 */
const SECTION_RATE: Record<Section, number> = {
  intro:     1.0,   // one breath per section
  build:     2.0,   // faster breathing
  peak:      3.0,   // quickest
  breakdown: 0.5,   // very slow
  groove:    1.5,   // moderate
};

/**
 * Calculate textural breathing gain multiplier.
 *
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.88 - 1.08)
 */
export function texturalBreathingGain(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const depth = BREATHING_DEPTH[mood];
  const rate = SECTION_RATE[section];
  const t = Math.max(0, Math.min(1, sectionProgress));

  // Sine wave breathing
  const breath = Math.sin(t * rate * Math.PI * 2);
  const adjustment = breath * depth * 0.12;

  return Math.max(0.88, Math.min(1.08, 1.0 + adjustment));
}

/**
 * Get breathing depth for a mood (for testing).
 */
export function breathingDepth(mood: Mood): number {
  return BREATHING_DEPTH[mood];
}
