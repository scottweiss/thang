/**
 * Timbral recall — recall effective timbral settings from earlier.
 *
 * When a section or mood produces a particularly effective timbre,
 * those FM/filter settings should be available for recall in later
 * sections to create thematic unity across the piece.
 *
 * Applied as FM/LPF bias toward previously effective values.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood recall strength (higher = more timbral consistency).
 */
const RECALL_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate — consistent sound
  avril:     0.50,  // strong — thematic unity
  disco:     0.30,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.35,  // moderate
  lofi:      0.55,  // strong — warm consistency
  flim:      0.45,  // moderate
  xtal:      0.50,  // strong — crystalline themes
  syro:      0.20,  // weak — constant variation
  ambient:   0.60,  // strongest — evolving themes
};

/**
 * Section multipliers for recall tendency.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.5,   // nothing to recall yet
  build:     0.8,   // some recall
  peak:      1.0,   // normal recall
  breakdown: 1.4,   // most recall (reflective)
  groove:    1.2,   // strong recall
};

/**
 * Calculate blend factor between current and recalled FM setting.
 *
 * @param currentFm Current FM depth
 * @param recalledFm Previously effective FM depth
 * @param mood Current mood
 * @param section Current section
 * @returns Blended FM value
 */
export function recallBlendFm(
  currentFm: number,
  recalledFm: number,
  mood: Mood,
  section: Section
): number {
  const strength = RECALL_STRENGTH[mood] * SECTION_MULT[section];
  const blend = Math.min(0.5, strength * 0.3);
  return currentFm * (1 - blend) + recalledFm * blend;
}

/**
 * Calculate blend factor between current and recalled LPF.
 *
 * @param currentLpf Current LPF value
 * @param recalledLpf Previously effective LPF value
 * @param mood Current mood
 * @param section Current section
 * @returns Blended LPF value
 */
export function recallBlendLpf(
  currentLpf: number,
  recalledLpf: number,
  mood: Mood,
  section: Section
): number {
  const strength = RECALL_STRENGTH[mood] * SECTION_MULT[section];
  const blend = Math.min(0.4, strength * 0.25);
  return currentLpf * (1 - blend) + recalledLpf * blend;
}

/**
 * Whether recall should be attempted this tick.
 *
 * @param tick Current tick
 * @param mood Current mood
 * @param section Current section
 * @returns true if recall should be applied
 */
export function shouldRecallTimbre(
  tick: number,
  mood: Mood,
  section: Section
): boolean {
  const strength = RECALL_STRENGTH[mood] * SECTION_MULT[section];
  // Only recall in later sections
  if (section === 'intro') return false;
  const hash = ((tick * 2654435761 + 741103597) >>> 0) / 4294967296;
  return hash < strength;
}

/**
 * Get recall strength for a mood (for testing).
 */
export function timbralRecallStrength(mood: Mood): number {
  return RECALL_STRENGTH[mood];
}
