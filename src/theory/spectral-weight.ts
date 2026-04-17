/**
 * Spectral weight distribution — perceived heaviness/lightness of the mix.
 *
 * Models the center of mass of frequency content across sections.
 * Builds shift the center upward (brighter, lighter), breakdowns
 * shift downward (darker, heavier). Creates perceived dynamics
 * independent of volume.
 *
 * Applied as HPF/LPF bias to shift the spectral center.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood base spectral weight (0=light/bright, 1=heavy/dark).
 */
const SPECTRAL_WEIGHT: Record<Mood, number> = {
  trance:    0.45,  // centered
  avril:     0.40,  // bright classical
  disco:     0.52,  // bass-led
  downtempo: 0.50,  // floating mid
  blockhead: 0.62,  // punchy bass
  lofi:      0.55,  // warm bass
  flim:      0.48,  // organic blend
  xtal:      0.38,  // crystalline high
  syro:      0.58,  // dark subharmonic
  ambient:   0.35,  // light airy,
  plantasia: 0.35,
};

/**
 * Section weight offset (positive = heavier, negative = lighter).
 */
const SECTION_OFFSET: Record<Section, number> = {
  intro:     -0.05,  // slightly bright
  build:     -0.10,  // brighten during builds
  peak:      0.0,    // neutral — full range
  breakdown: 0.10,   // darker, heavier
  groove:    0.05,   // slightly warm
};

/**
 * Calculate spectral weight for current state.
 *
 * @param mood Current mood
 * @param section Current section
 * @param sectionProgress 0-1 progress through section
 * @returns Weight 0-1 (0=bright, 1=dark)
 */
export function spectralWeight(
  mood: Mood,
  section: Section,
  sectionProgress: number
): number {
  const base = SPECTRAL_WEIGHT[mood];
  const offset = SECTION_OFFSET[section];
  // Weight shifts gradually through section
  const shifted = base + offset * sectionProgress;
  return Math.max(0, Math.min(1, shifted));
}

/**
 * LPF multiplier based on spectral weight.
 * Heavier = lower LPF (darker), lighter = higher LPF (brighter).
 *
 * @param weight 0-1 from spectralWeight()
 * @param mood Current mood
 * @returns LPF multiplier (0.85 - 1.15)
 */
export function weightLpfMultiplier(
  weight: number,
  mood: Mood
): number {
  const strength = SPECTRAL_WEIGHT[mood];
  // Center at 0.5 weight = 1.0 multiplier
  const deviation = weight - 0.5;
  return Math.max(0.85, Math.min(1.15, 1.0 - deviation * strength * 0.5));
}

/**
 * HPF multiplier based on spectral weight.
 * Lighter = higher HPF (remove low mud), heavier = lower HPF (allow bass).
 *
 * @param weight 0-1 from spectralWeight()
 * @param mood Current mood
 * @returns HPF multiplier (0.8 - 1.2)
 */
export function weightHpfMultiplier(
  weight: number,
  mood: Mood
): number {
  const strength = SPECTRAL_WEIGHT[mood];
  const deviation = 0.5 - weight; // inverted — lighter = higher HPF
  return Math.max(0.8, Math.min(1.2, 1.0 + deviation * strength * 0.4));
}

/**
 * Should spectral weight adjustment be applied?
 */
export function shouldApplyWeight(mood: Mood, section: Section): boolean {
  return Math.abs(SECTION_OFFSET[section]) > 0.02;
}

/**
 * Get base spectral weight for a mood (for testing).
 */
export function baseWeight(mood: Mood): number {
  return SPECTRAL_WEIGHT[mood];
}
