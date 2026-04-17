/**
 * Dynamic articulation contrast — adjacent layers use opposing articulations.
 *
 * When melody plays legato (long notes), arp should play staccato (short).
 * When drums are sparse, harmony can sustain. This contrast creates clarity
 * and prevents layers from blurring into an undifferentiated mass.
 *
 * Applied as decay multiplier to create articulation contrast.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood contrast strength (higher = more articulation difference).
 */
const CONTRAST_STRENGTH: Record<Mood, number> = {
  trance:    0.30,  // moderate — some layers can blend
  avril:     0.55,  // strong — orchestral articulation
  disco:     0.35,  // moderate
  downtempo: 0.40,  // moderate
  blockhead: 0.45,  // strong — punchy vs sustained
  lofi:      0.50,  // strong — jazz articulation play
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.25,  // weak — IDM layers are independent
  ambient:   0.20,  // weak — everything sustains,
  plantasia: 0.20,
};

/**
 * Layer articulation roles (tendency toward short or long).
 */
const LAYER_TENDENCY: Record<string, number> = {
  drone:      1.0,   // always sustained
  harmony:    0.7,   // usually sustained
  melody:     0.5,   // variable
  texture:    0.2,   // usually short (drums)
  arp:        0.3,   // usually short
  atmosphere: 0.9,   // usually sustained
};

/**
 * Calculate decay multiplier for articulation contrast.
 * Layers that are naturally short get shorter when partners are long, and vice versa.
 *
 * @param layerName This layer
 * @param activeLayerNames All active layer names
 * @param mood Current mood
 * @returns Decay multiplier (0.7 - 1.4)
 */
export function articulationContrastDecay(
  layerName: string,
  activeLayerNames: string[],
  mood: Mood
): number {
  const strength = CONTRAST_STRENGTH[mood];
  const myTendency = LAYER_TENDENCY[layerName] ?? 0.5;
  // Average tendency of other layers
  const others = activeLayerNames.filter(n => n !== layerName);
  if (others.length === 0) return 1.0;
  const avgOther = others.reduce((sum, n) => sum + (LAYER_TENDENCY[n] ?? 0.5), 0) / others.length;
  // Push this layer away from the average
  const contrast = (myTendency - avgOther) * strength;
  // Positive = more sustained, negative = more staccato
  return Math.max(0.7, Math.min(1.4, 1.0 + contrast * 0.4));
}

/**
 * Get contrast strength for a mood (for testing).
 */
export function articulationContrastStrength(mood: Mood): number {
  return CONTRAST_STRENGTH[mood];
}
