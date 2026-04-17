/**
 * Timbral brightness arc — brightness evolves in arc within sections.
 *
 * Sections tend to start muted, brighten in the middle, and
 * soften at the end. This creates a natural "opening up" effect
 * that mirrors the harmonic and dynamic arc.
 *
 * Applied as LPF modulation that follows a section-phase arc.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood brightness arc depth (higher = more LPF variation).
 */
const ARC_DEPTH: Record<Mood, number> = {
  trance:    0.45,  // moderate — synth brightness
  avril:     0.55,  // high — orchestral dynamics
  disco:     0.40,  // moderate — consistent brightness
  downtempo: 0.50,  // high — evolving warmth
  blockhead: 0.35,  // moderate — gritty consistency
  lofi:      0.60,  // highest — tape-like darkening
  flim:      0.55,  // high — delicate shifts
  xtal:      0.50,  // high — glassy evolution
  syro:      0.30,  // low — brightness is chaotic
  ambient:   0.65,  // highest — slow bloom,
  plantasia: 0.65,
};

/**
 * Section brightness peak position.
 */
const SECTION_PEAK: Record<Section, number> = {
  intro:     0.6,
  build:     0.8,
  peak:      0.5,
  breakdown: 0.4,
  groove:    0.5,
};

/**
 * Calculate brightness arc LPF multiplier.
 *
 * @param sectionProgress Progress through section (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns LPF multiplier (0.80 - 1.15, where > 1 = brighter)
 */
export function brightnessArcLpf(
  sectionProgress: number,
  mood: Mood,
  section: Section
): number {
  const depth = ARC_DEPTH[mood];
  const peak = SECTION_PEAK[section];
  const t = Math.max(0, Math.min(1, sectionProgress));

  // Bell curve centered at peak
  const distance = Math.abs(t - peak);
  const curve = Math.exp(-distance * distance * 6);

  // Map: at peak = bright (>1), at edges = dark (<1)
  const multiplier = 1.0 + (curve - 0.5) * depth * 0.40;
  return Math.max(0.80, Math.min(1.15, multiplier));
}

/**
 * Get arc depth for a mood (for testing).
 */
export function arcDepth(mood: Mood): number {
  return ARC_DEPTH[mood];
}
