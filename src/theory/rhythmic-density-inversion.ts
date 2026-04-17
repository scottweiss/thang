/**
 * Rhythmic density inversion — melody/arp density inversely correlates.
 *
 * When melody is dense (many notes), arp should thin out to avoid
 * clutter. When melody rests, arp can fill the space. This creates
 * a natural call-and-response texture.
 */

import type { Mood } from '../types';

/**
 * Per-mood inversion strength (higher = more inverse correlation).
 */
const INVERSION_STRENGTH: Record<Mood, number> = {
  trance:    0.35,  // moderate — both can be dense
  avril:     0.50,  // high — orchestral clarity
  disco:     0.30,  // low — both groove together
  downtempo: 0.55,  // high — careful balance
  blockhead: 0.45,  // moderate
  lofi:      0.60,  // highest — intimate interplay
  flim:      0.55,  // high — delicate hocket
  xtal:      0.50,  // moderate
  syro:      0.40,  // moderate
  ambient:   0.35,  // moderate — both sparse anyway,
  plantasia: 0.35,
};

/**
 * Calculate density inversion gain for the secondary layer.
 * When primary is dense, secondary thins.
 *
 * @param primaryDensity Primary layer density (0-1)
 * @param mood Current mood
 * @returns Gain multiplier for secondary layer (0.80 - 1.10)
 */
export function densityInversionGain(
  primaryDensity: number,
  mood: Mood
): number {
  const strength = INVERSION_STRENGTH[mood];
  const density = Math.max(0, Math.min(1, primaryDensity));

  // High primary density = reduce secondary
  // Low primary density = boost secondary
  const adjustment = (0.5 - density) * strength * 0.35;
  return Math.max(0.80, Math.min(1.10, 1.0 + adjustment));
}

/**
 * Get inversion strength for a mood (for testing).
 */
export function inversionStrength(mood: Mood): number {
  return INVERSION_STRENGTH[mood];
}
