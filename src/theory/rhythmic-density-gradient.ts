/**
 * Rhythmic density gradient — density changes propagate across layers.
 *
 * When one layer increases density (e.g. drums shift from quarter to eighth),
 * adjacent layers should respond: either increase sympathetically or
 * decrease to create space. This prevents density collisions where
 * all layers get busy simultaneously.
 *
 * Applied as a degradeBy correction based on neighbor density.
 */

import type { Mood, Section } from '../types';

/**
 * Per-mood gradient coupling (higher = layers respond more to each other's density).
 */
const GRADIENT_COUPLING: Record<Mood, number> = {
  trance:    0.40,  // moderate — coordinated density shifts
  avril:     0.50,  // strong — orchestral balance
  disco:     0.35,  // moderate
  downtempo: 0.45,  // strong — breathing together
  blockhead: 0.30,  // moderate
  lofi:      0.55,  // strong — trio awareness
  flim:      0.40,  // moderate
  xtal:      0.35,  // moderate
  syro:      0.20,  // weak — IDM layers are independent
  ambient:   0.50,  // strong — ensemble breathing
};

/**
 * Layer density interaction: complementary pairs thin when partner is busy.
 */
const COMPLEMENTARY_PAIRS: Record<string, string[]> = {
  melody:    ['arp', 'harmony'],
  arp:       ['melody', 'texture'],
  harmony:   ['melody', 'atmosphere'],
  texture:   ['arp'],
  drone:     [],
  atmosphere:['harmony'],
};

/**
 * Calculate density correction for a layer based on its neighbors' activity.
 *
 * @param layerName This layer's name
 * @param neighborDensities Map of layer name → density (0-1)
 * @param mood Current mood
 * @returns Density multiplier (0.7 - 1.3)
 */
export function densityGradientCorrection(
  layerName: string,
  neighborDensities: Record<string, number>,
  mood: Mood
): number {
  const coupling = GRADIENT_COUPLING[mood];
  const partners = COMPLEMENTARY_PAIRS[layerName] ?? [];
  if (partners.length === 0) return 1.0;

  let totalPartnerDensity = 0;
  let count = 0;
  for (const partner of partners) {
    if (partner in neighborDensities) {
      totalPartnerDensity += neighborDensities[partner];
      count++;
    }
  }
  if (count === 0) return 1.0;

  const avgPartner = totalPartnerDensity / count;
  // High partner density → thin this layer (complementary)
  const correction = (0.5 - avgPartner) * coupling * 0.6;
  return Math.max(0.7, Math.min(1.3, 1.0 + correction));
}

/**
 * Get gradient coupling for a mood (for testing).
 */
export function gradientCoupling(mood: Mood): number {
  return GRADIENT_COUPLING[mood];
}
