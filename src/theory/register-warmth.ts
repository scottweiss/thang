/**
 * Register warmth — filter response based on pitch register.
 *
 * Low notes should sound warm (lower LPF, more body), high notes
 * should sound bright (higher LPF, less FM). This creates natural
 * timbral variation tied to register, like how a piano sounds
 * darker in the bass and brighter in the treble.
 *
 * Applied as LPF and FM multipliers per note based on MIDI pitch.
 */

import type { Mood } from '../types';

/**
 * Per-mood register sensitivity.
 * Higher = more dramatic timbral change across registers.
 */
const REGISTER_SENSITIVITY: Record<Mood, number> = {
  trance:    0.20,  // mostly uniform
  avril:     0.50,  // piano-like range
  disco:     0.25,  // groove consistency
  downtempo: 0.40,  // warm bass, bright highs
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // maximum warmth variation
  flim:      0.45,  // organic timbral range
  xtal:      0.35,  // gentle variation
  syro:      0.15,  // uniform electronic
  ambient:   0.40,  // warm, spacious,
  plantasia: 0.40,
};

/**
 * Calculate LPF multiplier based on register.
 * Low notes = lower LPF (warmer), high notes = higher LPF (brighter).
 *
 * @param midi MIDI note number
 * @param mood Current mood
 * @returns LPF multiplier (0.6-1.4)
 */
export function registerLpfMultiplier(midi: number, mood: Mood): number {
  const sensitivity = REGISTER_SENSITIVITY[mood];
  // Center around middle C (60)
  const deviation = (midi - 60) / 24; // normalized to ±1 over 2 octaves
  return 1.0 + deviation * sensitivity * 0.4;
}

/**
 * Calculate FM depth multiplier based on register.
 * Low notes = more FM (richer harmonics), high notes = less FM (purer).
 *
 * @param midi MIDI note number
 * @param mood Current mood
 * @returns FM multiplier (0.5-1.5)
 */
export function registerFmMultiplier(midi: number, mood: Mood): number {
  const sensitivity = REGISTER_SENSITIVITY[mood];
  // Inverse of LPF — low notes richer, high notes purer
  const deviation = (midi - 60) / 24;
  return 1.0 - deviation * sensitivity * 0.3;
}

/**
 * Should register warmth be applied?
 */
export function shouldApplyRegisterWarmth(mood: Mood): boolean {
  return REGISTER_SENSITIVITY[mood] > 0.18;
}

/**
 * Get register sensitivity for a mood (for testing).
 */
export function registerSensitivity(mood: Mood): number {
  return REGISTER_SENSITIVITY[mood];
}
