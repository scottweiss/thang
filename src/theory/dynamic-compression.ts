/**
 * Dynamic compression — musical compression by section character.
 *
 * Musical dynamics need controlled range — too much variation is chaotic,
 * too little is flat. This module provides section-aware gain compression
 * that preserves musical dynamics while preventing extremes.
 *
 * Applied as gain scaling toward a target dynamic range.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood compression ratio (higher = more compressed/consistent).
 */
const COMPRESSION_RATIO: Record<Mood, number> = {
  trance:    0.55,  // moderate — some dynamics
  avril:     0.35,  // weak — wide dynamics
  disco:     0.60,  // strong — consistent energy
  downtempo: 0.40,  // moderate
  blockhead: 0.65,  // strongest — punchy/consistent
  lofi:      0.45,  // moderate — some dynamics
  flim:      0.30,  // weak — wide dynamics
  xtal:      0.35,  // weak — crystalline dynamics
  syro:      0.50,  // moderate
  ambient:   0.25,  // weakest — widest dynamics
};

/**
 * Section-specific target gain centers (normalized).
 */
const SECTION_TARGET: Record<Section, number> = {
  intro:     0.5,   // quiet
  build:     0.65,  // rising
  peak:      0.85,  // loud
  breakdown: 0.45,  // quiet
  groove:    0.75,  // strong
};

/**
 * Calculate compressed gain value.
 * Pulls gain toward section target by compression ratio.
 *
 * @param currentGain Current gain value (0-1)
 * @param mood Current mood
 * @param section Current section
 * @returns Compressed gain value (0.1 - 1.0)
 */
export function compressedGain(
  currentGain: number,
  mood: Mood,
  section: Section
): number {
  const ratio = COMPRESSION_RATIO[mood];
  const target = SECTION_TARGET[section];
  // Blend toward target by ratio
  const compressed = currentGain * (1 - ratio * 0.4) + target * ratio * 0.4;
  return Math.max(0.1, Math.min(1.0, compressed));
}

/**
 * Calculate gain multiplier to apply compression.
 *
 * @param currentGain Current gain value
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.6 - 1.4)
 */
export function compressionMultiplier(
  currentGain: number,
  mood: Mood,
  section: Section
): number {
  if (currentGain < 0.01) return 1.0;
  const target = compressedGain(currentGain, mood, section);
  return Math.max(0.6, Math.min(1.4, target / currentGain));
}

/**
 * Get compression ratio for a mood (for testing).
 */
export function compressionRatio(mood: Mood): number {
  return COMPRESSION_RATIO[mood];
}
