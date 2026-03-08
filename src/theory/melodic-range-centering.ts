/**
 * Melodic range centering — keep melody in the sweet spot.
 *
 * Each instrument/layer has an ideal register range where it
 * sounds best. Melodies that stay near the center of their
 * range sound more natural. This module provides a gentle
 * gain correction that favors the sweet spot.
 */

import type { Mood } from '../types';

/**
 * Per-mood centering strength (higher = more pull toward center).
 */
const CENTERING_STRENGTH: Record<Mood, number> = {
  trance:    0.40,  // moderate
  avril:     0.50,  // high — vocal-like centering
  disco:     0.35,  // moderate
  downtempo: 0.45,  // moderate
  blockhead: 0.30,  // low — raw register
  lofi:      0.55,  // high — sweet spot important
  flim:      0.45,  // moderate
  xtal:      0.40,  // moderate
  syro:      0.25,  // low — register freedom
  ambient:   0.35,  // moderate
};

/**
 * Layer ideal center MIDI note.
 */
const LAYER_CENTER: Record<string, number> = {
  melody:    67,  // G4 — vocal sweet spot
  arp:       72,  // C5 — bright arp range
  harmony:   60,  // C4 — middle piano
  drone:     48,  // C3 — bass range
};

/**
 * Calculate range centering gain.
 *
 * @param currentMidi Current MIDI note
 * @param layerName Layer name
 * @param mood Current mood
 * @returns Gain multiplier (0.92 - 1.04)
 */
export function rangeCenteringGain(
  currentMidi: number,
  layerName: string,
  mood: Mood
): number {
  const strength = CENTERING_STRENGTH[mood];
  const center = LAYER_CENTER[layerName] ?? 64;

  // Distance from center in octaves
  const distance = Math.abs(currentMidi - center) / 12;

  // Gentle penalty for distance from center
  if (distance <= 0.5) return 1.0 + distance * strength * 0.04;

  const excess = distance - 0.5;
  const adjustment = -excess * strength * 0.10;
  return Math.max(0.92, Math.min(1.04, 1.0 + adjustment));
}

/**
 * Get centering strength for a mood (for testing).
 */
export function centeringStrength(mood: Mood): number {
  return CENTERING_STRENGTH[mood];
}
