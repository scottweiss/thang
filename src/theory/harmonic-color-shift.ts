/**
 * Harmonic color shift — chord quality influences LPF warmth.
 *
 * Minor chords naturally sound darker and benefit from a warmer
 * (lower) LPF. Major chords sound brighter. Diminished chords
 * are cold and metallic. This timbral coloring reinforces the
 * emotional character of each harmony.
 */

import type { Mood, ChordQuality } from '../types';

/**
 * Per-mood color sensitivity (higher = more LPF variation by quality).
 */
const COLOR_SENSITIVITY: Record<Mood, number> = {
  trance:    0.35,  // moderate
  avril:     0.55,  // high — dramatic color
  disco:     0.30,  // low — consistent
  downtempo: 0.50,  // high
  blockhead: 0.30,  // low
  lofi:      0.60,  // highest — rich color
  flim:      0.50,  // high
  xtal:      0.45,  // moderate
  syro:      0.25,  // low — color is random
  ambient:   0.55,  // high — atmospheric color
};

/**
 * Quality warmth mapping (-1 = cold/dark, 0 = neutral, 1 = warm/bright).
 */
const QUALITY_COLOR: Record<ChordQuality, number> = {
  maj:   0.3,
  min:  -0.4,
  maj7:  0.5,
  min7: -0.3,
  dom7:  0.2,
  sus2:  0.0,
  sus4: -0.1,
  add9:  0.4,
  min9: -0.2,
  dim:  -0.7,
  aug:   0.1,
};

/**
 * Calculate color shift LPF multiplier.
 *
 * @param quality Current chord quality
 * @param mood Current mood
 * @returns LPF multiplier (0.85 - 1.12)
 */
export function colorShiftLpf(
  quality: ChordQuality,
  mood: Mood
): number {
  const sensitivity = COLOR_SENSITIVITY[mood];
  const color = QUALITY_COLOR[quality] ?? 0;

  const shift = color * sensitivity * 0.30;
  return Math.max(0.85, Math.min(1.12, 1.0 + shift));
}

/**
 * Get color sensitivity for a mood (for testing).
 */
export function colorSensitivity(mood: Mood): number {
  return COLOR_SENSITIVITY[mood];
}
