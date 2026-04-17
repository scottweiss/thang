/**
 * Articulation coupling — coordinated attack/decay character.
 *
 * When melody plays staccato, the accompaniment should either
 * match (tight, punchy ensemble) or deliberately contrast
 * (legato pad under staccato melody). This module coordinates
 * articulation character across layers for intentional texture.
 *
 * "Coupling" means layers share articulation. "Contrast" means
 * they deliberately differ.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood coupling strength (0-1).
 * Higher = layers tend to match articulation.
 * Lower = layers tend to contrast.
 */
const COUPLING_STRENGTH: Record<Mood, number> = {
  trance:    0.65,  // tight, synchronized
  avril:     0.40,  // moderate
  disco:     0.55,  // groove-locked
  downtempo: 0.30,  // contrasting textures
  blockhead: 0.50,  // tight but varied
  lofi:      0.25,  // jazz — maximum textural contrast
  flim:      0.30,  // organic variety
  xtal:      0.20,  // floating, independent
  syro:      0.15,  // deliberate contrast
  ambient:   0.10,  // maximum textural variety,
  plantasia: 0.10,
};

/**
 * Section multiplier for coupling.
 */
const SECTION_COUPLING: Record<Section, number> = {
  intro:     1.2,   // unified sound
  build:     1.0,   // normal
  peak:      1.3,   // tight ensemble
  breakdown: 0.6,   // loose, breathing
  groove:    1.1,   // locked in
};

/** Articulation character types. */
export type ArticulationChar = 'staccato' | 'legato' | 'marcato' | 'tenuto';

/**
 * Determine the lead layer's articulation character from its decay.
 *
 * @param decay Decay time in seconds
 * @returns Articulation character
 */
export function classifyArticulation(decay: number): ArticulationChar {
  if (decay < 0.1) return 'staccato';
  if (decay < 0.3) return 'marcato';
  if (decay < 0.8) return 'tenuto';
  return 'legato';
}

/**
 * Calculate the target decay for a following layer based on
 * the lead layer's articulation and coupling strength.
 *
 * @param leadDecay Lead layer's decay time
 * @param followerBaseDecay Follower's natural decay time
 * @param mood Current mood
 * @param section Current section
 * @returns Target decay for the follower
 */
export function coupledDecay(
  leadDecay: number,
  followerBaseDecay: number,
  mood: Mood,
  section: Section
): number {
  const coupling = COUPLING_STRENGTH[mood] * SECTION_COUPLING[section];

  // High coupling: follower matches lead's decay
  // Low coupling: follower keeps its own decay (or inverts)
  if (coupling > 0.5) {
    // Match: interpolate toward lead
    return followerBaseDecay + (leadDecay - followerBaseDecay) * (coupling - 0.5) * 2;
  }

  // Contrast: when coupling is low, push follower away from lead
  // If lead is staccato, follower becomes more legato, and vice versa
  const contrast = 0.5 - coupling;
  if (leadDecay < 0.3) {
    // Lead is short → follower gets longer
    return followerBaseDecay * (1 + contrast);
  }
  // Lead is long → follower gets shorter
  return followerBaseDecay * (1 - contrast * 0.5);
}

/**
 * Should articulation coupling be applied?
 *
 * @param mood Current mood
 * @param activeLayerCount Number of active layers
 * @returns Whether to apply
 */
export function shouldCoupleArticulation(mood: Mood, activeLayerCount: number): boolean {
  if (activeLayerCount < 2) return false;
  return true; // always useful with 2+ layers
}

/**
 * Get coupling strength for a mood (for testing).
 */
export function couplingStrength(mood: Mood): number {
  return COUPLING_STRENGTH[mood];
}
