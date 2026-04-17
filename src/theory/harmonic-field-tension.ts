/**
 * Harmonic field tension — distance from tonal center modulates expression.
 *
 * Notes and chords farther from the tonal center in pitch-class space
 * create more tension. This module quantifies that distance and converts
 * it to gain/color modulation, making remote harmonies feel distinct
 * from home-key material.
 *
 * Applied as gain/LPF multiplier based on harmonic remoteness.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood sensitivity to harmonic field distance.
 */
const FIELD_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate — clear harmonic structure
  avril:     0.50,  // strong — dramatic harmonic color
  disco:     0.20,  // weak — stays close to home
  downtempo: 0.40,  // moderate
  blockhead: 0.30,  // moderate
  lofi:      0.45,  // strong — jazz chromaticism
  flim:      0.40,  // moderate
  xtal:      0.55,  // strong — crystalline harmonic color
  syro:      0.25,  // weak — all distances equal
  ambient:   0.60,  // strongest — color is everything,
  plantasia: 0.60,
};

/**
 * Section multipliers for field tension sensitivity.
 */
const SECTION_MULT: Record<Section, number> = {
  intro:     0.7,   // gentle in intro
  build:     1.0,   // normal
  peak:      1.3,   // most sensitive at peak
  breakdown: 0.8,   // relaxed
  groove:    1.1,   // slightly elevated
};

/**
 * Circle of fifths distance between two pitch classes.
 * Measures harmonic remoteness (0 = same, 6 = tritone = farthest).
 */
export function fifthsDistance(pc1: number, pc2: number): number {
  // Map to circle of fifths position
  const cofOrder = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  const pos1 = cofOrder.indexOf(((pc1 % 12) + 12) % 12);
  const pos2 = cofOrder.indexOf(((pc2 % 12) + 12) % 12);
  const dist = Math.abs(pos1 - pos2);
  return Math.min(dist, 12 - dist);
}

/**
 * Calculate gain multiplier based on harmonic field distance.
 * Remote harmonies get slight boost for emphasis, very remote get reduced.
 *
 * @param rootPc Current chord root pitch class (0-11)
 * @param tonicPc Tonal center pitch class (0-11)
 * @param mood Current mood
 * @param section Current section
 * @returns Gain multiplier (0.85 - 1.15)
 */
export function fieldTensionGain(
  rootPc: number,
  tonicPc: number,
  mood: Mood,
  section: Section
): number {
  const dist = fifthsDistance(rootPc, tonicPc);
  const sensitivity = FIELD_SENSITIVITY[mood] * SECTION_MULT[section];
  // Near (0-2): slight reduction (familiar), Mid (3-4): boost (interesting),
  // Far (5-6): reduction (too remote)
  let modifier: number;
  if (dist <= 2) {
    modifier = -0.05 * dist; // familiar = slightly quieter
  } else if (dist <= 4) {
    modifier = 0.08 * (dist - 2); // interesting = boosted
  } else {
    modifier = 0.16 - 0.06 * (dist - 4); // remote = pulling back
  }
  return Math.max(0.85, Math.min(1.15, 1.0 + modifier * sensitivity));
}

/**
 * Calculate LPF multiplier — remote harmonies get brighter for distinction.
 *
 * @param rootPc Current chord root pitch class (0-11)
 * @param tonicPc Tonal center pitch class (0-11)
 * @param mood Current mood
 * @returns LPF multiplier (0.95 - 1.15)
 */
export function fieldTensionBrightness(
  rootPc: number,
  tonicPc: number,
  mood: Mood
): number {
  const dist = fifthsDistance(rootPc, tonicPc);
  const sensitivity = FIELD_SENSITIVITY[mood];
  // Farther = brighter (more harmonics for distinction)
  const brightnessBoost = (dist / 6) * 0.15 * sensitivity;
  return Math.max(0.95, Math.min(1.15, 1.0 + brightnessBoost));
}

/**
 * Get field sensitivity for a mood (for testing).
 */
export function fieldSensitivity(mood: Mood): number {
  return FIELD_SENSITIVITY[mood];
}
