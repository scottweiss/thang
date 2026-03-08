/**
 * Energy conservation — total system energy stays within bounds.
 *
 * With 6 layers each applying multiple gain adjustments, the
 * combined output can creep above comfortable levels. This module
 * provides a soft limiter that reduces gain when total estimated
 * energy exceeds a mood-appropriate ceiling.
 */

import type { Mood } from '../types';

/**
 * Per-mood energy ceiling (lower = more conservative limiting).
 */
const ENERGY_CEILING: Record<Mood, number> = {
  trance:    0.85,  // moderate — loud OK
  avril:     0.80,  // moderate — dynamic range
  disco:     0.90,  // high — party loud
  downtempo: 0.70,  // low — chill
  blockhead: 0.85,  // moderate — punchy
  lofi:      0.65,  // low — intimate
  flim:      0.70,  // low — delicate
  xtal:      0.65,  // low — airy
  syro:      0.80,  // moderate — dense OK
  ambient:   0.55,  // lowest — spacious
};

/**
 * Calculate energy conservation gain multiplier.
 *
 * @param layerGains Array of current layer gains (0-1 each)
 * @param mood Current mood
 * @returns Gain multiplier (0.70 - 1.0)
 */
export function energyConservationGain(
  layerGains: number[],
  mood: Mood
): number {
  const ceiling = ENERGY_CEILING[mood];

  // RMS-like energy estimate
  let sumSquares = 0;
  for (const g of layerGains) {
    sumSquares += g * g;
  }
  const rmsEnergy = Math.sqrt(sumSquares / Math.max(1, layerGains.length));

  if (rmsEnergy <= ceiling) return 1.0;

  // Soft compression above ceiling
  const overshoot = rmsEnergy - ceiling;
  const reduction = overshoot * 0.8;
  return Math.max(0.70, 1.0 - reduction);
}

/**
 * Get energy ceiling for a mood (for testing).
 */
export function energyCeiling(mood: Mood): number {
  return ENERGY_CEILING[mood];
}
