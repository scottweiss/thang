/**
 * Voicing density — chord note count tracks tension dynamically.
 *
 * At low tension: thin voicings (2-3 notes) — open, transparent
 * At medium tension: standard triads (3-4 notes)
 * At high tension: rich voicings (4-6 notes) with extensions
 *
 * This creates a satisfying textural arc where the harmonic
 * texture thickens as energy builds, complementing the existing
 * harmonic density module which focuses on chord quality (triads
 * vs 7ths vs 9ths). This module focuses on the actual number
 * of sounding voices.
 *
 * Also considers section: breakdowns thin out, peaks fill up.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to voicing density changes.
 * Higher = more dramatic density variation with tension.
 */
const DENSITY_SENSITIVITY: Record<Mood, number> = {
  trance:    0.55,  // big contrast: thin breakdown → thick peak
  avril:     0.50,  // dramatic textural arc
  disco:     0.45,  // full sound at peaks
  blockhead: 0.35,  // moderate variation
  downtempo: 0.30,  // some variation
  lofi:      0.25,  // subtle
  flim:      0.20,  // organic
  xtal:      0.15,  // dreamy — consistently sparse
  syro:      0.12,  // IDM — density is independent
  ambient:   0.08,  // minimal variation — always sparse
};

/**
 * Section base voice count.
 */
const SECTION_VOICES: Record<Section, number> = {
  intro:     2.5,
  build:     3.5,
  peak:      4.5,
  breakdown: 2.0,
  groove:    3.5,
};

/**
 * Calculate the target number of voices for the current state.
 *
 * @param mood      Current mood
 * @param section   Current section
 * @param tension   Current tension (0-1)
 * @returns Target voice count (2-6)
 */
export function targetVoiceCount(
  mood: Mood,
  section: Section,
  tension: number
): number {
  const sensitivity = DENSITY_SENSITIVITY[mood];
  const sectionBase = SECTION_VOICES[section];

  // Tension adds voices
  const tensionVoices = tension * sensitivity * 3;

  const raw = sectionBase + tensionVoices;
  return Math.max(2, Math.min(6, Math.round(raw)));
}

/**
 * Thin a chord voicing to a target number of notes.
 * Removes inner voices first, keeping root and highest note.
 *
 * @param notes   Chord notes (with octave, e.g., 'C3', 'E3', 'G3')
 * @param target  Target number of notes
 * @returns Thinned voicing
 */
export function thinVoicing(notes: string[], target: number): string[] {
  if (notes.length <= target) return [...notes];

  const result = [...notes];
  // Always keep first (bass) and last (soprano)
  while (result.length > target && result.length > 2) {
    // Remove innermost voice (middle of the voicing)
    const midIdx = Math.floor(result.length / 2);
    result.splice(midIdx, 1);
  }

  return result;
}

/**
 * Should voicing density be applied?
 */
export function shouldApplyVoicingDensity(mood: Mood): boolean {
  return DENSITY_SENSITIVITY[mood] > 0.1;
}

/**
 * Get density sensitivity for a mood (for testing).
 */
export function densitySensitivity(mood: Mood): number {
  return DENSITY_SENSITIVITY[mood];
}
