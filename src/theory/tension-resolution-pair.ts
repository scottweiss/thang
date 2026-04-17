/**
 * Tension-resolution pair — coordinated tension → release gestures.
 *
 * Music's emotional power comes from creating and releasing tension.
 * This module tracks whether we're in a "tension" or "resolution"
 * phase and coordinates multiple parameters simultaneously:
 * during tension, brightness rises, reverb dries, FM increases;
 * during resolution, the opposite happens as a coordinated "release."
 *
 * Different from individual tension-* modules which each handle one
 * parameter — this coordinates the *timing* of the release across
 * all parameters for a satisfying "sigh" effect.
 */

import type { Mood, Section } from '../types';

export type TensionPhase = 'building' | 'sustaining' | 'releasing' | 'resolved';

/**
 * Per-mood resolution depth (how dramatic the release feels).
 */
const RESOLUTION_DEPTH: Record<Mood, number> = {
  trance:    0.40,  // dramatic drops
  avril:     0.55,  // classical release
  disco:     0.30,  // groove release
  downtempo: 0.45,  // warm release
  blockhead: 0.25,  // moderate
  lofi:      0.50,  // jazz tension/release
  flim:      0.45,  // organic
  xtal:      0.35,  // gentle release
  syro:      0.20,  // controlled
  ambient:   0.30,  // spacious release,
  plantasia: 0.30,
};

/**
 * Determine the current tension phase based on tension trajectory.
 *
 * @param currentTension Current tension level (0-1)
 * @param previousTension Previous tick's tension
 * @param mood Current mood
 * @returns Current phase
 */
export function detectPhase(
  currentTension: number,
  previousTension: number,
  mood: Mood
): TensionPhase {
  const delta = currentTension - previousTension;
  const threshold = 0.03;

  if (delta > threshold) return 'building';
  if (delta < -threshold) return 'releasing';
  if (currentTension > 0.7) return 'sustaining';
  return 'resolved';
}

/**
 * Calculate coordinated release multiplier.
 * During release phase, all timbral parameters shift toward warmth.
 *
 * @param phase Current tension phase
 * @param mood Current mood
 * @returns Release multiplier (0.7-1.3, <1 = warmer/softer)
 */
export function releaseMultiplier(phase: TensionPhase, mood: Mood): number {
  const depth = RESOLUTION_DEPTH[mood];

  switch (phase) {
    case 'building':
      return 1.0 + depth * 0.3; // brightening
    case 'sustaining':
      return 1.0 + depth * 0.1; // slight brightness
    case 'releasing':
      return 1.0 - depth * 0.4; // darkening/softening
    case 'resolved':
      return 1.0 - depth * 0.1; // slightly warm
  }
}

/**
 * Release reverb multiplier — reverb opens during resolution.
 *
 * @param phase Current tension phase
 * @param mood Current mood
 * @returns Room multiplier
 */
export function releaseReverbMultiplier(phase: TensionPhase, mood: Mood): number {
  const depth = RESOLUTION_DEPTH[mood];

  switch (phase) {
    case 'building':
      return 1.0 - depth * 0.2; // drying
    case 'sustaining':
      return 1.0;
    case 'releasing':
      return 1.0 + depth * 0.3; // opening up
    case 'resolved':
      return 1.0 + depth * 0.15;
  }
}

/**
 * Should tension-resolution coordination be applied?
 */
export function shouldApplyTensionResolution(mood: Mood): boolean {
  return RESOLUTION_DEPTH[mood] > 0.15;
}

/**
 * Get resolution depth for a mood (for testing).
 */
export function resolutionDepth(mood: Mood): number {
  return RESOLUTION_DEPTH[mood];
}
