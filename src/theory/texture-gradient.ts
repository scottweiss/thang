/**
 * Texture gradient — smooth interpolation of textural properties
 * at section transitions.
 *
 * While gain fading handles volume transitions (section-manager.ts),
 * texture should also evolve smoothly. A sudden jump from sparse
 * breakdown patterns to dense peak patterns sounds jarring even
 * with gain crossfading.
 *
 * This module provides interpolated values for:
 * - Note density (how many notes per bar)
 * - Rhythmic complexity (how syncopated the pattern)
 * - Harmonic richness (how many chord extensions)
 *
 * Each property smoothly interpolates between the "from" and "to"
 * section's target values during the transition window.
 */

import type { Mood, Section } from '../types';

/**
 * Target note density per section (0-1 scale).
 */
const SECTION_DENSITY: Record<Section, number> = {
  intro:     0.25,
  build:     0.60,
  peak:      0.90,
  breakdown: 0.20,
  groove:    0.70,
};

/**
 * Target rhythmic complexity per section (0-1 scale).
 */
const SECTION_COMPLEXITY: Record<Section, number> = {
  intro:     0.15,
  build:     0.50,
  peak:      0.75,
  breakdown: 0.20,
  groove:    0.60,
};

/**
 * Target harmonic richness per section (0-1 scale).
 */
const SECTION_RICHNESS: Record<Section, number> = {
  intro:     0.20,
  build:     0.50,
  peak:      0.85,
  breakdown: 0.30,
  groove:    0.65,
};

/**
 * How quickly texture transitions happen per mood.
 * Higher = faster transition (more abrupt).
 */
const TRANSITION_SPEED: Record<Mood, number> = {
  trance:    0.70,  // fast transitions for energy
  disco:     0.60,
  blockhead: 0.50,
  avril:     0.40,
  lofi:      0.35,
  downtempo: 0.30,
  flim:      0.25,
  xtal:      0.20,  // slow, dreamy transitions
  syro:      0.45,
  ambient:   0.15,  // very slow, gradual
};

/**
 * Interpolate between two section's texture properties.
 *
 * @param fromSection    Previous section
 * @param toSection      Current section
 * @param progress       Transition progress (0 = just entered, 1 = fully settled)
 * @param mood           Current mood
 * @returns Interpolated texture properties
 */
export function textureGradient(
  fromSection: Section,
  toSection: Section,
  progress: number,
  mood: Mood
): { density: number; complexity: number; richness: number } {
  const speed = TRANSITION_SPEED[mood];

  // Apply speed-adjusted easing (faster speed = steeper sigmoid)
  const t = smoothstep(progress, speed);

  return {
    density: lerp(SECTION_DENSITY[fromSection], SECTION_DENSITY[toSection], t),
    complexity: lerp(SECTION_COMPLEXITY[fromSection], SECTION_COMPLEXITY[toSection], t),
    richness: lerp(SECTION_RICHNESS[fromSection], SECTION_RICHNESS[toSection], t),
  };
}

/**
 * Density multiplier for a layer based on the gradient.
 * Adjusts the effective density parameter smoothly during transitions.
 */
export function gradientDensityMultiplier(
  fromSection: Section,
  toSection: Section,
  progress: number,
  mood: Mood
): number {
  const gradient = textureGradient(fromSection, toSection, progress, mood);
  // Convert absolute density to a multiplier around 1.0
  const targetDensity = SECTION_DENSITY[toSection];
  if (targetDensity < 0.01) return 1.0;
  return gradient.density / targetDensity;
}

/**
 * Should texture gradient be applied?
 * Only during the transition window (early section progress).
 */
export function shouldApplyGradient(
  sectionProgress: number,
  sectionChanged: boolean,
  mood: Mood
): boolean {
  // Apply during first 30% of new section (transition window)
  const window = 0.3 / TRANSITION_SPEED[mood]; // slower moods have longer windows
  return sectionProgress < Math.min(0.5, window);
}

/**
 * Get transition speed for a mood (for testing).
 */
export function transitionSpeed(mood: Mood): number {
  return TRANSITION_SPEED[mood];
}

/** Smooth interpolation with configurable steepness */
function smoothstep(t: number, steepness: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  // Adjust curve steepness
  const adjusted = Math.pow(clamped, 1.0 / (steepness + 0.5));
  return adjusted * adjusted * (3 - 2 * adjusted);
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
