/**
 * Textural contrast — ensure simultaneous layers have complementary
 * articulation characters rather than all sounding the same.
 *
 * When multiple layers play together, musical interest comes from
 * textural variety: one sustained pad, one rhythmic pluck, one
 * melodic line. If all layers have similar attack/decay/sustain,
 * they blur into an undifferentiated mass.
 *
 * This module assigns "textural roles" to active layers and adjusts
 * their ADSR envelopes to create contrast:
 *
 * Roles:
 * - **Sustain** (pad): long attack, high sustain, long release
 * - **Rhythmic** (pluck/stab): short attack, short decay, low sustain
 * - **Melodic** (singing): moderate attack, moderate sustain
 * - **Anchor** (drone): very long everything, barely changes
 *
 * The assignment is mood-aware — jazz moods prefer more rhythmic
 * contrast, ambient moods prefer sustained textures throughout.
 */

import type { Mood, Section } from '../types';

export type TexturalRole = 'sustain' | 'rhythmic' | 'melodic' | 'anchor';

/** Default textural role assignment per layer */
const DEFAULT_ROLES: Record<string, TexturalRole> = {
  drone:      'anchor',
  harmony:    'sustain',
  melody:     'melodic',
  texture:    'rhythmic',
  arp:        'rhythmic',
  atmosphere: 'sustain',
};

/** How strongly to enforce textural contrast per mood (0-1) */
const CONTRAST_STRENGTH: Record<Mood, number> = {
  syro:      0.55,   // IDM loves textural variety
  disco:     0.50,   // funky contrast
  blockhead: 0.45,   // hip-hop layering
  lofi:      0.40,   // jazz texture
  trance:    0.40,   // pad vs pluck contrast
  downtempo: 0.35,   // smooth but varied
  flim:      0.30,   // delicate contrast
  avril:     0.25,   // intimate subtlety
  xtal:      0.20,   // dreamy, less contrast
  ambient:   0.10,   // everything sustains,
  plantasia: 0.10,
};

/** Section modifies contrast (peaks want more contrast, breakdowns less) */
const SECTION_CONTRAST_MULT: Record<Section, number> = {
  intro:     0.7,
  build:     1.0,
  peak:      1.3,
  breakdown: 0.6,
  groove:    1.1,
};

/** ADSR multipliers per textural role */
const ROLE_ENVELOPE: Record<TexturalRole, {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}> = {
  anchor:   { attack: 1.5,  decay: 1.3,  sustain: 1.3,  release: 1.4 },
  sustain:  { attack: 1.2,  decay: 1.1,  sustain: 1.15, release: 1.2 },
  melodic:  { attack: 0.95, decay: 0.9,  sustain: 0.9,  release: 0.95 },
  rhythmic: { attack: 0.7,  decay: 0.6,  sustain: 0.6,  release: 0.7 },
};

/**
 * Get the textural role for a layer.
 * Can be overridden by section context (e.g., harmony becomes rhythmic
 * when comping is active).
 *
 * @param layerName  Layer name
 * @param section    Current section
 * @param mood       Current mood
 * @returns Textural role for the layer
 */
export function layerTexturalRole(
  layerName: string,
  section: Section,
  mood: Mood
): TexturalRole {
  const base = DEFAULT_ROLES[layerName] ?? 'melodic';

  // At peaks with high contrast, harmony shifts from sustain to rhythmic
  // (comping stabs instead of pads)
  if (layerName === 'harmony' && section === 'peak' &&
      CONTRAST_STRENGTH[mood] >= 0.35) {
    return 'rhythmic';
  }

  // In breakdowns, arp shifts from rhythmic to melodic (more sustained arps)
  if (layerName === 'arp' && section === 'breakdown') {
    return 'melodic';
  }

  return base;
}

/**
 * Compute ADSR envelope multipliers for a layer based on its textural role.
 * Returns multipliers that should be applied to the layer's base ADSR.
 *
 * @param layerName    Layer name
 * @param section      Current section
 * @param mood         Current mood
 * @param activeLayers Set of active layer names
 * @returns ADSR multipliers { attack, decay, sustain, release }
 */
export function texturalEnvelopeMultipliers(
  layerName: string,
  section: Section,
  mood: Mood,
  activeLayers: Set<string>
): { attack: number; decay: number; sustain: number; release: number } {
  const neutral = { attack: 1.0, decay: 1.0, sustain: 1.0, release: 1.0 };

  // Need at least 2 layers for contrast to matter
  if (activeLayers.size < 2) return neutral;

  const strength = CONTRAST_STRENGTH[mood] * (SECTION_CONTRAST_MULT[section] ?? 1.0);
  if (strength < 0.05) return neutral;

  const role = layerTexturalRole(layerName, section, mood);
  const roleEnv = ROLE_ENVELOPE[role];

  // Blend between neutral (1.0) and role envelope based on strength
  return {
    attack:  1.0 + (roleEnv.attack - 1.0) * strength,
    decay:   1.0 + (roleEnv.decay - 1.0) * strength,
    sustain: 1.0 + (roleEnv.sustain - 1.0) * strength,
    release: 1.0 + (roleEnv.release - 1.0) * strength,
  };
}

/**
 * Whether textural contrast should be applied.
 */
export function shouldApplyTexturalContrast(
  mood: Mood,
  activeLayers: Set<string>
): boolean {
  return activeLayers.size >= 2 && CONTRAST_STRENGTH[mood] >= 0.1;
}

/**
 * Get contrast strength for a mood (for testing).
 */
export function texturalContrastStrength(mood: Mood): number {
  return CONTRAST_STRENGTH[mood];
}
