/**
 * Spectral energy distribution — ensure frequency energy across bands.
 *
 * Good mixes distribute energy across low, mid, and high frequency bands.
 * If too many layers occupy the same band, the mix sounds unbalanced.
 * This module scores the spectral distribution and suggests LPF/HPF
 * corrections to spread energy.
 *
 * Applied as LPF correction for frequency balance.
 */

import type { Mood } from '../types';

/**
 * Per-mood balance strictness (higher = more correction applied).
 */
const BALANCE_STRICTNESS: Record<Mood, number> = {
  trance:    0.45,  // moderate — clean separation
  avril:     0.50,  // moderate — orchestral balance
  disco:     0.40,  // moderate
  downtempo: 0.35,  // moderate
  blockhead: 0.55,  // high — needs punch
  lofi:      0.30,  // low — warmth OK
  flim:      0.40,  // moderate
  xtal:      0.45,  // moderate
  syro:      0.25,  // low — chaos OK
  ambient:   0.50,  // moderate — spread important
};

/**
 * Frequency band classification for a layer.
 */
type Band = 'low' | 'mid' | 'high';

/**
 * Classify a layer's primary frequency band.
 *
 * @param layerName Layer identifier
 * @returns Primary frequency band
 */
export function layerBand(layerName: string): Band {
  switch (layerName) {
    case 'drone': return 'low';
    case 'harmony': return 'mid';
    case 'melody': return 'high';
    case 'texture': return 'mid';
    case 'arp': return 'high';
    case 'atmosphere': return 'low';
    default: return 'mid';
  }
}

/**
 * Score the spectral distribution of active layers.
 *
 * @param activeLayers Array of active layer names
 * @returns Balance score (0.0 = unbalanced, 1.0 = perfectly spread)
 */
export function spectralDistributionScore(activeLayers: string[]): number {
  if (activeLayers.length === 0) return 1.0;

  const counts = { low: 0, mid: 0, high: 0 };
  for (const layer of activeLayers) {
    counts[layerBand(layer)]++;
  }

  const total = activeLayers.length;
  const ideal = total / 3;
  let deviation = 0;
  for (const band of ['low', 'mid', 'high'] as Band[]) {
    deviation += Math.abs(counts[band] - ideal);
  }

  return Math.max(0, 1.0 - deviation / total);
}

/**
 * LPF correction for spectral balance.
 *
 * @param layerName Layer to correct
 * @param activeLayers All active layers
 * @param mood Current mood
 * @returns LPF multiplier (0.8 - 1.2)
 */
export function spectralBalanceLpf(
  layerName: string,
  activeLayers: string[],
  mood: Mood
): number {
  const strictness = BALANCE_STRICTNESS[mood];
  const score = spectralDistributionScore(activeLayers);

  if (score > 0.7) return 1.0; // balanced enough

  const band = layerBand(layerName);
  const counts = { low: 0, mid: 0, high: 0 };
  for (const layer of activeLayers) {
    counts[layerBand(layer)]++;
  }

  // If this layer's band is overcrowded, darken it slightly
  const ideal = activeLayers.length / 3;
  const excess = counts[band] - ideal;
  if (excess > 0) {
    return Math.max(0.8, 1.0 - excess * strictness * 0.15);
  }
  // If this layer's band is underpopulated, brighten
  if (excess < -0.5) {
    return Math.min(1.2, 1.0 + Math.abs(excess) * strictness * 0.1);
  }
  return 1.0;
}

/**
 * Get balance strictness for a mood (for testing).
 */
export function balanceStrictness(mood: Mood): number {
  return BALANCE_STRICTNESS[mood];
}
