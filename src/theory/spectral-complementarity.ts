/**
 * Spectral complementarity — layers fill each other's spectral gaps.
 *
 * When one layer is bright (high harmonics), others should be warm (low).
 * This prevents spectral overcrowding and creates a richer combined sound.
 * The principle: if layer A has strong overtones at 2kHz+, layer B should
 * emphasize fundamentals below 500Hz.
 *
 * Applied as LPF/HPF correction per layer.
 */

import type { Mood } from '../types';

/**
 * Per-mood complementarity strength (higher = more spectral separation).
 */
const COMPLEMENTARITY: Record<Mood, number> = {
  trance:    0.35,  // moderate — some spectral overlap OK for power
  avril:     0.50,  // strong — orchestral clarity
  disco:     0.30,  // moderate
  downtempo: 0.45,  // strong
  blockhead: 0.40,  // moderate
  lofi:      0.55,  // strong — jazz separation
  flim:      0.45,  // strong
  xtal:      0.50,  // strong — ambient clarity
  syro:      0.30,  // moderate — IDM lets things clash
  ambient:   0.60,  // strongest — pristine separation,
  plantasia: 0.60,
};

/**
 * Layer spectral roles.
 */
type SpectralRole = 'warm' | 'mid' | 'bright';

const LAYER_ROLE: Record<string, SpectralRole> = {
  drone: 'warm',
  harmony: 'mid',
  melody: 'bright',
  texture: 'mid',
  arp: 'bright',
  atmosphere: 'warm',
};

/**
 * Calculate LPF adjustment for spectral complementarity.
 *
 * @param layerName Layer name
 * @param otherLayers Names of other active layers
 * @param mood Current mood
 * @returns LPF multiplier (0.85 - 1.15)
 */
export function complementaryLpf(
  layerName: string,
  otherLayers: string[],
  mood: Mood
): number {
  const strength = COMPLEMENTARITY[mood];
  const myRole = LAYER_ROLE[layerName] ?? 'mid';
  // Count how many other layers share our role
  const sameRole = otherLayers.filter(l => (LAYER_ROLE[l] ?? 'mid') === myRole).length;
  if (sameRole === 0) return 1.0; // no competition
  // More same-role layers = more correction needed
  const correction = sameRole * strength * 0.08;
  if (myRole === 'bright') return 1.0 + correction; // open up
  if (myRole === 'warm') return 1.0 - correction;   // close down
  return 1.0; // mid stays neutral
}

/**
 * Calculate HPF adjustment for spectral complementarity.
 *
 * @param layerName Layer name
 * @param otherLayers Names of other active layers
 * @param mood Current mood
 * @returns HPF multiplier (0.85 - 1.15)
 */
export function complementaryHpf(
  layerName: string,
  otherLayers: string[],
  mood: Mood
): number {
  const strength = COMPLEMENTARITY[mood];
  const myRole = LAYER_ROLE[layerName] ?? 'mid';
  const sameRole = otherLayers.filter(l => (LAYER_ROLE[l] ?? 'mid') === myRole).length;
  if (sameRole === 0) return 1.0;
  const correction = sameRole * strength * 0.08;
  if (myRole === 'warm') return 1.0 - correction;   // lower HPF for bass
  if (myRole === 'bright') return 1.0 + correction;  // raise HPF to clear bass
  return 1.0;
}

/**
 * Get complementarity strength for a mood (for testing).
 */
export function complementarityStrength(mood: Mood): number {
  return COMPLEMENTARITY[mood];
}
